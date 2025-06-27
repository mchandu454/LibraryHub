module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('books', 'image', { type: Sequelize.TEXT });
    await queryInterface.changeColumn('books', 'genre', { type: Sequelize.TEXT });
    // description is already TEXT, but you can add this for safety:
    await queryInterface.changeColumn('books', 'description', { type: Sequelize.TEXT });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('books', 'image', { type: Sequelize.STRING });
    await queryInterface.changeColumn('books', 'genre', { type: Sequelize.STRING });
    await queryInterface.changeColumn('books', 'description', { type: Sequelize.STRING });
  }
};