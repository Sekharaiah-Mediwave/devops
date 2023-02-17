const { uuidv4 } = require('../services/imports');

const arrayToInsert = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60].map((duration) => ({
  duration,
  uuid: uuidv4(),
  createdAt: new Date(),
  updatedAt: new Date(),
  status: 'active'
}));

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('clinic_slot_durations', {
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
        allowNull: false,
      },
      duration: {
        type: Sequelize.INTEGER,
        defaultValue: null,
      },
      created_by: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'user',
          },
          key: 'uuid',
        },
        allowNull: true,
        onDelete: 'CASCADE',
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: 'active',
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

    await queryInterface.bulkInsert('clinic_slot_durations', arrayToInsert, {});
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('clinic_slot_durations');
  },
};
