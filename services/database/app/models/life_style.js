module.exports = function modelLifeStyle(sequelize, types) {
  const LifeStyle = sequelize.define(
    'life_style',
    {
      id: {
        type: types.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },
      uuid: {
        type: types.UUID,
        defaultValue: types.UUIDV4,
        primarykey: true,
        unique: true,
      },
      userId: {
        type: types.INTEGER,
        refrences: {
          model: 'users',
          key: 'id',
        },
      },
      fhirId: {
        type: types.INTEGER,
        allowNull: true,
      },
      activityName: {
        type: types.STRING,
      },
      discription: {
        type: types.STRING,
      },
      status: {
        type: types.STRING,
        defaultValue: 'Active',
      },
      fhirSynced: {
        type: types.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        type: types.DATE,
        defaultValue: types.NOW,
      },
      updatedAt: {
        type: types.DATE,
        defaultValue: types.NOW,
      },
    },
    {
      tableName: 'life_style',
      indexes: [
        {
          fields: ['id', 'uuid', 'userId'],
        },
      ],
    }
  );

  LifeStyle.associate = function (models) {
    LifeStyle.belongsTo(models.user, {
      foreignKey: 'userId',
      as: 'userInfo',
      targetKey: 'uuid',
    });
  };
  return LifeStyle;
};
