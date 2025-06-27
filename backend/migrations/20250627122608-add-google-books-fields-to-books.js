'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('books', 'googleBookId', { type: Sequelize.STRING, unique: true });
    await queryInterface.addColumn('books', 'isGoogleBook', { type: Sequelize.BOOLEAN, defaultValue: false });
    await queryInterface.addColumn('books', 'pageCount', { type: Sequelize.INTEGER });
    await queryInterface.addColumn('books', 'publishedDate', { type: Sequelize.STRING });
    await queryInterface.addColumn('books', 'publisher', { type: Sequelize.STRING });
    await queryInterface.addColumn('books', 'isbn', { type: Sequelize.STRING });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('books', 'googleBookId');
    await queryInterface.removeColumn('books', 'isGoogleBook');
    await queryInterface.removeColumn('books', 'pageCount');
    await queryInterface.removeColumn('books', 'publishedDate');
    await queryInterface.removeColumn('books', 'publisher');
    await queryInterface.removeColumn('books', 'isbn');
  }
};
