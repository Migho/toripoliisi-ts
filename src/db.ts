const { Sequelize, DataTypes } = require("sequelize")

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database.sqlite",
  logging: false,
})

export const Order = sequelize.define("Order", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  chatId: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  newestToriItemId: {
    type: DataTypes.STRING,
  },
  newestToriItemTimestamp: {
    type: DataTypes.BIGINT,
  },
})

Order.sync()

export default sequelize
