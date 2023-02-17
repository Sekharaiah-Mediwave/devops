module.exports = function modelDiagnoses(sequelize, types) {
  const Diagnoses = sequelize.define(
    'diagnoses',
    {
      id: {
        type: types.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        unique: true,
      },
      uuid: {
        type: types.UUID,
        defaultValue: types.UUIDV4,
        primarykey: true,
        unique: true,
      },
      userId: {
        type: types.UUID,
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
        type: types.INTEGER,
        allowNull: true,
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
      name: {
        type: types.STRING,
      },
      archivedDate: {
        type: types.DATE,
      },
      diagnosedDate: {
        type: types.DATE,
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
      tableName: 'diagnoses',
      indexes: [
        {
          fields: ['id', 'uuid', 'userId'],
        },
      ],
    }
  );

  Diagnoses.associate = function (models) {
    Diagnoses.hasMany(models.medication_records, {
      as: 'medications',
      foreignKey: 'diagnosesId',
      sourceKey: 'uuid',
    });
    Diagnoses.belongsTo(models.user, {
      foreignKey: 'userId',
      as: 'userInfo',
      targetKey: 'uuid',
    });
  };
  return Diagnoses;
};
