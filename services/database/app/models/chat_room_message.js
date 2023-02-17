module.exports = (sequelize, types) => {
  const ChatRoomMessage = sequelize.define(
    'chat_room_messages',
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
      message: {
        type: types.TEXT,
      },
      subject: {
        type: types.TEXT,
      },
      attachments: {
        // a csv of attachments in a message
        // we dont know if a message can have multiple attachments
        type: types.ARRAY(types.JSONB),
      },
      author: {
        type: types.UUID,
        references: {
          model: 'user',
          key: 'uuid',
        },
      },
      reply_to: {
        type: types.UUID,
        references: {
          model: 'chat_room_messages',
          key: 'uuid',
        },
      },
      seen: {
        type: types.BOOLEAN,
        defaultValue: false,
      },
    },
    { tableName: 'chat_room_messages' }
  );
  ChatRoomMessage.associate = function (models) {
    // associations can be defined here
    ChatRoomMessage.belongsTo(models.user, {
      // as: 'author_details',
      foreignKey: 'author',
      targetKey: 'uuid',
    });
    ChatRoomMessage.belongsTo(models.chat_room_messages, {
      as: 'replyMessage',
      foreignKey: 'reply_to',
      targetKey: 'uuid',
    });
    ChatRoomMessage.belongsTo(models.chat_room, {
      // as: 'messageRoom',
      foreignKey: 'room',
      targetKey: 'uuid',
    });
    ChatRoomMessage.hasMany(models.chat_room_messages, {
      // as: "replyMessages",
      foreignKey: 'reply_to',
      sourceKey: 'uuid',
    });
  };
  return ChatRoomMessage;
};
