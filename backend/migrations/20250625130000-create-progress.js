'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('progress', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      borrowingId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'borrowings', key: 'id' },
        onDelete: 'CASCADE'
      },
      progress: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      lastReadAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('progress');
  }
}; 