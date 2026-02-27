const { DataTypes } = require("sequelize");
const sequelize = require("../../database/database");

const SaleReturns = sequelize.define(
  "saleReturns",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    sale_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "sale_returns",
    timestamps: true,
    underscored: true,
  },
);

module.exports = SaleReturns;
