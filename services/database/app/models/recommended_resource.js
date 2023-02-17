module.exports = function modelRole(sequelize, types) {
  const RecommendedResource = sequelize.define(
    'recommended_resource',
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
      resource_ids: {
        type: types.JSONB,
        defaultValue: [],
      },
    },
    {
      tableName: 'recommended_resource',
    }
  );

  RecommendedResource.associate = (models) => {
    RecommendedResource.belongsTo(models.user, {
      as: 'userInfo',
      foreignKey: 'userId',
      targetKey: 'uuid',
    });
  };

  return RecommendedResource;
};
