// goals with reminders - steps

module.exports = function modelGoal(sequelize, types) {
  const RGoalStep = sequelize.define(
    'RGoalStep',
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
      name: {
        type: types.STRING,
      },
      meta_how_often: {
        type: types.ENUM('once_a_day', 'other'),
      },
      meta_do_this_for_type: {
        type: types.ENUM('days', 'weeks', 'months'),
      },
      meta_do_this_for_value: {
        type: types.INTEGER,
      },
      meta_has_reminder: {
        type: types.BOOLEAN,
      },
      meta_reminder_minutes: {
        type: types.INTEGER,
      },
      meta_days: {
        type: types.ARRAY(types.ENUM('mon', 'tues', 'wed', 'thur', 'fri', 'sat', 'sun')),
      },
      // inorder to prevent UTC issues
      // using DATE instead of TIME
      meta_times: {
        type: types.ARRAY(types.DATE),
      },
    },
    {
      tableName: 'r_goal_steps',
    }
  );

  RGoalStep.associate = function (models) {
    RGoalStep.belongsTo(models.RGoal, {
      foreignKey: 'r_goal_id',
      as: 'goal_details',
      targetKey: 'uuid',
      // sourceKey: 'r_goal_step_id'
    });
  };

  return RGoalStep;
};
