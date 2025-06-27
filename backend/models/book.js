"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Book extends Model {
    static associate(models) {
      // ✅ This allows Book.hasMany(Borrowing)
      Book.hasMany(models.Borrowing, { foreignKey: "bookId", as: "borrowings" });
      Book.hasMany(models.Rating, { foreignKey: "bookId", as: "ratings" });
    }
  }

  Book.init(
    {
      title: { type: DataTypes.STRING, allowNull: false },
      author: { type: DataTypes.STRING, allowNull: false },
      genre: { type: DataTypes.STRING, allowNull: true },
      description: { type: DataTypes.TEXT, allowNull: true },
      image: { type: DataTypes.STRING, allowNull: true },
      available: { type: DataTypes.BOOLEAN, defaultValue: true },
      googleBookId: { type: DataTypes.STRING, allowNull: true, unique: true },
      isGoogleBook: { type: DataTypes.BOOLEAN, defaultValue: false },
      pageCount: { type: DataTypes.INTEGER, allowNull: true },
      publishedDate: { type: DataTypes.STRING, allowNull: true },
      publisher: { type: DataTypes.STRING, allowNull: true },
      isbn: { type: DataTypes.STRING, allowNull: true }
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
