module.exports = function modelPainConditionRecord(sequelize, types) {
  const PainConditionRecord = sequelize.define(
    'pain_condition_records',
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
      fhirId: {
        type: types.INTEGER,
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
      painId: {
        type: types.UUID,
        references: {
          model: {
            tableName: 'pain_conditions',
          },
          key: 'uuid',
        },
        allowNull: false,
        onDelete: 'CASCADE',
      },
      datetime: {
        type: types.DATE,
      },
      severity: {
        type: types.INTEGER, // 0 to 10
        defaultValue: 0,
      },
      startedFrom: {
        type: types.STRING(100),
        defaultValue: 'morning', // morning, afternoon, evening
      },
      duration: {
        type: types.INTEGER, // in minutes
        defaultValue: 0,
      },
      effectOnMood: {
        type: types.INTEGER, // 0nt 1vb 2b 3s 4nsm 5naa,
        defaultValue: 0,
      },
      overviewsRate: {
        type: types.INTEGER, // 0nt 1vp 2p 3a 4w 5vw
      },
      notes: {
        type: types.TEXT,
      },
      status: {
        type: types.STRING, // Archived, Active
        defaultValue: 'Active',
      },
      fhirSynced: {
        type: types.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: 'pain_condition_records',
    }
  );

  PainConditionRecord.associate = function (models) {
    PainConditionRecord.belongsTo(models.pain_conditions, {
      as: 'pain_condition_info',
      foreignKey: 'painId',
      targetKey: 'uuid',
    });
    PainConditionRecord.belongsTo(models.user, {
      as: 'userInfo',
      foreignKey: 'userId',
      targetKey: 'uuid',
    });
  };

  return PainConditionRecord;
};
