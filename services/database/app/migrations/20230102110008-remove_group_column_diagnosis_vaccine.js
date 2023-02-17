'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.removeColumn('diagnosis_type', 'group_id');
    await queryInterface.removeColumn('vaccination_type', 'group_id');
  },
  down: async () => {},
};
