module.exports = (sequelize, types) => {
  const ImportantMessage = sequelize.define(
    'important_message',
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
      room: {
        type: types.UUID,
        references: {
          model: {
            tableName: 'chat_room',
          },
          key: 'uuid',
        },
        allowNull: false,
        onDelete: 'CASCADE',
      },
      messageId: {
        type: types.UUID,
        references: {
          model: {
            tableName: 'chat_room_messages',
          },
          key: 'uuid',
        },
        allowNull: true,
        onDelete: 'CASCADE',
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
    },
    { tableName: 'important_message' }
  );
  ImportantMessage.associate = function (models) {
    // associations can be defined here
    ImportantMessage.belongsTo(models.user, {
      // as: 'author_details',
      foreignKey: 'userId',
      targetKey: 'uuid',
    });
    ImportantMessage.belongsTo(models.chat_room_messages, {
      as: 'importantMessage',
      foreignKey: 'messageId',
      targetKey: 'uuid',
    });
    ImportantMessage.belongsTo(models.chat_room, {
      // as: 'messageRoom',
      foreignKey: 'room',
      targetKey: 'uuid',
    });
  };
  return ImportantMessage;
};
