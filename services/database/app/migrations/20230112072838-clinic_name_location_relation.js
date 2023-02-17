module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('clinic_name_location_relation', {
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
      },
      clinic_name_id: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'clinic_name',
          },
          key: 'uuid',
        },
        allowNull: false,
        onDelete: 'CASCADE',
      },
      clinic_location_id: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'clinic_location',
          },
          key: 'uuid',
        },
        allowNull: false,
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
      updated_by: {
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
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('clinic_name_location_relation');
  },
};
