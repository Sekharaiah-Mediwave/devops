module.exports = function modelRole(sequelize, types) {
  const Sleep = sequelize.define(
    'sleep',
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
      duration: {
        type: types.FLOAT,
      },
      fromTime: {
        type: types.DATE,
      },
      toTime: {
        type: types.DATE,
      },
      sleepInterrupted: {
        type: types.INTEGER,
      },
      wakeup: {
        type: types.JSONB,
      },
      managedStatus: {
        type: types.INTEGER /* 1 --- very poor, 2 --- poor, 3 --- alright, 4 --- well, 5 --- very well */,
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
        type: types.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: 'sleep',
      indexes: [
        {
          fields: ['id', 'uuid', 'userId'],
        },
      ],
    }
  );

  Sleep.addHook('beforeUpdate', (sleepRecord) => {
    try {
      sleepRecord.fhirSynced = false;
    } catch (error) {
      console.log('\n update sleep hook error...', error);
    }
  });

  Sleep.associate = function (models) {
    Sleep.belongsTo(models.user, {
      as: 'userInfo',
      foreignKey: 'userId',
      targetKey: 'uuid',
    });
  };

  return Sleep;
};
