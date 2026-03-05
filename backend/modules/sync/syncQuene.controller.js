const express = require("express");
const { createSale } = require("../sale/sale.service");
const Router = express.Router();

Router.post("/", async (req, res, next) => {
  try {
    const { entity, record_id, action, payload } = req.body;
    console.log(entity);
    if (!entity || !record_id || !action) {
      throw new AppError(
        "entity, record_id and action are required fields",
        400,
      );
    }
    if (entity === "sale" && action === "create") {
      await createSale({
        id: record_id,
        total_amount: payload.totalAmount,
        subtotal_amount: payload.subtotalAmount,
        discount: payload.discount,
        discounted_amount: payload.discountedAmount,
        type: payload.type,
        date: payload.date,
        userId: payload.userId,
      });
    }
    res.status(200).json({ success: true, message: "Sync processed" });
  } catch (err) {
    next(err);
  }
});

module.exports = Router;
