// goals with reminders

module.exports = function modelGoal(sequelize, types) {
  const RGoal = sequelize.define(
    'RGoal',
    {
      uuid: {
        type: types.UUID,
        defaultValue: types.UUIDV4,
        primarykey: true,
        unique: true,
      },
      user_id: {
        type: types.INTEGER,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      name: {
        type: types.STRING,
      },
      description: {
        type: types.STRING(1000),
      },
      from_date: {
        type: types.DATE,
      },
      to_date: {
        type: types.DATE,
      },
      archived_date: {
        type: types.DATE,
      },
      status: {
        type: types.ENUM('active', 'completed', 'archived'),
        defaultValue: 'active',
      },
    },
    {
      tableName: 'r_goals',
    }
  );

  RGoal.associate = function (models) {
    RGoal.hasMany(models.RGoalStepDateTime, {
      foreignKey: 'r_goal_id',
      as: 'goal_details',
      sourceKey: 'uuid',
    });

    RGoal.hasMany(models.RGoalStep, {
      foreignKey: 'r_goal_id',
      as: 'step_details',
      sourceKey: 'uuid',
    });

    RGoal.belongsTo(models.user, {
      foreignKey: 'user_id',
      as: 'goals_user',
      targetKey: 'uuid',
    });
  };

  return RGoal;
};
