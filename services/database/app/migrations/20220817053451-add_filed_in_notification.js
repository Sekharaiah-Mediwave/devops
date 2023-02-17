module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDefinition = await queryInterface.describeTable('notification');
    if (!tableDefinition.consent) {
      await queryInterface.addColumn('notification', 'viewEmail', {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
        defaultValue: null,
      });
    }
  },
  down: (queryInterface, Sequelize) =>
    queryInterface.changeColumn('notification', 'viewEmail', {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true,
      defaultValue: null,
    }),
};
