/*
  This is for the new goal tracker (OxCare for now).
*/

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('r_goal_steps', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },
      uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primarykey: true,
        unique: true,
      },
      r_goal_id: {
        type: Sequelize.UUID,
        references: {
          model: 'r_goals',
          key: 'uuid',
        },
        allowNull: false,
        onDelete: 'CASCADE',
      },
      name: {
        type: Sequelize.STRING,
      },
      meta_how_often: {
        type: Sequelize.ENUM('once_a_day', 'other'),
      },
      meta_do_this_for_type: {
        type: Sequelize.ENUM('days', 'weeks', 'months'),
      },
      meta_do_this_for_value: {
        type: Sequelize.INTEGER,
      },
      meta_has_reminder: {
        type: Sequelize.BOOLEAN,
      },
      meta_reminder_minutes: {
        type: Sequelize.INTEGER,
      },
      meta_days: {
        type: Sequelize.ARRAY(Sequelize.ENUM('mon', 'tues', 'wed', 'thur', 'fri', 'sat', 'sun')),
      },
      meta_times: {
        type: Sequelize.ARRAY(Sequelize.DATE),
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
    await queryInterface.dropTable('r_goal_steps');
  },
};
