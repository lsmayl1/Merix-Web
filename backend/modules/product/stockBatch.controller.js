const express = require("express");
const {
  getStockBatchesByProductId,
  createStockBatch,
} = require("./stockBatch.service");
const router = express.Router();

// Stok partilerini ürün bazında listele
router.get("/:productId", async (req, res) => {
  const { productId } = req.params;
  try {
    const stockBatches = await getStockBatchesByProductId(productId);
    res.json(stockBatches);
  } catch (error) {
    console.error("Error fetching stock batches:", error);
    res.status(500).json({ error: "Failed to fetch stock batches" });
  }
});

router.post("/", async (req, res) => {
  const { productId, quantity, unitCost } = req.body;
  try {
    const newBatch = await createStockBatch({
      productId,
      remainingQuantity: quantity,
      unitCost,
    });
    res.status(201).json(newBatch);
  } catch (error) {
    console.error("Error creating stock batch:", error);
    res.status(500).json({ error: "Failed to create stock batch" });
  }
});

module.exports = router;
