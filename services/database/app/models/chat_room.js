module.exports = (sequelize, types) => {
  const ChatRoom = sequelize.define(
    'chat_room',
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
      room_type: {
        type: types.STRING, // careteam,onetoone
      },
      careTeamName: {
        type: types.STRING,
      },
      created_by: {
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
    {
      tableName: 'chat_room',
    }
  );
  ChatRoom.associate = function (models) {
    // associations can be defined here
    ChatRoom.hasMany(models.chat_room_messages, {
      as: 'messages',
      foreignKey: 'room',
      sourceKey: 'uuid',
    });
    ChatRoom.hasMany(models.chat_room_messages, {
      as: 'lastMessage',
      foreignKey: 'room',
      sourceKey: 'uuid',
    });
    ChatRoom.hasMany(models.chat_room_messages, {
      as: 'messageCount',
      foreignKey: 'room',
      sourceKey: 'uuid',
    });
    ChatRoom.hasMany(models.chat_room_participants, {
      // as: 'participantsRoom',
      foreignKey: 'room',
      sourceKey: 'uuid',
    });
    ChatRoom.belongsTo(models.user, {
      // as: 'userInfo',
      foreignKey: 'created_by',
      targetKey: 'uuid',
    });
  };
  return ChatRoom;
};
