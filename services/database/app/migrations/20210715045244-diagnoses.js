module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('diagnoses', {
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

      createdBy: {
        type: Sequelize.UUID,
        refrences: {
          model: 'users',
          key: 'uuid',
        },
      },
      updatedBy: {
        type: Sequelize.UUID,
        refrences: {
          model: 'users',
          key: 'uuid',
        },
      },
      name: {
        type: Sequelize.STRING,
      },
      archived: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      archivedDate: {
        type: Sequelize.DATE,
      },
      diagnosedDate: {
        type: Sequelize.DATE,
      },
      notes: {
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
    await queryInterface.dropTable('diagnoses');
  },
};
