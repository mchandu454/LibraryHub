'use strict';
module.exports = (sequelize, DataTypes) => {
  const Progress = sequelize.define('Progress', {
    borrowingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'borrowings', key: 'id' },
      onDelete: 'CASCADE'
    },
    progress: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 0, max: 100 }
    },
    lastReadAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'progress',
    freezeTableName: true
  });
  Progress.associate = function(models) {
    Progress.belongsTo(models.Borrowing, { foreignKey: 'borrowingId' });
  };
  return Progress;
}; 