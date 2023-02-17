// goals with reminders

module.exports = function modelGoal(sequelize, types) {
  const notification_schedule = sequelize.define(
    'notification_schedule',
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
          model: 'user',
          key: 'uuid',
        },
      },
      subject: {
        type: types.STRING,
      },
      message: {
        type: types.TEXT,
      },
      notification_type: {
        type: types.STRING,
      },
      schedule_type: {
        type: types.STRING,
      },
      month: {
        type: types.STRING,
        allowNull: true,
      },
      week_day: {
        type: types.STRING,
        allowNull: true,
      },
      day: {
        type: types.INTEGER,
        allowNull: true,
      },
      emails: {
        type: types.ARRAY(types.STRING),
      },
      send_to: {
        type: types.ARRAY(types.JSONB),
        allowNull: true,
        default: null
      },
      time: {
        type: types.DATE,
      },
      end_date: {
        type: types.DATE,
        allowNull: true,
      },
    },
    {
      tableName: 'notification_schedule',
    }
  );

  notification_schedule.associate = function (models) {
    notification_schedule.hasMany(models.notification, {
      foreignKey: 'ns_id',
      as: 'notification',
      sourceKey: 'uuid',
    });
    notification_schedule.belongsTo(models.user, {
      foreignKey: 'user_id',
      as: 'userInfo',
      targetKey: 'uuid',
    });
  };

  return notification_schedule;
};
