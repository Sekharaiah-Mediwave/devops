module.exports = function modelRole(sequelize, types) {
  const Smoke = sequelize.define(
    'smoke',
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
      smokedItems: {
        type: types.JSON,
      },
      entryDate: {
        type: types.DATE,
        defaultValue: types.NOW,
      },
      managedStatus: {
        type: types.INTEGER /* 1 --- very poor, 2 --- poor, 3 --- alright, 4 --- well, 5 --- very well */,
      },
      notes: {
        type: types.STRING(1000),
        defaultValue: '',
      },
      smokeType: {
        type: types.STRING /* cigarette, eCigarette */,
        defaultValue: 'cigarette',
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
      tableName: 'smoke',
      indexes: [
        {
          fields: ['id', 'uuid', 'userId', 'entryDate'],
        },
      ],
    }
  );

  Smoke.addHook('beforeUpdate', (smokeRecord) => {
    try {
      smokeRecord.fhirSynced = false;
    } catch (error) {
      console.log('\n update smoke hook error...', error);
    }
  });

  Smoke.associate = function (models) {
    Smoke.belongsTo(models.user, {
      as: 'userInfo',
      foreignKey: 'userId',
      targetKey: 'uuid',
    });
  };

  return Smoke;
};
