const { Products, SaleDetails, StockBatch, Sales } = require("../../models");
const AppError = require("../../utils/AppError");

const getProductMetricsById = async (id) => {
  try {
    if (!id) {
      throw new AppError("Product ID is required", 400);
    }

    const product = await Products.findOne({
      where: { product_id: id },
      include: [
        {
          model: StockBatch,
          as: "stockBatches",
        },
      ],
    });

    if (!product) {
      throw new AppError("Product Not Found", 404);
    }

    const productSaleDetails = await SaleDetails.findAll({
      where: { product_id: id },
    });

    let metrics = {
      totalRevenue: 0,
      totalProfit: 0,
      totalQuantitySold: 0,
      totalCost: 0,
      avgBuyPrice: 0,
    };

    if (productSaleDetails.length > 0) {
      // Use reduce for efficient calculation
      metrics = productSaleDetails.reduce(
        (acc, detail) => {
          const quantity = Number(detail.quantity) || 0;
          const sellPrice = Number(detail.sell_price) || 0;
          const buyPrice = Number(detail.buy_price) || 0;
          const subtotal = Number(detail.subtotal) || 0;

          // If both buy_price and sell_price are negative, subtract from profit
          let profitChange = (sellPrice - buyPrice) * quantity;
          if (buyPrice < 0 && sellPrice < 0) {
            profitChange = -profitChange;
          }

          return {
            totalRevenue: acc.totalRevenue + subtotal,
            totalProfit: acc.totalProfit + profitChange,
            totalQuantitySold: acc.totalQuantitySold + quantity,
            totalCost: acc.totalCost + buyPrice * quantity,
            avgBuyPrice:
              (acc.totalCost + buyPrice * quantity) /
              (acc.totalQuantitySold + quantity),
          };
        },
        {
          totalRevenue: 0,
          totalProfit: 0,
          totalQuantitySold: 0,
          totalCost: 0,
          avgBuyPrice: 0,
        },
      );

      const profitMargin =
        metrics.totalRevenue > 0
          ? ((metrics.totalProfit / metrics.totalRevenue) * 100).toFixed(2)
          : 0;
    }

    const totalStock = product.stockBatches.reduce((acc, stok) => {
      acc += Number(stok.remainingQuantity);
      return acc;
    }, 0);

    return {
      name: product.name,
      productRevenue: parseFloat(metrics?.totalRevenue.toFixed(2)),
      productProfit: parseFloat(metrics?.totalProfit.toFixed(2)),
      totalQuantitySold: metrics?.totalQuantitySold,
      avgBuyPrice: parseFloat(metrics?.avgBuyPrice.toFixed(2)),
      totalCost: parseFloat(metrics?.totalCost.toFixed(2)),
      totalStock: totalStock,
    };
  } catch (error) {
    throw error;
  }
};
const getProductSales = async (id) => {
  try {
    const sales = await SaleDetails.findAll({
      where: {
        product_id: id,
      },
      include: {
        model: Sales,
        as: "sale",
      },
    });

    return sales;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getProductMetricsById,
  getProductSales,
};
