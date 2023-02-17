// goals with reminders

module.exports = function modelGoal(sequelize, types) {
  const notification = sequelize.define(
    'notification',
    {
      uuid: {
        type: types.UUID,
        defaultValue: types.UUIDV4,
        primarykey: true,
        unique: true,
      },
      ns_id: {
        type: types.UUID,
        references: {
          model: 'notification_schedule',
          key: 'uuid',
        },
      },
      time: {
        type: types.DATE,
      },
      status: {
        type: types.STRING,
      },
      type: {
        type: types.STRING,
      },
      viewEmail: { type: types.ARRAY(types.STRING), allowNull: true, defaultValue: null },
    },
    {
      tableName: 'notification',
    }
  );

  notification.associate = function (models) {
    notification.belongsTo(models.notification_schedule, {
      foreignKey: 'ns_id',
      targetKey: 'uuid',
    });
  };

  return notification;
};
