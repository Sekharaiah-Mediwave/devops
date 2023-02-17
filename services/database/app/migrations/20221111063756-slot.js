module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('slot', {
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
      clinic_id: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'clinic',
          },
          key: 'uuid',
        },
        allowNull: false,
        onDelete: 'CASCADE',
      },
      clinic_time_id: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'clinic_time',
          },
          key: 'uuid',
        },
        allowNull: false,
        onDelete: 'CASCADE',
      },
      start_time: {
        type: Sequelize.DATE,
        defaultValue: null,
      },
      end_time: {
        type: Sequelize.DATE,
        defaultValue: null,
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: "available",
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
    await queryInterface.dropTable('slot');
  },
};
