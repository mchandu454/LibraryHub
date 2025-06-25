"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Book extends Model {
    static associate(models) {
      // ✅ This allows Book.hasMany(Borrowing)
      Book.hasMany(models.Borrowing, { foreignKey: "bookId" });
    }
  }

  Book.init(
    {
      title: { type: DataTypes.STRING, allowNull: false },
      author: { type: DataTypes.STRING, allowNull: false },
      genre: DataTypes.STRING,
      description: DataTypes.TEXT,
      image: DataTypes.STRING,
      available: { type: DataTypes.BOOLEAN, defaultValue: true }
    },
    {
      sequelize,
      modelName: "Book",
      tableName: "books",
      freezeTableName: true
    }
  );

  return Book;
};
