module.exports = function modelRole(sequelize, types) {
  const Coping = sequelize.define(
    'coping',
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
      fhirId: {
        type: types.INTEGER,
        allowNull: true,
      },
      title: {
        type: types.STRING,
        validate: {
          len: {
            args: [0, 255],
            msg: 'Title length must be less than or equal to 255 characters',
          },
        },
      },
      description: {
        type: types.STRING,
        validate: {
          len: {
            args: [0, 255],
            msg: 'Description length must be less than or equal to 255 characters',
          },
        },
      },
      achieved: {
        type: types.BOOLEAN,
        defaultValue: false,
      },
      archived: {
        type: types.BOOLEAN,
        defaultValue: false,
      },
      status: {
        type: types.STRING,
        defaultValue: 'Active',
      },
      fhirSynced: {
        type: types.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: 'coping',
      indexes: [
        {
          fields: ['id', 'uuid', 'userId'],
        },
      ],
    }
  );

  Coping.associate = function (models) {
    Coping.belongsTo(models.user, {
      as: 'userInfo',
      foreignKey: 'userId',
      targetKey: 'uuid',
    });
  };

  return Coping;
};
