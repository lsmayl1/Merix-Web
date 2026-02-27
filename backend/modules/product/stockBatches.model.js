const { DataTypes } = require("sequelize");
const sequelize = require("../../database/database");

const StockBatch = sequelize.define(
  "StockBatch",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    remainingQuantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      get() {
        const value = this.getDataValue("remainingQuantity");
        return value === null ? 0 : Number(value);
      },
    },
    unitCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      get() {
        const value = this.getDataValue("unitCost");
        return value === null ? 0 : Number(value);
      },
    },
  },
  {
    tableName: "stock_batches",
    timestamps: true,
  },
);

module.exports = StockBatch;
