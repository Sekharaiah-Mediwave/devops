module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('directory_settings', {
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
      visible: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      centre: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      mobileNumber: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      associatedClinician: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
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
    await queryInterface.dropTable('directory_settings');
  },
};
