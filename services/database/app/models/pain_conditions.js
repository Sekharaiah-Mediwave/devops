module.exports = function modelPainCondition(sequelize, types) {
  const PainCondition = sequelize.define(
    'pain_conditions',
    {
      id: {
        primaryKey: true,
        type: types.INTEGER,
        autoIncrement: true,
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
      },
      refer: {
        type: types.STRING(1000),
      },
      describeCondition: {
        type: types.TEXT,
      },
      whereHurts: {
        type: types.STRING(1000),
      },
      severity: {
        type: types.INTEGER, // 0 to 10
        defaultValue: 0,
      },
      effectOnMood: {
        type: types.INTEGER, // 0nt 1vb 2b 3s 4nsm 5naa,
        defaultValue: 0,
      },
      startedFrom: {
        type: types.DATE,
        defaultValue: types.NOW,
      },
      status: {
        type: types.STRING,
        defaultValue: 'Active',
      },
      fhirSynced: {
        type: types.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: 'pain_conditions',
    }
  );

  PainCondition.associate = function (models) {
    PainCondition.hasMany(models.pain_condition_records, {
      as: 'pain_condition_records',
      foreignKey: 'painId',
      sourceKey: 'uuid',
    });
    PainCondition.belongsTo(models.user, {
      as: 'userInfo',
      foreignKey: 'userId',
      targetKey: 'uuid',
    });
  };

  return PainCondition;
};
