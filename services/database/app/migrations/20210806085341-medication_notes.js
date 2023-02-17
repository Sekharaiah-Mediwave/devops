module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDefinition = await queryInterface.describeTable('medication_records');
    if (tableDefinition.notes) {
      await queryInterface.removeColumn('medication_records', 'notes');
    }
    await queryInterface.createTable('medication_notes', {
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
      medicationId: {
        type: Sequelize.UUID,
        refrences: {
          model: 'medication',
          key: 'uuid',
        },
        allowNull: false,
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
      fhirId: {
        type: Sequelize.INTEGER,
        allowNull: true,
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

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('medication_records', 'notes', { type: Sequelize.STRING });
    await queryInterface.dropTable('medication_notes');
  },
};
