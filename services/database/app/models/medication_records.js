module.exports = function modelMedicationRecord(sequelize, types) {
  const MedicationRecord = sequelize.define(
    'medication_records',
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
      diagnosesId: {
        type: types.INTEGER,
        refrences: {
          model: 'diagnoses',
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
      name: {
        type: types.STRING,
      },
      archivedDate: {
        type: types.DATE,
      },
      medicationDate: {
        type: types.DATE,
      },
      medicationType: {
        type: types.STRING,
      },
      otherMedicationWay: {
        type: types.STRING,
      },
      dosage: {
        type: types.STRING,
      },
      frequency: {
        type: types.STRING,
      },
      symptom: {
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
      tableName: 'medication_records',
      indexes: [
        {
          fields: ['id', 'userId'],
        },
      ],
    }
  );
  MedicationRecord.associate = function (models) {
    MedicationRecord.belongsTo(models.diagnoses, {
      as: 'diagnosesInfo',
      foreignKey: 'diagnosesId',
      targetKey: 'uuid',
    });
    MedicationRecord.hasMany(models.medication_notes, {
      as: 'medicationInfo',
      foreignKey: 'medicationId',
      sourceKey: 'uuid',
    });
  };
  return MedicationRecord;
};
