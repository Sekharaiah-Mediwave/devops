module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('vaccination_type', {
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
      group_id: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'group',
          },
          key: 'uuid',
        },
        allowNull: false,
        onDelete: 'CASCADE',
      },
      name: {
        type: Sequelize.STRING,
        defaultValue: null,
      },
      description: {
        type: Sequelize.STRING,
        defaultValue: null,
      },
      q_id: {
        type: Sequelize.UUID,
        defaultValue: null,
      },
      start_date: {
        type: Sequelize.DATE,
        defaultValue: null,
      },
      end_date: {
        type: Sequelize.DATE,
        defaultValue: null,
      },
      duration: {
        type: Sequelize.INTEGER,
        defaultValue: null,
      },
      start_time: {
        type: Sequelize.DATE,
        defaultValue: null,
      },
      end_time: {
        type: Sequelize.DATE,
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
        allowNull: false,
        onDelete: 'CASCADE',
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: "active",
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
    await queryInterface.dropTable('vaccination_type');
  },
};
