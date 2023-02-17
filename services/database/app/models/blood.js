module.exports = function modelRole(sequelize, types) {
  const Blood = sequelize.define(
    'blood',
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
      entryDate: {
        type: types.DATE,
      },
      managedStatus: {
        type: types.INTEGER /* 1 --- very poor, 2 --- poor, 3 --- alright, 4 --- well, 5 --- very well */,
      },
      heartRate: {
        type: types.FLOAT,
      },
      diastolicBloodPressure: {
        type: types.FLOAT,
      },
      systolicBloodPressure: {
        type: types.FLOAT,
      },
      notes: {
        type: types.STRING(1000),
        defaultValue: '',
      },
      status: {
        type: types.STRING /* Active --- tracker active, Inactive --- tracker not active, Archived --- if tracker gets archived */,
        defaultValue: 'Active',
      },
      fhirSynced: {
        type: types.BOOLEAN /* Active --- tracker active, Inactive --- tracker not active, Archived --- if tracker gets archived */,
        defaultValue: false,
      },
    },
    {
      tableName: 'blood',
      indexes: [
        {
          fields: ['id', 'uuid', 'userId'],
        },
      ],
    }
  );

  Blood.addHook('beforeUpdate', (bloodRecord) => {
    try {
      bloodRecord.fhirSynced = false;
    } catch (error) {
      console.log('\n update blood hook error...', error);
    }
  });

  Blood.associate = function (models) {
    Blood.belongsTo(models.user, {
      as: 'userInfo',
      foreignKey: 'userId',
      targetKey: 'uuid',
    });
  };

  return Blood;
};
