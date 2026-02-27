const express = require("express");
const router = express.Router();
const {
  getAllSales,
  getSaleDetailsById,
  getSalePreview,
  createSale,
  deleteSaleById,
  returnSaleById,
} = require("./sale.service");

router.post("/", async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { from, to } = req.body;

    const sales = await getAllSales(from, to, userId);
    res.json(sales);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const saleDetails = await getSaleDetailsById(id, userId);
    res.status(200).json(saleDetails);
  } catch (error) {
    next(error);
  }
});

router.post("/preview", async (req, res, next) => {
  try {
    const { items, discount } = req.body;
    const preview = await getSalePreview(items, discount);
    res.json(preview);
  } catch (error) {
    next(error);
  }
});

router.post("/create", async (req, res, next) => {
  try {
    const response = await createSale({ ...req.body, userId: req.user.id });
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

router.post("/return/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const response = await returnSaleById(id, userId);

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

router.delete("/delete/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const response = await deleteSaleById(id, userId);
    if (response.success) {
      res.status(200).json({ message: "Sale deleted successfully" });
    } else {
      res.status(404).json({ message: response.message });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
