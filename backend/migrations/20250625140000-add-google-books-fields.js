'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Books', 'googleBookId', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true
    });

    await queryInterface.addColumn('Books', 'isGoogleBook', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });

    await queryInterface.addColumn('Books', 'pageCount', {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    await queryInterface.addColumn('Books', 'publishedDate', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('Books', 'publisher', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('Books', 'isbn', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Books', 'googleBookId');
    await queryInterface.removeColumn('Books', 'isGoogleBook');
    await queryInterface.removeColumn('Books', 'pageCount');
    await queryInterface.removeColumn('Books', 'publishedDate');
    await queryInterface.removeColumn('Books', 'publisher');
    await queryInterface.removeColumn('Books', 'isbn');
  }
}; 