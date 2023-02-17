module.exports = function modelRole(sequelize, types) {
  const Diary = sequelize.define(
    'diary',
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

      notes: {
        type: types.TEXT,
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
      createdFrom: {
        type: types.STRING /* diary, smoke, sleep, alcohol, mood, pain, problem */,
        defaultValue: 'diary',
      },
      painId: {
        type: types.UUID,
        references: {
          model: {
            tableName: 'pain_condition_records',
          },
          key: 'uuid',
        },
        allowNull: true,
        onDelete: 'CASCADE',
      },
      problemId: {
        type: types.UUID,
        references: {
          model: {
            tableName: 'problem_records',
          },
          key: 'uuid',
        },
        allowNull: true,
        onDelete: 'CASCADE',
      },
      alcoholId: {
        type: types.UUID,
        references: {
          model: {
            tableName: 'alcohol',
          },
          key: 'uuid',
        },
        allowNull: true,
        onDelete: 'CASCADE',
      },
      smokeId: {
        type: types.UUID,
        references: {
          model: {
            tableName: 'smoke',
          },
          key: 'uuid',
        },
        allowNull: true,
        onDelete: 'CASCADE',
      },
      sleepId: {
        type: types.UUID,
        references: {
          model: {
            tableName: 'sleep',
          },
          key: 'uuid',
        },
        allowNull: true,
        onDelete: 'CASCADE',
      },
      moodId: {
        type: types.UUID,
        references: {
          model: {
            tableName: 'mood',
          },
          key: 'uuid',
        },
        allowNull: true,
        onDelete: 'CASCADE',
      },
    },
    {
      tableName: 'diary',
      indexes: [
        {
          fields: ['id', 'uuid', 'userId'],
        },
      ],
    }
  );

  Diary.addHook('beforeUpdate', (diaryRecord) => {
    try {
      diaryRecord.fhirSynced = false;
    } catch (error) {
      console.log('\n update diary hook error...', error);
    }
  });

  Diary.associate = function (models) {
    Diary.belongsTo(models.problem_records, {
      as: 'problem_records',
      foreignKey: 'problemId',
      targetKey: 'uuid',
    });
    Diary.belongsTo(models.mood, {
      as: 'mood',
      foreignKey: 'moodId',
      targetKey: 'uuid',
    });
    Diary.belongsTo(models.sleep, {
      as: 'sleep',
      foreignKey: 'sleepId',
      targetKey: 'uuid',
    });
    Diary.belongsTo(models.smoke, {
      as: 'smoke',
      foreignKey: 'smokeId',
      targetKey: 'uuid',
    });
    Diary.belongsTo(models.alcohol, {
      as: 'alcohol',
      foreignKey: 'alcoholId',
      targetKey: 'uuid',
    });
    Diary.belongsTo(models.pain_condition_records, {
      as: 'pain_condition_records',
      foreignKey: 'painId',
      targetKey: 'uuid',
    });
    Diary.belongsTo(models.user, {
      as: 'userInfo',
      foreignKey: 'userId',
      targetKey: 'uuid',
    });
  };

  return Diary;
};
