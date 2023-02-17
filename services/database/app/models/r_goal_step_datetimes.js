// goals with reminders - steps' datetimes to show in calendar

module.exports = function modelGoal(sequelize, types) {
  const RGoalStepDateTime = sequelize.define(
    'RGoalStepDateTime',
    {
      uuid: {
        type: types.UUID,
        defaultValue: types.UUIDV4,
        primarykey: true,
        unique: true,
      },
      r_goal_id: {
        type: types.UUID,
        references: {
          model: {
            tableName: 'r_goals',
          },
          key: 'uuid',
        },
        allowNull: false,
        onDelete: 'CASCADE',
      },
      r_goal_step_id: {
        type: types.UUID,
        references: {
          model: {
            tableName: 'r_goal_steps',
          },
          key: 'uuid',
        },
        allowNull: false,
        onDelete: 'CASCADE',
      },
      date_time: {
        type: types.DATE,
      },
      reminder_date_time: {
        type: types.DATE,
      },
      reminder_send: {
        type: types.BOOLEAN,
      },
      status: {
        type: types.ENUM('active', 'completed'),
      },
    },
    {
      tableName: 'r_goal_step_datetimes',
    }
  );

  RGoalStepDateTime.associate = function (models) {
    RGoalStepDateTime.belongsTo(models.RGoalStep, {
      foreignKey: 'r_goal_step_id',
      as: 'step_details',
      targetKey: 'uuid',
      // sourceKey: 'r_goal_step_id'
    });
  };

  // RGoalStepDateTime.associate = function (models) {
  //   models.RGoal.hasMany(RGoalStepDateTime, {
  //     foreignKey: 'r_goal_id',
  //     as: 'goal_details',
  //     sourceKey: 'id'
  //   });
  // }

  return RGoalStepDateTime;
};
