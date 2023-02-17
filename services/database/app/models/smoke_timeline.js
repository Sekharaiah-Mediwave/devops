const { moment } = require('../services/imports');

module.exports = function modelRole(sequelize, types) {
  const SmokeTimeline = sequelize.define(
    'smoke_timeline',
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
      quitBeforeStartAgain: {
        type: types.JSON,
      },
      smokeType: {
        type: types.STRING /* quitting, eCigarette */,
        defaultValue: 'quitting',
      },
      entryStartDate: {
        type: types.DATE,
        defaultValue: types.NOW,
        set(val) {
          val = moment(val).toDate();
          return this.setDataValue(
            'entryStartDate',
            moment(`${moment(val).format('YYYY-MM-DD')} ${moment().format('HH:mm:ss')}`).toISOString()
          );
        },
      },
      averageSpendPerWeek: {
        type: types.INTEGER,
      },
      triedToQuitBefore: {
        type: types.BOOLEAN,
        defaultValue: false,
      },
      noSmokeEntries: {
        type: types.ARRAY(types.STRING),
      },
      entryEndDate: {
        type: types.DATE,
        defaultValue: null,
        set(val) {
          if (val) {
            val = moment(val).toDate();
            return this.setDataValue(
              'entryEndDate',
              moment(`${moment(val).format('YYYY-MM-DD')} ${moment().format('HH:mm:ss')}`).toISOString()
            );
          }
          return null;
        },
      },
      smokingTrigger: {
        type: types.STRING,
        defaultValue: null,
      },
      smokingTriggerOthers: {
        type: types.STRING,
        defaultValue: null,
      },
      notes: {
        type: types.STRING(1000),
        defaultValue: '',
      },
      status: {
        type: types.STRING /* Inactive --- tracker not active, InProgress --- if timeline not ends, Ended --- timeline has ended */,
        defaultValue: 'Active',
      },
      dailyReminder: {
        type: types.BOOLEAN,
        defaultValue: false,
      },
      fhirSynced: {
        type: types.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: 'smoke_timeline',
      indexes: [
        {
          fields: ['id', 'uuid', 'userId', 'entryDate'],
        },
      ],
    }
  );

  SmokeTimeline.addHook('beforeUpdate', (smokeRecord) => {
    try {
      smokeRecord.fhirSynced = false;
    } catch (error) {
      console.log('\n update smoke hook error...', error);
    }
  });

  SmokeTimeline.associate = function (models) {
    SmokeTimeline.belongsTo(models.user, {
      as: 'userInfo',
      foreignKey: 'userId',
      targetKey: 'uuid',
    });
  };

  return SmokeTimeline;
};
