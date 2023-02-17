module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.changeColumn('notification_schedule', 'message', {
      type: Sequelize.TEXT,
    }),

  down: (queryInterface, Sequelize) =>
    queryInterface.changeColumn('notification_schedule', 'message', {
      type: Sequelize.STRING,
    }),
};
