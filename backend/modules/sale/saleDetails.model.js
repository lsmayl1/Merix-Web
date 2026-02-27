const { DataTypes } = require("sequelize");
const sequelize = require("../../database/database");

const SaleDetails = sequelize.define(
  "saleDetails",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    sale_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    buy_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    batch_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    sell_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "sale_details",
  },
);

module.exports = SaleDetails;
