module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('chat_room_messages', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        unique: true,
      },
      uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primarykey: true,
        unique: true,
      },
      room: {
        type: Sequelize.UUID,
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
        type: Sequelize.TEXT,
      },
      subject: {
        type: Sequelize.TEXT,
      },
      attachments: {
        // a csv of attachments in a message
        // we dont know if a message can have multiple attachments
        type: Sequelize.STRING,
        defaultValue: '',
      },
      author: {
        type: Sequelize.UUID,
        references: {
          model: 'user',
          key: 'uuid',
        },
      },
      reply_to: {
        type: Sequelize.UUID,
        references: {
          model: 'chat_room_messages',
          key: 'uuid',
        },
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('chat_room_messages');
  },
};
