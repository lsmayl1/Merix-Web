const { Sequelize, Op } = require("sequelize");
const sequelize = require("../database/database");
const Sales = require("../modules/sale/sale.model");
const Products = require("../modules/product/product.model");
const SaleDetails = require("../modules/sale/saleDetails.model");
const CashTransactions = require("../modules/supplier/cashTransactions.model");
const StockTransactions = require("../modules/product/stockTransactions.model");
const ProductStock = require("../modules/product/productStock.model");
const ShortCut = require("../modules/product/productShortcut.model");
const Suppliers = require("../modules/supplier/supplier.model");
const SupplierTransactions = require("../modules/supplier/supplierTransaction.model");
const SupplierTransactionDetails = require("../modules/supplier/supplierTransactionDetails.model");
const Category = require("../modules/category/category.model");
const SyncQueue = require("../modules/sync/syncQuene.model");
const SalePayments = require("../modules/sale/salePayments.model");
const User = require("../modules/user/user.model");
const Shifts = require("../modules/shift/shift.model");
const StockBatch = require("../modules/product/stockBatches.model");
const SaleReturns = require("../modules/sale/saleReturns.model");
// 🔹 İlişkileri Tanımla
Sales.hasMany(SaleDetails, { foreignKey: "sale_id", as: "details" });
SaleDetails.belongsTo(Sales, { foreignKey: "sale_id", as: "sale" });
Sales.hasMany(SalePayments, { foreignKey: "sale_id", as: "payments" });
SalePayments.belongsTo(Sales, { foreignKey: "sale_id", as: "payments" });

SaleReturns.belongsTo(Sales, { foreignKey: "sale_id", as: "sale" });
Sales.hasOne(SaleReturns, { foreignKey: "sale_id", as: "return" });

User.hasMany(Sales, { foreignKey: "user_id", as: "sales" });
Sales.belongsTo(User, { foreignKey: "user_id", as: "user" });

StockTransactions.belongsTo(Products, {
  foreignKey: "product_id",
  as: "product",
});
Products.hasOne(ProductStock, {
  foreignKey: "product_id",
  as: "stock",
});

ShortCut.belongsTo(Products, {
  foreignKey: "product_id",
  as: "product",
});
Products.hasOne(ShortCut, { foreignKey: "product_id", as: "shortcut" });

ProductStock.belongsTo(Products, {
  foreignKey: "product_id",
  as: "product",
});
Products.hasMany(SaleDetails, {
  foreignKey: "product_id",
  as: "saleDetails",
});
SaleDetails.belongsTo(Products, { foreignKey: "product_id", as: "product" });

// 🔹 Modelleri ve Sequelize Nesnesini Dışa Aktar

SupplierTransactions.belongsTo(Suppliers, {
  foreignKey: "supplier_id",
  as: "supplier",
});

Suppliers.hasMany(SupplierTransactions, {
  foreignKey: "supplier_id",
  as: "transactions",
});

// 2) SupplierTransactions → SupplierTransactionDetails
SupplierTransactions.hasMany(SupplierTransactionDetails, {
  foreignKey: "transaction_id", // Detay tablosundaki foreign key
  as: "details",
});

SupplierTransactionDetails.belongsTo(SupplierTransactions, {
  foreignKey: "transaction_id",
  as: "transaction",
});

// 3) Products → SupplierTransactionDetails
Products.hasMany(SupplierTransactionDetails, {
  foreignKey: "product_id",
  as: "transactionDetails",
});
SupplierTransactionDetails.belongsTo(Products, {
  foreignKey: "product_id",
  as: "product",
});

Category.hasMany(Category, {
  as: "subcategories",
  foreignKey: "parent_id",
});

Category.belongsTo(Category, {
  as: "parent",
  foreignKey: "parent_id",
});
Products.belongsTo(Category, {
  foreignKey: "category_id",
  as: "category",
});
Category.hasMany(Products, {
  foreignKey: "category_id",
  as: "products",
});

StockBatch.belongsTo(Products, {
  foreignKey: "productId",
  as: "product",
});
Products.hasMany(StockBatch, {
  foreignKey: "productId",
  as: "stockBatches",
});

Shifts.belongsTo(User, { foreignKey: "userId", as: "user" });
Shifts.hasMany(Sales, { foreignKey: "shiftId", as: "shift" });

module.exports = {
  sequelize,
  Sequelize,
  Sales,
  StockBatch,
  SalePayments,
  Products,
  SaleDetails,
  Op,
  CashTransactions,
  StockTransactions,
  ProductStock,
  Suppliers,
  SupplierTransactions,
  SupplierTransactionDetails,
  Category,
  SyncQueue,
  ShortCut,
  User,
  Shifts,
  SaleReturns,
};
