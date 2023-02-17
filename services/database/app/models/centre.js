module.exports = function modelRole(sequelize, types) {
  const Centre = sequelize.define(
    'centre',
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
      name: {
        type: types.STRING,
        defaultValue: '',
      },
      description: {
        type: types.STRING,
        defaultValue: '',
      },
    },
    {
      tableName: 'centre',
    }
  );

  Centre.isMaster = true;

  return Centre;
};
