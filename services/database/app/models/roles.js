module.exports = function modelRole(sequelize, types) {
  const Roles = sequelize.define(
    'roles',
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
      permission: {
        type: types.JSONB,
        defaultValue: null,
      },
      permissionStatus: {
        type: types.STRING,
        defaultValue: 'deactive',
      },
    },
    {
      tableName: 'roles',
    }
  );

  Roles.isMaster = true;

  return Roles;
};
