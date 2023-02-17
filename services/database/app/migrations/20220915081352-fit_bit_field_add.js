'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDefinition = await queryInterface.describeTable('fit_bit');
    if (!tableDefinition.updatedBy) {
      await queryInterface.addColumn('fit_bit', 'tokenCreatedAt', { type: Sequelize.DATE });
    }
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('fit_bit', 'tokenCreatedAt');
  }
};