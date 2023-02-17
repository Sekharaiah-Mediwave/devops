module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.changeColumn('important_message', 'messageId', {
      type: Sequelize.UUID,
      defaultValue: null,
      allowNull: true,
    }),

  down: (queryInterface, Sequelize) =>
    queryInterface.changeColumn('important_message', 'messageId', {
      type: Sequelize.UUID,
      references: {
        model: {
          tableName: 'chat_room_messages',
        },
        key: 'uuid',
      },
      allowNull: false,
      onDelete: 'CASCADE',
    }),
};
