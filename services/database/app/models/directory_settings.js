module.exports = function modelRole(sequelize, types) {
  const DirectorySettings = sequelize.define(
    'directory_settings',
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
      visible: {
        type: types.BOOLEAN,
        defaultValue: false,
      },
      centre: {
        type: types.BOOLEAN,
        defaultValue: false,
      },
      mobileNumber: {
        type: types.BOOLEAN,
        defaultValue: false,
      },
      specialism: {
        type: types.BOOLEAN,
        defaultValue: false,
      },
      qualification: {
        type: types.BOOLEAN,
        defaultValue: false,
      },
      expertise: {
        type: types.BOOLEAN,
        defaultValue: false,
      },
      associatedClinician: {
        type: types.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: 'directory_settings',
    }
  );

  DirectorySettings.associate = (models) => {
    DirectorySettings.belongsTo(models.user, {
      as: 'userInfo',
      foreignKey: 'userId',
      targetKey: 'uuid',
    });
  };

  return DirectorySettings;
};
