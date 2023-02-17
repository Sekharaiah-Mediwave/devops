module.exports = function modelShare(sequelize, types) {
  const share = sequelize.define(
    'share',
    {
      uuid: {
        type: types.UUID,
        defaultValue: types.UUIDV4,
        primarykey: true,
        unique: true,
      },
      fromId: {
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
      toId: {
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
      circleId: {
        type: types.UUID,
        references: {
          model: {
            tableName: 'circle',
          },
          key: 'uuid',
        },
        allowNull: false,
        onDelete: 'CASCADE',
      },
      modules: {
        type: types.JSONB,
      },
    },
    {
      tableName: 'shares',
    }
  );
  return share;
};
