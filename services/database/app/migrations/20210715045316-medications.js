module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('medication_records', {
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
      diagnosesId: {
        type: Sequelize.UUID,
        refrences: {
          model: 'diagnoses',
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
      name: {
        type: Sequelize.STRING,
      },
      archivedDate: {
        type: Sequelize.DATE,
      },
      medicationDate: {
        type: Sequelize.DATE,
      },
      medicationType: {
        type: Sequelize.STRING,
      },
      otherMedicationWay: {
        type: Sequelize.STRING,
      },
      dosage: {
        type: Sequelize.STRING,
      },
      frequency: {
        type: Sequelize.STRING,
      },
      symptom: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable('medication_records');
  },
};
