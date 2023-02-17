module.exports = (sequelize, types) => {
  const Common = sequelize.define(
    'common',
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
      accessToken: {
        type: types.STRING,
      },
      refreshToken: {
        type: types.STRING,
      },
      expiryDate: {
        type: types.DATE,
      },
    },
    {
      tableName: 'common',
    }
  );
  return Common;
};
