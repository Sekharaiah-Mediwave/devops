module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.changeColumn('chat_room_messages', 'attachments', {
      type: `${Sequelize.ARRAY(Sequelize.JSONB)}USING CAST("attachments" as ${Sequelize.ARRAY(Sequelize.JSONB)})`,
    }),

  down: (queryInterface, Sequelize) =>
    queryInterface.changeColumn('chat_room_messages', 'attachments', {
      type: Sequelize.TEXT,
    }),
};
