module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('vaccine_dose', {
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
      vaccination_type_id: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'vaccination_type',
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
      start: {
        type: Sequelize.INTEGER,
        defaultValue: null,
      },
      end: {
        type: Sequelize.INTEGER,
        defaultValue: null,
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
    await queryInterface.dropTable('vaccine_dose');
  },
};
