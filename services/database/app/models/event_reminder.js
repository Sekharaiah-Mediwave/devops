// goals with reminders - steps' datetimes to show in calendar

module.exports = function modelGoal(sequelize, types) {
  const eventReminder = sequelize.define(
    'event_reminder',
    {
      uuid: {
        type: types.UUID,
        defaultValue: types.UUIDV4,
        primarykey: true,
        unique: true,
      },
      user_id: {
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
      resource_id: {
        type: types.STRING,
      },
      reminder_time: {
        type: types.DATE,
      },
      reminder_type: {
        type: types.ENUM('10', '30', '60', '1 day'),
      },
    },
    {
      tableName: 'event_reminder',
    }
  );

  eventReminder.associate = function (models) {
    eventReminder.belongsTo(models.user, {
      foreignKey: 'user_id',
      as: 'userInfo',
      targetKey: 'uuid',
    });
  };

  // eventReminder.associate = function (models) {
  //   models.RGoal.hasMany(eventReminder, {
  //     foreignKey: 'r_goal_id',
  //     as: 'goal_details',
  //     sourceKey: 'id'
  //   });
  // }

  eventReminder.associate = function (models) {
    eventReminder.belongsTo(models.user, {
      as: 'userInfo',
      foreignKey: 'user_id',
      targetKey: 'uuid',
    });
  };
  return eventReminder;
};
