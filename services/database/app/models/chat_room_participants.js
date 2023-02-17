module.exports = (sequelize, types) => {
  const ChatRoomParticipants = sequelize.define(
    'chat_room_participants',
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
    { tableName: 'chat_room_participants' }
  );
  ChatRoomParticipants.associate = function (models) {
    // associations can be defined here
    ChatRoomParticipants.belongsTo(models.user, {
      // as: 'participantsUser',
      foreignKey: 'userId',
      targetKey: 'uuid',
    });
    ChatRoomParticipants.belongsTo(models.chat_room, {
      // as: 'participantsRoom',
      foreignKey: 'room',
      targetKey: 'uuid',
    });
  };
  return ChatRoomParticipants;
};
