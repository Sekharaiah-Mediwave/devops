/*
  This is for the new goal tracker (OxCare for now).
*/

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('r_goal_step_datetimes', {
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
      r_goal_step_id: {
        type: Sequelize.UUID,
        references: {
          model: 'r_goal_steps',
          key: 'uuid',
        },
        allowNull: false,
        onDelete: 'CASCADE',
      },
      date_time: {
        type: Sequelize.DATE,
      },
      reminder_date_time: {
        type: Sequelize.DATE,
      },
      reminder_send: {
        type: Sequelize.BOOLEAN,
      },
      status: {
        type: Sequelize.ENUM('active', 'completed'),
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
    await queryInterface.dropTable('r_goal_step_datetimes');
  },
};
