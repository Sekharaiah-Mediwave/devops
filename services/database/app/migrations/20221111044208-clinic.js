module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('clinic', {
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
      appointment_type: {
        type: Sequelize.STRING,
        defaultValue: null,
      },
      vaccination_type_id: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'vaccination_type',
          },
          key: 'uuid',
        },
        allowNull: true,
        onDelete: 'CASCADE',
      },
      consultation_type: {
        type: Sequelize.STRING,
        defaultValue: null,
      },
      clinic_location_id: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'clinic_location',
          },
          key: 'uuid',
        },
        allowNull: true,
        onDelete: 'CASCADE',
      },
      consultation_detail: {
        type: Sequelize.STRING,
        defaultValue: null,
      },
      date: {
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
    await queryInterface.dropTable('clinic');
  },
};
