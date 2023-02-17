module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('smoke_timeline', {
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
        allowNull: true,
      },
      smokedItems: {
        type: Sequelize.JSON,
      },
      quitBeforeStartAgain: {
        type: Sequelize.JSON,
      },
      smokeType: {
        type: Sequelize.STRING /* quitting, eCigarette */,
        defaultValue: 'quitting',
      },
      entryStartDate: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      averageSpendPerWeek: {
        type: Sequelize.INTEGER,
      },
      triedToQuitBefore: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      noSmokeEntries: {
        type: Sequelize.ARRAY(Sequelize.STRING),
      },
      entryEndDate: {
        type: Sequelize.DATE,
        defaultValue: null,
      },
      smokingTrigger: {
        type: Sequelize.STRING,
        defaultValue: null,
      },
      smokingTriggerOthers: {
        type: Sequelize.STRING,
        defaultValue: null,
      },
      notes: {
        type: Sequelize.STRING(1000),
        defaultValue: '',
      },
      status: {
        type: Sequelize.STRING /* Inactive --- tracker not active, InProgress --- if timeline not ends, Ended --- timeline has ended */,
        defaultValue: 'Active',
      },
      dailyReminder: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
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
    await queryInterface.dropTable('smoke_timeline');
  },
};
