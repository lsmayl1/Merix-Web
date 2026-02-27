const { StockBatch, Op } = require("../../models");

const AppError = require("../../utils/AppError");

const createStockBatch = async (data) => {
  const { productId, remainingQuantity, unitCost } = data;
  try {
    const stockBatch = await StockBatch.create({
      productId,
      remainingQuantity,
      unitCost,
    });
    return stockBatch;
  } catch (error) {
    console.error("Error creating stock batch:", error);
    throw error;
  }
};

const getStockBatchesByProductId = async (productId) => {
  try {
    const stockBatches = await StockBatch.findAll({
      where: { productId, remainingQuantity: { [Op.gt]: 0 } },
      order: [["createdAt", "ASC"]], // FIFO için oluşturulma tarihine göre sırala
    });
    return stockBatches;
  } catch (error) {
    console.error("Error fetching stock batches:", error);
    throw error;
  }
};

const updateStockBatchQuantity = async (batchId, quantityChange) => {
  try {
    const stockBatch = await StockBatch.findByPk(batchId);
    if (!stockBatch) {
      throw new Error("Stock batch not found");
    }
    stockBatch.remainingQuantity += quantityChange;
    if (stockBatch.remainingQuantity < 0) {
      throw new Error("Insufficient stock in batch");
    }
    await stockBatch.save();
    return stockBatch;
  } catch (error) {
    console.error("Error updating stock batch quantity:", error);
    throw error;
  }
};

const consumeStockFIFO = async (productId, quantity, t) => {
  try {
    let remainingQty = quantity;
    let totalCost = 0;
    const batchConsumptions = [];

    const batches = await StockBatch.findAll({
      where: {
        productId,
        remainingQuantity: { [Op.gt]: 0 },
      },
      order: [["createdAt", "ASC"]],
      transaction: t,
      lock: t.LOCK.UPDATE, // 🔒 çok önemli
    });

    for (const batch of batches) {
      const consumeQty = Math.min(batch.remainingQuantity, remainingQty);
      const cost = consumeQty * batch.unitCost;

      batch.remainingQuantity -= consumeQty;
      await batch.save({ transaction: t });

      batchConsumptions.push({
        batchId: batch.id,
        quantity: consumeQty,
        unitCost: batch.unitCost,
        totalCost: cost,
      });

      totalCost += cost;
      remainingQty -= consumeQty;
      if (remainingQty <= 0) break; // satisfied
    }

    // if we still need more quantity, create a negative batch to record deficit
    if (remainingQty > 0) {
      // create a batch with negative remainingQuantity to indicate oversold stock
      const negBatch = await StockBatch.create(
        {
          productId,
          remainingQuantity: -remainingQty,
          unitCost: 0, // cost unknown or zero; adjust as necessary
        },
        { transaction: t },
      );

      batchConsumptions.push({
        batchId: negBatch.id,
        quantity: remainingQty,
        unitCost: 0,
        totalCost: 0,
      });
      // remainingQty becomes 0 since deficit has been recorded
      remainingQty = 0;
    }

    return { totalCost, batchConsumptions };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createStockBatch,
  getStockBatchesByProductId,
  updateStockBatchQuantity,
  consumeStockFIFO,
};
