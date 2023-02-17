module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('problem', {
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
      fhirId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      refer: {
        type: Sequelize.STRING,
        defaultValue: '',
      },
      describe: {
        type: Sequelize.STRING,
        defaultValue: '',
      },
      startedFrom: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      managedStatus: {
        type: Sequelize.INTEGER /* 1 --- very poor, 2 --- poor, 3 --- alright, 4 --- well, 5 --- very well */,
      },
      effectOnMood: {
        type: Sequelize.INTEGER /* 1 --- very poor, 2 --- poor, 3 --- alright, 4 --- well, 5 --- very well */,
      },
      status: {
        type: Sequelize.STRING /* Active --- tracker active, Inactive --- tracker not active */,
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
    await queryInterface.dropTable('problem');
  },
};
