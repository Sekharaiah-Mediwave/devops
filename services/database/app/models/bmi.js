module.exports = function modelRole(sequelize, types) {
  const bmi = sequelize.define(
    'bmi',
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
      height: {
        type: types.FLOAT,
        defaultValue: 0.0,
      },
      weight: {
        type: types.FLOAT,
        defaultValue: 0.0,
      },
      bmi: {
        type: types.FLOAT,
        defaultValue: 0.0,
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
      tableName: 'bmi',
      indexes: [
        {
          fields: ['id', 'uuid', 'userId'],
        },
      ],
    }
  );

  bmi.addHook('beforeUpdate', (bmiRecord) => {
    try {
      bmiRecord.fhirSynced = false;
    } catch (error) {
      console.log('\n update bmi hook error...', error);
    }
  });

  bmi.associate = function (models) {
    bmi.belongsTo(models.user, {
      as: 'userInfo',
      foreignKey: 'userId',
      targetKey: 'uuid',
    });
  };

  return bmi;
};
