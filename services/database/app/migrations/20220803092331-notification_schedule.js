/*
  This is for the new goal tracker (OxCare for now).
*/

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('notification_schedule', {
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
      user_id: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'user',
          },
          key: 'uuid',
        },
        allowNull: false,
        onDelete: 'CASCADE',
      },
      subject: {
        type: Sequelize.STRING,
      },
      message: {
        type: Sequelize.STRING,
      },
      notification_type: {
        type: Sequelize.STRING,
      },
      schedule_type: {
        type: Sequelize.STRING,
      },
      month: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      week_day: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      day: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      emails: {
        type: Sequelize.ARRAY(Sequelize.STRING),
      },
      time: {
        type: Sequelize.DATE,
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: true,
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
    await queryInterface.dropTable('notification_schedule');
  },
};
