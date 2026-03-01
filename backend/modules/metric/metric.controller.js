const express = require("express");
const router = express.Router();
const {
  Sales,
  SaleDetails,
  Products,
  sequelize,
  Sequelize,
  ProductStock,
  StockTransactions,
  Op,
  SupplierTransactions,
  Suppliers,
  StockBatch,
} = require("../../models");
const { GetSupplierDebt } = require("../supplier/supplier.service");
const { getProductMetricsById, getProductSales } = require("./metric.service");

router.post("/sale", async (req, res) => {
  const userId = req.user.id;

  const { from, to } = req.body;

  try {
    const sales = await Sales.findAll({
      where: {
        user_id: userId,
        date: {
          [Op.between]: [from, to],
        },
      },
      include: [
        {
          model: SaleDetails,
          as: "details",
          attributes: ["sell_price", "buy_price", "quantity"],
        },
      ],
    });

    let totalRevenue = 0;
    let totalProfit = 0;
    let totalSales = 0; // Satış sayı yalnız 'sale' üçün
    let totalStockCost = 0;

    sales.forEach((sale) => {
      const isReturn = sale.transaction_type === "return";

      const subtotal = Number(sale.subtotal_amount);
      const discountTotal = Number(sale.discounted_amount);

      sale.details.forEach((detail) => {
        const qty = Number(detail.quantity);
        const sell = Number(detail.sell_price);
        const buy = Number(detail.buy_price);

        const lineGross = sell * qty;

        const discountShare =
          subtotal > 0 ? (lineGross / subtotal) * discountTotal : 0;

        const revenue = lineGross - discountShare;
        const cost = buy * qty;
        const profit = revenue - cost;

        // ✅ SALE / RETURN düzgün fərqlənir
        totalRevenue += isReturn ? -revenue : revenue;
        totalStockCost += isReturn ? cost : -cost;
        totalProfit += isReturn ? -profit : profit;
      });

      if (!isReturn) totalSales++;
    });

    res.json({
      totalRevenue: totalRevenue.toFixed(2) + " ₼",
      totalSales, // yalnız `sale` sayılır
      totalProfit: totalProfit.toFixed(2) + " ₼",
      totalStockCost: totalStockCost.toFixed(2) + " ₼",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/products", async (req, res) => {
  try {
    const products = await Products.findAll({
      attributes: [
        "product_id",
        "name",
        "barcode",
        "sellPrice",
        "buyPrice",
        "unit",
      ],

      order: [["name", "ASC"]],
      raw: true,
      nest: true,
      subQuery: false,
    });

    if (products.length === 0) {
      return res.json([]);
    }

    // Sayılar yoksa 0, varsa binlik ayraçlı string olarak döndürülür
    const totalProducts = products?.length || 0;
    const kgBasedProducts =
      products?.filter((p) => p.unit === "kg").length || 0;
    const pieceBasedProducts =
      products?.filter((p) => p.unit === "piece").length || 0;

    const stockBatches = await StockBatch.findAll({
      where: {
        remainingQuantity: { [Op.ne]: 0 },
      },
    });

    const stockCostResult = stockBatches.reduce((sum, batch) => {
      const unitCost = Number(batch.unitCost) || 0;
      const remainingQty = Number(batch.remainingQuantity) || 0;
      const result = unitCost * remainingQty;
      return sum + result;
    }, 0);

    res.json({
      totalProducts: totalProducts.toLocaleString("tr-TR"),
      kgBasedProducts: kgBasedProducts.toLocaleString("tr-TR"),
      pieceBasedProducts: pieceBasedProducts.toLocaleString("tr-TR"),
      totalStock: stockCostResult.toFixed(2),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/products/:id", async (req, res, next) => {
  try {
    const product = await getProductMetricsById(req.params.id);
    res.json(product);
  } catch (error) {
    next(error);
  }
});

router.get("/products-sales/:id", async (req, res, next) => {
  try {
    const sales = await getProductSales(req.params.id);

    res.json(sales);
  } catch (error) {
    next(error);
  }
});

router.post("/products-sold", async (req, res) => {
  const { from, to } = req.body;

  try {
    // İlgili tarihlerdeki satış detaylarını çek
    const sales = await Sales.findAll({
      where: {
        date: {
          [Op.between]: [from, to],
        },
      },
      include: [
        {
          model: SaleDetails,
          as: "details",
          attributes: ["buy_price", "quantity"],
        },
      ],
    });

    let quantitySold = 0;
    let totalStockCost = 0;

    sales.forEach((sale) => {
      if (Array.isArray(sale.details)) {
        sale.details.forEach((detail) => {
          const qty = Number(detail.quantity) || 0;
          const buyPrice = Number(detail.buy_price) || 0;
          quantitySold += qty;
          totalStockCost += buyPrice * qty;
        });
      }
    });

    res.json({
      quantitySold: quantitySold.toLocaleString("tr-TR"),
      totalStockCost: totalStockCost.toFixed(2) + " ₼",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/dashboard", async (req, res) => {
  const { from, to } = req.body;

  try {
    const sales = await Sales.findAll({
      where: {
        date: {
          [Op.between]: [from, to],
        },
      },
      include: [
        {
          model: SaleDetails,
          as: "details",
          attributes: ["sell_price", "buy_price", "quantity"],
        },
      ],
    });

    let totalRevenue = 0;
    let totalProfit = 0;
    let totalSales = 0; // yalnız `type === 'sale'` sayılacaq
    sales.forEach((sale) => {
      const isReturn = sale.transaction_type === "return";

      if (!isReturn) totalSales++;

      if (Array.isArray(sale.details)) {
        sale.details.forEach((detail) => {
          const quantity = Number(detail.quantity);
          const revenue = Number(detail.sell_price) * quantity;
          const cost = Number(detail.buy_price) * quantity;
          const profit = revenue - cost;

          const sign = isReturn ? -1 : 1;

          totalRevenue += revenue * sign;
          totalProfit += profit * sign;
        });
      }
      if (!isReturn && sale.discounted_amount) {
        const discount = Number(sale.discounted_amount);
        totalRevenue -= discount;
        totalProfit -= discount;
      }
    });

    const stockBatches = await StockBatch.findAll({
      where: {
        remainingQuantity: { [Op.gt]: 0 },
      },
    });

    const stockCostResult = stockBatches.reduce((sum, batch) => {
      const unitCost = Number(batch.unitCost) || 0;
      const remainingQty = Number(batch.remainingQuantity) || 0;
      return sum + unitCost * remainingQty;
    }, 0);

    res.json({
      totalRevenue: totalRevenue.toFixed(2) + " ₼",
      totalSales,
      totalProfit: totalProfit.toFixed(2) + " ₼",
      totalStockCost: stockCostResult.toFixed(2) + " ₼",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/bestSellers", async (req, res) => {
  try {
    // En çok satılan 20 ürünü bul
    const bestSellers = await SaleDetails.findAll({
      attributes: [
        "product_id",
        [sequelize.fn("SUM", sequelize.col("saleDetails.quantity")), "sold"],
      ],
      group: [
        "saleDetails.product_id",
        "product.product_id",
        "product.name",
        "product.barcode",
      ],
      order: [[sequelize.literal("sold"), "DESC"]],
      limit: 10,
      include: [
        {
          model: Products,
          as: "product",
          attributes: ["product_id", "name", "barcode"],
        },
      ],
      raw: true,
      nest: true,
    });

    // Kalan ürünleri bul (bestSeller olmayanlar)
    const bestSellerIds = bestSellers.map((item) => item.product_id);

    // Tüm ürün ID'lerini al
    const allProductIds = [
      ...bestSellerIds,
      ...(
        await Products.findAll({
          where: { product_id: { [Op.notIn]: bestSellerIds } },
          attributes: ["product_id"],
          raw: true,
        })
      ).map((p) => p.product_id),
    ];

    // StockBatch'lerden kalan miktarları topla
    const stockBatches = await StockBatch.findAll({
      where: { productId: allProductIds, remainingQuantity: { [Op.ne]: 0 } },
      attributes: ["productId", "remainingQuantity"],
      raw: true,
    });

    // Her ürün için stok miktarını hesapla (remainingQuantity toplamı)
    const stockMap = {};
    stockBatches.forEach((batch) => {
      const qty = Number(batch.remainingQuantity) || 0;
      stockMap[batch.productId] = (stockMap[batch.productId] || 0) + qty;
    });

    // Sonuçları birleştir - yalnız best sellers
    const result = bestSellers.map((item) => ({
      product_id: item.product_id,
      name: item.product.name,
      barcode: item.product.barcode,
      sold: Number(item.sold),
      stock: stockMap[item.product_id] ?? 0,
    }));

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

function getWeekNumber(date) {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const weekNumber =
    Math.round(
      ((target - firstThursday) / 86400000 -
        3 +
        ((firstThursday.getDay() + 6) % 7)) /
        7,
    ) + 1;
  return weekNumber;
}

router.get("/revenue", async (req, res) => {
  try {
    const { type = "daily" } = req.query;
    const sales = await Sales.findAll();
    const totals = {};

    sales.forEach((sale) => {
      const dateObj = new Date(sale.date);
      let key;

      switch (type) {
        case "hourly":
          key = `${dateObj.getFullYear()}-${String(
            dateObj.getMonth() + 1,
          ).padStart(2, "0")}-${String(dateObj.getDate()).padStart(
            2,
            "0",
          )} ${String(dateObj.getHours()).padStart(2, "0")}:00`;
          break;
        case "daily":
          key = `${String(dateObj.getMonth() + 1).padStart(
            2,
            "0",
          )}-${String(dateObj.getDate()).padStart(2, "0")}`;
          break;
        case "weekly":
          const weekStart = new Date(dateObj);
          weekStart.setDate(weekStart.getDate() - weekStart.getDay());
          key = `${weekStart.getFullYear()}-W${getWeekNumber(weekStart)}`;
          break;
        case "monthly":
          key = `${dateObj.getFullYear()}-${String(
            dateObj.getMonth() + 1,
          ).padStart(2, "0")}`;
          break;
        default:
          return res.status(400).json({ error: "Invalid type parameter" });
      }

      const amount = Number(sale.total_amount || 0);

      totals[key] = (totals[key] || 0) + amount;
    });

    let result = Object.entries(totals).map(([date, revenue]) => ({
      date,
      revenue: Number(revenue.toFixed(2)),
    }));

    result = result.filter((item) => item.revenue !== 0);

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/profit", async (req, res) => {
  try {
    const { type = "daily" } = req.query;
    const sales = await Sales.findAll({
      include: [
        {
          model: SaleDetails,
          as: "details",
          attributes: ["sell_price", "buy_price", "quantity"],
        },
      ],
    });

    const profits = {};

    sales.forEach((sale) => {
      const dateObj = new Date(sale.date);
      let key;

      switch (type) {
        case "hourly":
          key = `${dateObj.getFullYear()}-${String(
            dateObj.getMonth() + 1,
          ).padStart(2, "0")}-${String(dateObj.getDate()).padStart(
            2,
            "0",
          )} ${String(dateObj.getHours()).padStart(2, "0")}:00`;
          break;
        case "daily":
          key = `${dateObj.getFullYear()}-${String(
            dateObj.getMonth() + 1,
          ).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")}`;
          break;
        case "weekly":
          const weekStart = new Date(dateObj);
          weekStart.setDate(weekStart.getDate() - weekStart.getDay());
          key = `${weekStart.getFullYear()}-W${getWeekNumber(weekStart)}`;
          break;
        case "monthly":
          key = `${dateObj.getFullYear()}-${String(
            dateObj.getMonth() + 1,
          ).padStart(2, "0")}`;
          break;
        default:
          return res.status(400).json({ error: "Invalid type parameter" });
      }

      let totalProfit = 0;

      if (Array.isArray(sale.details)) {
        sale.details.forEach((detail) => {
          const sellPrice = Number(detail.sell_price) || 0;
          const buyPrice = Number(detail.buy_price) || 0;
          const quantity = Number(detail.quantity) || 0;

          if (buyPrice !== 0) {
            const profit = (sellPrice - buyPrice) * quantity;

            if (sale.transaction_type === "return") {
              totalProfit -= profit;
            } else {
              totalProfit += profit;
            }
          }
        });
      }

      profits[key] = (profits[key] || 0) + totalProfit;
    });

    const result = Object.entries(profits).map(([date, profit]) => ({
      date,
      profit: Number(profit.toFixed(2)),
    }));

    const totalProfit = result.reduce((sum, item) => sum + item.profit, 0);
    const average =
      result.length > 0 ? Number((totalProfit / result.length).toFixed(2)) : 0;

    res.json({
      average: average + " ₼",
      data: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/payments-total", async (req, res) => {
  try {
    const suppliers = await Suppliers.findAll();

    if (!suppliers || suppliers.length === 0) {
      return res.json({ total: 0, supplierCount: 0 });
    }

    let total = 0;

    // bütün supplier-lərin borcunu hesabla
    await Promise.all(
      suppliers.map(async (supplier) => {
        const supplierDebt = await GetSupplierDebt(supplier.id);
        total += Number(supplierDebt || 0);
      }),
    );

    const supplierCount = suppliers.length;

    res.json({ total: total.toFixed(2), supplierCount });
  } catch (error) {
    console.error("Error calculating total payments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
