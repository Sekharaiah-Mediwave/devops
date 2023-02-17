module.exports = function modelRole(sequelize, types) {
  const Alcohol = sequelize.define(
    'alcohol',
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
      drinkedItems: {
        type: types.JSON,
      },
      entryDate: {
        type: types.DATE,
        defaultValue: types.NOW,
      },
      sessionTime: {
        type: types.STRING,
        defaultValue: '',
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
      tableName: 'alcohol',
      indexes: [
        {
          fields: ['id', 'uuid', 'userId', 'entryDate'],
        },
      ],
    }
  );

  Alcohol.addHook('beforeUpdate', (alcoholRecord) => {
    try {
      alcoholRecord.fhirSynced = false;
    } catch (error) {
      console.log('\n update alcohol hook error...', error);
    }
  });

  Alcohol.associate = function (models) {
    Alcohol.belongsTo(models.user, {
      as: 'userInfo',
      foreignKey: 'userId',
      targetKey: 'uuid',
    });
  };

  return Alcohol;
};
