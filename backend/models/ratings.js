'use strict';
module.exports = (sequelize, DataTypes) => {
  const Rating = sequelize.define('Rating', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    bookId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 }
    }
  }, {
    tableName: 'ratings',
    freezeTableName: true
  });
  Rating.associate = function(models) {
    Rating.belongsTo(models.User, { foreignKey: 'userId' });
    Rating.belongsTo(models.Book, { foreignKey: 'bookId' });
  };
  return Rating;
}; 