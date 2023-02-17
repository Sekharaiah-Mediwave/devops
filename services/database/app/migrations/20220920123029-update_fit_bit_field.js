'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDefinition = await queryInterface.describeTable('fit_bit');
    if (!tableDefinition.updatedBy) {
      await queryInterface.addColumn('fit_bit', 'accessToken', { type: Sequelize.STRING(1500) });
      await queryInterface.addColumn('fit_bit', 'tokenUpdatedBy', { type: Sequelize.UUID });
    }
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('fit_bit', 'accessToken');
    await queryInterface.removeColumn('fit_bit', 'tokenUpdatedBy');
  }
};