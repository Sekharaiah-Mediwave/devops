module.exports = {
  up: (queryInterface, Sequelize) =>
    Promise.all([
      queryInterface.changeColumn('life_style', 'discription', {
        type: Sequelize.TEXT,
        allowNull: true,
      }),
    ]),

  down: (queryInterface, Sequelize) =>
    Promise.all([
      queryInterface.changeColumn('life_style', 'discription', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
    ]),
};
