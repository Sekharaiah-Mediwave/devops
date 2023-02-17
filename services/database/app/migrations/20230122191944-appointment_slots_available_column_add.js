module.exports = {
  up: async (queryInterface, SequelizeTypes) => {
    const tableDefinition = await queryInterface.describeTable('slot');
    if (!tableDefinition.availability) {
      await queryInterface.addColumn('slot', 'availability', {
        type: SequelizeTypes.BOOLEAN,
        defaultValue: true,
      });
    }
  },
  down: async (queryInterface) => {
    const tableDefinition = await queryInterface.describeTable('slot');
    if (tableDefinition.availability) {
      await queryInterface.removeColumn('slot', 'availability');
    }
  }
};
