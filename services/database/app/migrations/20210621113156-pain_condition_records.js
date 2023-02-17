module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('pain_condition_records', {
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
      fhirId: {
        type: Sequelize.INTEGER,
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
      painId: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'pain_conditions',
          },
          key: 'uuid',
        },
        allowNull: false,
        onDelete: 'CASCADE',
      },
      datetime: {
        type: Sequelize.DATE,
      },
      severity: {
        type: Sequelize.INTEGER, // 0 to 10
        defaultValue: 0,
      },
      startedFrom: {
        type: Sequelize.STRING(100),
        defaultValue: 'morning', // morning, afternoon, evening
      },
      duration: {
        type: Sequelize.INTEGER, // in minutes
        defaultValue: 0,
      },
      effectOnMood: {
        type: Sequelize.INTEGER, // 0nt 1vb 2b 3s 4nsm 5naa,
        defaultValue: 0,
      },
      overviewsRate: {
        type: Sequelize.INTEGER, // 0nt 1vp 2p 3a 4w 5vw
      },
      notes: {
        type: Sequelize.TEXT,
      },
      status: {
        type: Sequelize.STRING, // Archived, Active
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
    await queryInterface.dropTable('pain_condition_records');
  },
};
