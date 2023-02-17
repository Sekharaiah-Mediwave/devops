module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('pain_conditions', {
      id: {
        primaryKey: true,
        type: Sequelize.INTEGER,
        autoIncrement: true,
      },
      uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primarykey: true,
        unique: true,
      },
      userId: {
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
      fhirId: {
        type: Sequelize.INTEGER,
      },
      refer: {
        type: Sequelize.STRING(1000),
      },
      describeCondition: {
        type: Sequelize.TEXT,
      },
      whereHurts: {
        type: Sequelize.STRING(1000),
      },
      severity: {
        type: Sequelize.INTEGER, // 0 to 10
        defaultValue: 0,
      },
      effectOnMood: {
        type: Sequelize.INTEGER, // 0nt 1vb 2b 3s 4nsm 5naa,
        defaultValue: 0,
      },
      startedFrom: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: 'Active',
      },
      fhirSynced: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
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
    await queryInterface.dropTable('pain_conditions');
  },
};
