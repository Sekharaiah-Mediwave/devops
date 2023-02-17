/*
  This is for the new goal tracker (OxCare for now).
*/

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('audit_trail_logs', {
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
      data_owner: {
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
      request_id: {
        type: Sequelize.TEXT,
      },
      action: {
        type: Sequelize.STRING(256),
      },
      action_text: {
        type: Sequelize.TEXT,
      },
      module_name: {
        type: Sequelize.STRING(1000),
      },
      action_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
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
    await queryInterface.dropTable('audit_trail_logs');
  },
};
