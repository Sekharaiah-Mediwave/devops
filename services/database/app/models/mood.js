module.exports = function modelRole(sequelize, types) {
  const Mood = sequelize.define(
    'mood',
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
      moodFace: {
        type: types.INTEGER,
      },
      notes: {
        type: types.STRING(1000),
        defaultValue: '',
        validate: {
          len: {
            args: [0, 1000],
            msg: 'Notes length must be less than or equal to 1000 characters',
          },
        },
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
      tableName: 'mood',
      indexes: [
        {
          fields: ['id', 'uuid', 'userId'],
        },
      ],
    }
  );

  Mood.addHook('beforeUpdate', (moodRecord) => {
    try {
      moodRecord.fhirSynced = false;
    } catch (error) {
      console.log('\n update mood hook error...', error);
    }
  });

  Mood.associate = function (models) {
    Mood.belongsTo(models.user, {
      as: 'userInfo',
      foreignKey: 'userId',
      targetKey: 'uuid',
    });
  };

  return Mood;
};
