module.exports = (sequelize, types) => {
  const ChatRoomParticipants = sequelize.define(
    'chat_read_recipient',
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
      messageId: {
        type: types.UUID,
        references: {
          model: {
            tableName: 'chat_room_messages',
          },
          key: 'uuid',
        },
        allowNull: false,
        onDelete: 'CASCADE',
      },
      status: {
        type: types.TEXT,
      },
    },
    { tableName: 'chat_read_recipient' }
  );

  return ChatRoomParticipants;
};
