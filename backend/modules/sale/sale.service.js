const {
  Sales,
  SaleDetails,
  Products,
  SalePayments,
  Op,
  sequelize,
  SyncQueue,
  StockBatch,
  SaleReturns,
} = require("../../models");
const AppError = require("../../utils/AppError");
const moment = require("moment");
const { consumeStockFIFO } = require("../product/stockBatch.service");

const createSale = async (data) => {
  try {
    const { products, payments, discount, type, userId } = data;

    if (!Array.isArray(products) || products.length === 0) {
      throw new AppError("Products array cannot be empty", 400);
    }

    if (!payments || payments.length === 0) {
      throw new AppError("At least one payment is required", 400);
    }

    let subtotalAmount = 0;
    const preparedDetails = [];

    for (const item of products) {
      const { barcode, quantity = 1 } = item;

      if (quantity <= 0) {
        throw new AppError("Quantity must be greater than 0", 400);
      }

      const product = await Products.findOne({ where: { barcode } });
      if (!product) {
        throw new AppError(`Product with barcode ${barcode} not found`, 404);
      }

      const subtotal = product.sellPrice * quantity;
      subtotalAmount += subtotal;

      preparedDetails.push({
        product_id: product.product_id,
        product_name: product.name,
        quantity,
        sell_price: product.sellPrice,
      });
    }

    const discountRate = discount ? discount / 100 : 0;
    const discountedAmount = Number((subtotalAmount * discountRate).toFixed(2));
    const totalAmount = Number((subtotalAmount - discountedAmount).toFixed(2));

    // 👉 Fiş için detail array
    const receiptDetails = [];

    const result = await sequelize.transaction(async (t) => {
      const sale = await Sales.create(
        {
          total_amount: totalAmount,
          subtotal_amount: subtotalAmount,
          discount: discount || 0,
          discounted_amount: discountedAmount,
          transaction_type: type || "sale",
          user_id: userId,
        },
        { transaction: t },
      );

      let totalCost = 0;

      for (const detail of preparedDetails) {
        if (type === "sale") {
          const fifoResult = await consumeStockFIFO(
            detail.product_id,
            detail.quantity,
            t,
          );

          totalCost += fifoResult.totalCost;

          for (const batch of fifoResult.batchConsumptions) {
            const subtotal = batch.quantity * detail.sell_price;

            await SaleDetails.create(
              {
                sale_id: sale.sale_id,
                product_id: detail.product_id,
                batch_id: batch.batchId,
                quantity: batch.quantity,
                subtotal,
                buy_price: batch.unitCost,
                sell_price: detail.sell_price,
              },
              { transaction: t },
            );

            receiptDetails.push({
              name: detail.product_name,
              quantity: batch.quantity,
              sellPrice: detail.sell_price,
              subtotal,
            });
          }
        } else if (type === "return") {
          // 🔵 RETURN → Stok geri ekleme
          await StockBatch.increment(
            { remainingQuantity: detail.quantity },
            {
              where: { productId: detail.product_id },
              transaction: t,
            },
          );

          const subtotal = detail.quantity * detail.sell_price;

          await SaleDetails.create(
            {
              sale_id: sale.sale_id,
              product_id: detail.product_id,
              quantity: detail.quantity,
              subtotal,
              buy_price: 0, // return’da cost genelde gerekmez
              sell_price: detail.sell_price,
            },
            { transaction: t },
          );

          receiptDetails.push({
            name: detail.product_name,
            quantity: detail.quantity,
            sellPrice: detail.sell_price,
            subtotal,
          });
        }
      }

      const paymentRows = payments.map((p) => ({
        sale_id: sale.sale_id,
        payment_type: p.payment_type,
        amount: p.amount,
      }));

      await SalePayments.bulkCreate(paymentRows, { transaction: t });

      return { sale, totalCost };
    });

    return {
      message: "Sale completed successfully",
      sale: result.sale,
    };
  } catch (error) {
    throw error;
  }
};

const returnSaleById = async (saleId, reason) => {
  return await sequelize.transaction(async (t) => {
    const sale = await Sales.findByPk(saleId, {
      transaction: t,
      include: [
        { model: SaleDetails, as: "details" },
        { model: SalePayments, as: "payments" },
      ],
    });

    if (!sale) throw new AppError("Sale not found", 404);

    if (sale.transaction_type === "return") {
      throw new AppError("This sale is already a return", 400);
    }

    // 🔒 Çifte iade kontrolü
    const existingReturn = await Sales.findOne({
      where: {
        sale_id: saleId,
        transaction_type: "return",
      },
      transaction: t,
    });

    if (existingReturn) {
      throw new AppError("Sale already returned", 400);
    }

    // 1️⃣ Return Sale oluştur
    const returnSale = await Sales.create(
      {
        total_amount: -sale.total_amount,
        subtotal_amount: -sale.subtotal_amount,
        discount: sale.discount,
        discounted_amount: sale.discounted_amount,
        transaction_type: "return",
      },
      { transaction: t },
    );

    // 2️⃣ Stok geri ekleme + detail oluşturma
    for (const detail of sale.details) {
      const batch = await StockBatch.findByPk(detail.batch_id, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!batch) {
        throw new AppError("Batch not found during return", 500);
      }

      batch.remainingQuantity += Number(detail.quantity);
      await batch.save({ transaction: t });

      await SaleDetails.create(
        {
          sale_id: returnSale.sale_id,
          product_id: detail.product_id,
          batch_id: detail.batch_id,
          quantity: -detail.quantity,
          subtotal: -detail.subtotal,
          buy_price: -detail.buy_price,
          sell_price: -detail.sell_price,
        },
        { transaction: t },
      );
    }

    for (const payment of sale.payments) {
      await SalePayments.create(
        {
          sale_id: returnSale.sale_id,
          payment_type: payment.payment_type,
          amount: payment.amount,
        },
        { transaction: t },
      );
    }

    // 🔹 Return kaydı (SADECE 1 TANE)
    await SaleReturns.create(
      {
        sale_id: saleId,
        reason: reason || "Customer Return",
      },
      { transaction: t },
    );

    return returnSale;
  });
};

const getAllSales = async (from, to, userId) => {
  // Parse the from date explicitly
  const fromDate = new Date(from);
  let toDate = to ? new Date(to) : new Date(from);
  if (!to) toDate.setHours(23, 59, 59, 999); // Set to 23:59:59.999 of the same day

  // Validate dates
  const isValidDate = (date) => date instanceof Date && !isNaN(date);
  if (!isValidDate(fromDate) || !isValidDate(toDate)) {
    throw new AppError("Invalid date format", 400);
  }
  try {
    const sales = await Sales.findAll({
      where: {
        user_id: userId,
        date: {
          [Op.between]: [fromDate, toDate],
        },
      },
      order: [["date", "DESC"]],
      include: [
        {
          model: SaleDetails,
          as: "details",
          attributes: ["sell_price", "buy_price", "quantity"],
          required: false,
        },
        {
          model: SalePayments,
          as: "payments",
          attributes: ["payment_type", "amount"],
          required: false,
        },
        {
          model: SaleReturns,
          as: "return",
          attributes: ["sale_id"],
          required: false,
        },
      ],
    });

    // Nakit ve kart toplamlarını hesapla
    let cashTotal = 0;
    let cardTotal = 0;

    sales.forEach((sale) => {
      sale.payments?.forEach((payment) => {
        const rawAmount = Number(payment.amount);
        if (isNaN(rawAmount)) return;

        const amount = Math.abs(rawAmount); // 💥 ƏSAS DÜZƏLİŞ
        const type = payment.payment_type?.trim().toLowerCase();

        const sign = sale.transaction_type === "sale" ? 1 : -1; // return/refund → -1

        if (type === "cash") {
          cashTotal += amount * sign;
        }

        if (type === "card") {
          cardTotal += amount * sign;
        }
      });
    });

    const formattedSales = sales.map((sale) => {
      const details = sale.details;

      let profit = 0;
      if (Array.isArray(details)) {
        profit = details.reduce((sum, d) => {
          const discountedAmount = sale.discounted_amount;
          if (sale.transaction_type === "return") {
            return (
              sum -
              (Number(d.sell_price) - Number(d.buy_price)) *
                Number(d.quantity || 0)
            );
          } else if (
            sale.transaction_type === "sale" &&
            sale.discount &&
            sale.discount > 0
          ) {
            return (
              sum +
              (Number(d.sell_price) - Number(d.buy_price)) *
                Number(d.quantity || 0) -
              discountedAmount
            );
          } else {
            return (
              sum +
              (Number(d.sell_price) - Number(d.buy_price)) *
                Number(d.quantity || 0)
            );
          }
        }, 0);
      }

      return {
        sale_id: sale.sale_id,
        totalAmount: sale.total_amount,
        subtotalAmount: sale.subtotal_amount,
        discountedAmount: sale.discounted_amount,
        transactionType: sale.transaction_type,
        returned: sale?.return?.sale_id ? true : false,
        date: moment(sale.date).tz("Asia/Dubai").format("DD-MM-YYYY HH:mm:ss"),
        profit: Number(profit.toFixed(2)),
      };
    });
    return {
      sales: formattedSales,
      paymentTotals: {
        cash: cashTotal.toFixed(2) + " ₼",
        card: cardTotal.toFixed(2) + " ₼",
      },
    };
  } catch (err) {
    throw err;
  }
};

const getSaleDetailsById = async (id, userId) => {
  try {
    if (!id) {
      throw new AppError("Sale ID is required", 400);
    }
    const sale = await Sales.findByPk(id, {
      include: [
        {
          model: SaleDetails,
          as: "details",
          include: [
            {
              model: Products,
              as: "product",
            },
          ],
        },
        {
          model: SalePayments,
          as: "payments",
        },
      ],
    });
    if (!sale) throw new AppError("Sale not found", 404);

    const response = {
      saleId: sale.sale_id,
      totalAmount: sale.total_amount + " ₼",
      paymentMethod: sale.payment_method,
      transactionType: sale.transaction_type,
      discount: sale.discount + " %",
      discountedAmount: sale.discounted_amount + " ₼",
      payments: sale.payments.map((payment) => ({
        payment_type: payment.payment_type,
        amount: payment.amount,
      })),
      subtotalAmount: sale.subtotal_amount + " ₼",
      date: moment(sale.date).tz("Asia/Dubai").format("DD-MM-YYYY HH:mm:ss"),
      details: sale.details.map((detail) => ({
        quantity: detail.quantity,
        subtotal: detail.subtotal + " ₼",
        id: detail.product.id,
        name: detail.product.name,
        barcode: detail.product.barcode,
        sellPrice: detail.product.sellPrice + " ₼",
      })),
    };

    return response;
  } catch (error) {
    throw error;
  }
};

const getSalePreview = async (items, discount) => {
  const resultItems = [];

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new AppError("Items array is required", 400);
  }

  try {
    const grouped = {};
    const baseCodesForWeighted = new Set();

    // Step 1: Identify all unique barcodes to fetch at once
    const barcodesToFetch = new Set();
    for (const { barcode } of items) {
      barcodesToFetch.add(barcode);
      if (barcode.length === 13 && barcode.startsWith("22")) {
        const baseCode = barcode.substring(0, 7);
        baseCodesForWeighted.add(`${baseCode}%`);
      }
    }

    // Step 2: Fetch ALL products in 2 queries (batch instead of N queries)
    const allProducts = await Products.findAll({
      where: { barcode: Array.from(barcodesToFetch) },
      attributes: ["barcode", "name", "sellPrice", "product_id"],
    });

    let weightedProducts = [];
    if (baseCodesForWeighted.size > 0) {
      weightedProducts = await Products.findAll({
        where: {
          [Op.or]: Array.from(baseCodesForWeighted).map((pattern) => ({
            barcode: { [Op.like]: pattern },
          })),
        },
        attributes: ["barcode"],
      });
    }

    // Step 3: Create lookup maps for O(1) access
    const productMap = new Map(allProducts.map((p) => [p.barcode, p]));
    const weightedMap = new Map(
      weightedProducts.map((p) => [p.barcode.substring(0, 7), p]),
    );

    // Step 4: Process items without await loops
    for (const { barcode, quantity: sentQuantity } of items) {
      let productBarcode = barcode;
      let quantity = sentQuantity || 1;
      let unit = "piece";

      // Tartım barkodu kontrolü
      if (barcode.length === 13 && barcode.startsWith("22")) {
        const baseCode = barcode.substring(0, 7);
        const kgProduct = productMap.get(barcode) || weightedMap.get(baseCode);

        if (kgProduct) {
          productBarcode = kgProduct.barcode;
          quantity = sentQuantity || 1;
          unit = "kg";
        } else {
          // Yoksa tartım barkodu olarak işle
          const weightStr = barcode.substring(7, 12);
          const weight = parseInt(weightStr, 10);
          quantity = weight / 1000;
          unit = "kg";

          const baseProduct = weightedMap.get(baseCode);
          if (!baseProduct) continue;
          productBarcode = baseProduct.barcode;
        }
      }

      // Aynı ürün daha önce eklenmişse quantity'yi topla
      if (!grouped[productBarcode]) {
        grouped[productBarcode] = {
          productBarcode,
          quantity,
          unit,
        };
      } else {
        grouped[productBarcode].quantity += quantity;
      }
    }

    // 🧮 Hesapla ve response oluştur (using cached productMap)
    for (const productBarcode in grouped) {
      const { quantity, unit } = grouped[productBarcode];
      const product = productMap.get(productBarcode);

      if (!product) continue;

      const subtotal = parseFloat(product.sellPrice) * quantity;

      resultItems.push({
        name: product.name,
        barcode: product.barcode,
        quantity,
        unit,
        sellPrice: parseFloat(product.sellPrice),
        subtotal,
      });
    }
    let subtotal = resultItems.reduce((acc, item) => acc + item.subtotal, 0);

    let total = subtotal;
    let discountAmount = 0;

    if (discount && discount > 0) {
      const discountRate = discount / 100;
      discountAmount = parseFloat((subtotal * discountRate).toFixed(2));
      total = parseFloat((subtotal - discountAmount).toFixed(2));
    }

    return {
      subtotal,
      total: total,
      items: resultItems,
      discountAmount: discountAmount.toFixed(2),
    };
  } catch (error) {
    throw error;
  }
};

const getSaleById = async (id, userId) => {
  try {
    if (!id) {
      throw new AppError("Sale ID is required", 400);
    }
    const sale = await Sales.findOne({
      where: { sale_id: id, user_id: userId },
      include: [
        {
          model: SaleDetails,
          as: "details",
          include: [
            {
              model: Products,
              as: "product",
            },
          ],
        },
        {
          model: SalePayments,
          as: "payments",
        },
      ],
    });
    if (!sale) throw new AppError("Sale not found", 404);

    const response = {
      saleId: sale.sale_id,
      totalAmount: sale.total_amount,
      payments: sale.payments,
      date: moment(sale.date).tz("Asia/Dubai").format("DD-MM-YYYY HH:mm:ss"),
      discountedAmount: sale.discounted_amount,
      details: sale.details.map((detail) => ({
        quantity: parseFloat(detail.quantity).toFixed(2),
        subtotal: detail.subtotal,
        id: detail.product.id,
        name: detail.product.name,
        barcode: detail.product.barcode,
        sellPrice: detail.product.sellPrice,
      })),
    };

    return response;
  } catch (error) {
    throw error;
  }
};

const deleteSaleById = async (id) => {
  try {
    if (!id) {
      throw new AppError("Sale ID is required", 400);
    }
    const sale = await Sales.findByPk(id, {
      include: [{ model: SaleDetails, as: "details" }],
    });
    if (!sale) throw new AppError("Sale not found", 404);
    await sale.destroy();
    return { message: "Sale deleted successfully" };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getSaleById,
  returnSaleById,
  getAllSales,
  getSaleDetailsById,
  getSalePreview,
  createSale,
  deleteSaleById,
};
