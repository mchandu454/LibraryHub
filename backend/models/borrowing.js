"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Borrowing extends Model {
    static associate(models) {
      Borrowing.belongsTo(models.User, { foreignKey: "userId" });
      Borrowing.belongsTo(models.Book, { foreignKey: "bookId" });
      
    }
  }

  Borrowing.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      bookId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      borrowedAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      returnedAt: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: "Borrowing",
      tableName: "borrowings",
      freezeTableName: true
    }
  );

  return Borrowing;
};
