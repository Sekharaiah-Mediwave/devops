module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('life_style', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
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
        refrences: {
          model: 'users',
          key: 'uuid',
        },
      },

      fhirId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      activityName: {
        type: Sequelize.STRING,
      },
      discription: {
        type: Sequelize.STRING,
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: 'Active',
      },
      fhirSynced: {
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
    await queryInterface.dropTable('life_style');
  },
};
