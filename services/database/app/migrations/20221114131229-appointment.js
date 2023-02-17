module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('appointment', {
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
      diagnosis_type: {
        type: Sequelize.STRING,
        defaultValue: null,
      },
      urgency_type: {
        type: Sequelize.STRING,
        defaultValue: null,
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
      slot_id: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'slot',
          },
          key: 'uuid',
        },
        allowNull: true,
        onDelete: 'CASCADE',
      },
      date: {
        type: Sequelize.DATE,
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
      status: {
        type: Sequelize.STRING,
        defaultValue: "booked",
      },
      patient_id: {
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
    await queryInterface.dropTable('appointment');
  },
};
