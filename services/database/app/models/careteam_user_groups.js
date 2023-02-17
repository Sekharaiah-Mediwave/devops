module.exports = function modelRole(sequelize, types) {
  const careteamTeamUserGroups = sequelize.define(
    'careteam_user_groups',
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
      teamId: {
        type: types.UUID,
        references: {
          model: {
            tableName: 'careteam_teams',
          },
          key: 'uuid',
        },
        allowNull: false,
        onDelete: 'CASCADE',
      },
    },
    {
      tableName: 'careteam_user_groups',
    }
  );

  careteamTeamUserGroups.associate = function (models) {
    careteamTeamUserGroups.belongsTo(models.careteam_teams, {
      as: 'careTeam',
      targetKey: 'uuid',
      foreignKey: 'teamId',
    });
    careteamTeamUserGroups.belongsTo(models.user, {
      as: 'userInfo',
      targetKey: 'uuid',
      foreignKey: 'userId',
    });
  };

  return careteamTeamUserGroups;
};
