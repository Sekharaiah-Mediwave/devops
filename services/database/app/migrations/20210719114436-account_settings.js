module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('account_settings', {
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
      userId: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'user',
          },
          key: 'uuid',
        },
        allowNull: false,
        onDelete: 'CASCADE',
      },
      inAppNotification: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      emailAppNotification: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      notifyPeriodCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      notifyPeriod: {
        type: Sequelize.STRING(250),
        defaultValue: null,
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
    await queryInterface.dropTable('account_settings');
  },
};
