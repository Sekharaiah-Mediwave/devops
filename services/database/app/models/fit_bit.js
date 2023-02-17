// goals with reminders

module.exports = function modelGoal(sequelize, types) {
  const FitBit = sequelize.define('fit_bit', {
    id: {
      type: types.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      unique: true
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
    fitbitUserId: {
      type: types.STRING,
    },
    refreshToken: {
      type: types.STRING(1500),
    },
    accessToken: {
      type: types.STRING(1500),
    },
    tokenUpdatedBy: {
      type: types.UUID,
      references: {
        model: {
          tableName: 'user',
        },
        key: 'uuid',
      },
      allowNull: true,
      onDelete: 'CASCADE',
    },
    scope: {
      type: types.STRING,
    },
    codeChallenge: {
      type: types.STRING,
    },
    codeVerifier: {
      type: types.STRING,
    },
    tokenCreatedAt: {
      type: types.DATE,
    },
  }, {
    tableName: 'fit_bit',
  });

  FitBit.associate = function (models) {

    // FitBit.belongsTo(models.user, {
    //   foreignKey: 'user_id',
    //   as: 'user',
    //   targetKey: 'uuid'
    // });

  }

  return FitBit;
};
