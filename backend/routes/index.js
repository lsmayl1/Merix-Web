const productsRoute = require("../modules/product/product.controller");
const categoriesRoute = require("../modules/category/category.controller");
const salesRoute = require("../modules/sale/sale.controller");
const stockTransactionsRoute = require("../modules/product/stockTransactions.controller");
const cashTransactionsRoute = require("../modules/accounting/cashTransactions.controller");
const metricsRoute = require("../modules/metric/metric.controller");
const pluRoute = require("../modules/plu/plu.controller");

const reportsRoute = require("../modules/accounting/report.controller");
const categoryRoute = require("../modules/category/category.controller");
const supplierRoute = require("../modules/supplier/supplier.controller");
const supplierTransactionsRoute = require("../modules/supplier/supplierTransactions.controller");
const productShortCutRoute = require("../modules/product/productShortCut.controller");
const userRoute = require("../modules/user/user.controller");
const authRoute = require("../modules/user/auth.controller");
const shiftRoute = require("../modules/shift/shift.controller");
const stockBatchRoute = require("../modules/product/stockBatch.controller");
const authMiddleware = require("../modules/user/Jwt/auth.middleware");

const router = (app) => {
  app.use("/api/products", productsRoute);
  app.use("/api/stock-batches", stockBatchRoute);
  app.use("/api/shift", authMiddleware, shiftRoute);
  app.use("/api/user", authMiddleware, userRoute);
  app.use("/api/auth", authRoute);
  app.use("/api/product-shortcuts", productShortCutRoute);
  app.use("/api/categories", categoriesRoute);
  app.use("/api/sales", authMiddleware, salesRoute);
  app.use("/api/stock-transactions", stockTransactionsRoute);
  app.use("/api/cash-transactions", cashTransactionsRoute);
  app.use("/api/metrics", authMiddleware, metricsRoute);
  app.use("/api/plu", pluRoute);
  app.use("/api/reports", authMiddleware, reportsRoute);
  app.use("/api/category", categoryRoute);
  app.use("/api/suppliers", authMiddleware, supplierRoute);
  app.use(
    "/api/supplier-transactions",
    authMiddleware,
    supplierTransactionsRoute,
  );
};

module.exports = router;
