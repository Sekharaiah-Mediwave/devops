module.exports = function modelPainCondition(sequelize, types) {
  const Problem = sequelize.define(
    'problem',
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
      refer: {
        type: types.STRING,
        defaultValue: '',
      },
      describe: {
        type: types.STRING,
        defaultValue: '',
      },
      startedFrom: {
        type: types.DATE,
        defaultValue: types.NOW,
      },
      managedStatus: {
        type: types.INTEGER /* 1 --- very poor, 2 --- poor, 3 --- alright, 4 --- well, 5 --- very well */,
      },
      effectOnMood: {
        type: types.INTEGER /* 1 --- very poor, 2 --- poor, 3 --- alright, 4 --- well, 5 --- very well */,
      },
      status: {
        type: types.STRING /* Active --- tracker active, Inactive --- tracker not active */,
        defaultValue: 'Active',
      },
      fhirSynced: {
        type: types.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: 'problem',
    }
  );

  Problem.addHook('beforeUpdate', (problemRecord) => {
    try {
      problemRecord.fhirSynced = false;
    } catch (error) {
      console.log('\n update problem hook error...', error);
    }
  });

  Problem.associate = function (models) {
    Problem.hasMany(models.problem_records, {
      as: 'problemRecords',
      foreignKey: 'problemId',
      sourceKey: 'uuid',
    });
    Problem.belongsTo(models.user, {
      as: 'userInfo',
      foreignKey: 'userId',
      targetKey: 'uuid',
    });
  };

  return Problem;
};
