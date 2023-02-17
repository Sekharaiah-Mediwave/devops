module.exports = function modelPainCondition(sequelize, types) {
  const ProblemRecords = sequelize.define(
    'problem_records',
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
      problemId: {
        type: types.UUID,
        references: {
          model: {
            tableName: 'problem',
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
      datetime: {
        type: types.DATE,
        defaultValue: types.NOW,
      },
      managedStatus: {
        type: types.INTEGER /* 1 --- very poor, 2 --- poor, 3 --- alright, 4 --- well, 5 --- very well */,
      },
      effectOnMood: {
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
      tableName: 'problem_records',
    }
  );

  ProblemRecords.addHook('beforeUpdate', (problemRecord) => {
    try {
      problemRecord.fhirSynced = false;
    } catch (error) {
      console.log('\n update problem hook error...', error);
    }
  });

  ProblemRecords.associate = function (models) {
    ProblemRecords.belongsTo(models.problem, {
      as: 'problemInfo',
      foreignKey: 'problemId',
      targetKey: 'uuid',
    });
    ProblemRecords.belongsTo(models.user, {
      as: 'userInfo',
      foreignKey: 'userId',
      targetKey: 'uuid',
    });
  };

  return ProblemRecords;
};
