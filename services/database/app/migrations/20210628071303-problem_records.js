module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('problem_records', {
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
      problemId: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'problem',
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
      datetime: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      managedStatus: {
        type: Sequelize.INTEGER /* 1 --- very poor, 2 --- poor, 3 --- alright, 4 --- well, 5 --- very well */,
      },
      effectOnMood: {
        type: Sequelize.INTEGER /* 1 --- very poor, 2 --- poor, 3 --- alright, 4 --- well, 5 --- very well */,
      },
      notes: {
        type: Sequelize.STRING(1000),
        defaultValue: '',
      },
      status: {
        type: Sequelize.STRING /* Active --- tracker active, Inactive --- tracker not active, Archived --- if tracker gets archived */,
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
    await queryInterface.dropTable('problem_records');
  },
};
