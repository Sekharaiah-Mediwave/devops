module.exports = function modelRole(sequelize, types) {
  const UserVerification = sequelize.define(
    'user_verification',
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
      verificationType: {
        type: types.STRING /* SignupAccount, ResetPassword, UpdateEmail, EnableTwoFactorAuth */,
      },
      verificationCode: {
        type: types.STRING,
      },
      verificationCodeExpiry: {
        type: types.DATE,
      },
    },
    {
      tableName: 'user_verification',
    }
  );

  UserVerification.associate = function (models) {
    UserVerification.belongsTo(models.user, {
      as: 'user',
      foreignKey: 'userId',
      targetKey: 'uuid',
    });
  };

  return UserVerification;
};
