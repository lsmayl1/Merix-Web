const {
  Sales,
  SalePayments,
  ProductStock,
  StockBatch,
  Products,
} = require("../models/index");

const TableMigrationSale = async () => {
  try {
    const productStock = await ProductStock.findAll({
      include: {
        model: Products,
        as: "product",
      },
    });

    if (productStock.length > 0) {
      console.log("Sale migration started");

      for (const stock of productStock) {
        const currentStock = Number(stock.current_stock);
        const safeStock = Number.isNaN(currentStock) ? 0 : currentStock;

        await StockBatch.create({
          productId: stock.product_id,
          remainingQuantity: safeStock,
          unitCost: Number(stock.product?.buyPrice) || 0,
        });
      }
    }
  } catch (error) {
    console.error("Sale migration error:", error);
  }
};

TableMigrationSale();
