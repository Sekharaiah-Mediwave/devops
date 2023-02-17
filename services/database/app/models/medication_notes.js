module.exports = function modelMedicationNotes(sequelize, types) {
  const MedicationNotes = sequelize.define(
    'medication_notes',
    {
      id: {
        type: types.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },
      uuid: {
        type: types.UUID,
        defaultValue: types.UUIDV4,
        primarykey: true,
        unique: true,
      },
      userId: {
        type: types.INTEGER,
        refrences: {
          model: 'users',
          key: 'id',
        },
      },
      medicationId: {
        type: types.INTEGER,
        refrences: {
          model: 'medication_records',
          key: 'id',
        },
        allowNull: false,
      },
      createdBy: {
        type: types.INTEGER,
        refrences: {
          model: 'users',
          key: 'id',
        },
      },
      updatedBy: {
        type: types.INTEGER,
        refrences: {
          model: 'users',
          key: 'id',
        },
      },
      fhirId: {
        type: types.INTEGER,
        allowNull: true,
      },
      notes: {
        type: types.STRING,
      },
      status: {
        type: types.STRING,
        defaultValue: 'Active',
      },
      fhirSynced: {
        type: types.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        type: types.DATE,
        defaultValue: types.NOW,
      },
      updatedAt: {
        type: types.DATE,
        defaultValue: types.NOW,
      },
    },
    {
      tableName: 'medication_notes',
      indexes: [
        {
          fields: ['id', 'userId'],
        },
      ],
    }
  );
  MedicationNotes.associate = function (models) {
    MedicationNotes.belongsTo(models.medication_records, {
      as: 'medicationInfo',
      foreignKey: 'medicationId',
      sourceKey: 'uuid',
    });
  };
  return MedicationNotes;
};
