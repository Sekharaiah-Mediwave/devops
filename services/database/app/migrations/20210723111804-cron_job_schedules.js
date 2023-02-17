module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('cron_jobs', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        unique: true,
      },
      uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primarykey: true,
        unique: true,
      },
      name: {
        type: Sequelize.STRING(1000),
        allowNull: false,
      },
      mailApiRoute: {
        type: Sequelize.STRING(1000),
        allowNull: false,
      },
      cronInitialValues: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: {},
      },
      cronScheduleTime: {
        type: Sequelize.STRING(1000),
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'Active',
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('cron_jobs');
  },
};
