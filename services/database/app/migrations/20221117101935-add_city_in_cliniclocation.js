module.exports = {
  up: async (queryInterface, Sequelize) => {
      const tableDefinition = await queryInterface.describeTable('clinic_location');
      if (!tableDefinition.send_to) {
        await queryInterface.addColumn('clinic_location', 'city', {
          type: Sequelize.STRING,
          defaultValue: null,
        });
      }
    },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('clinic_location', 'city');
  }
};
