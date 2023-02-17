module.exports = function modelRole(sequelize, types) {
  const careteamTeams = sequelize.define(
    'careteam_teams',
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
      teamName: {
        type: types.STRING,
        defaultValue: '',
        allowNull: false,
        unique: true,
      },
    },
    {
      tableName: 'careteam_teams',
    }
  );

  careteamTeams.associate = function (models) {
    careteamTeams.hasMany(models.careteam_user_groups, {
      as: 'careTeamUserGroups',
      foreignKey: 'teamId',
      sourceKey: 'uuid',
    });
  };

  return careteamTeams;
};
