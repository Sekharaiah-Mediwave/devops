module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('personal_information', {
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
      myPersonalHistory: {
        /** MY BACKGROUND START */ type: Sequelize.TEXT,
      },
      myFamilyAndFriends: {
        type: Sequelize.TEXT,
      },
      myHistoryAndLifestyle: {
        type: Sequelize.TEXT,
      },
      thingsIvalue: {
        type: Sequelize.TEXT,
      },
      spiritualBeliefs: {
        type: Sequelize.TEXT,
      },
      achievementsAndInterests: {
        type: Sequelize.TEXT,
      },
      favouritePlaces: {
        type: Sequelize.TEXT,
      } /** END */,
      auditoryHearing: {
        /** MY NEEDS START */ type: Sequelize.INTEGER,
      },
      auditoryDescription: {
        type: Sequelize.TEXT,
      },
      visuallyHearing: {
        type: Sequelize.INTEGER,
      },
      visuallyDescription: {
        type: Sequelize.TEXT,
      },
      mobilityHearing: {
        type: Sequelize.TEXT,
      },
      mobilityDescription: {
        type: Sequelize.TEXT,
      },
      importantRoutines: {
        type: Sequelize.TEXT,
      },
      thingsThatUpsetMe: {
        type: Sequelize.TEXT,
      },
      thingsThatCalmMeOrHelpMeSleep: {
        type: Sequelize.TEXT,
      },
      thingsIcanDoForMyself: {
        type: Sequelize.TEXT,
      },
      thingsImightNeedHelpWith: {
        type: Sequelize.TEXT,
      },
      notesOnMyPersonalCare: {
        type: Sequelize.TEXT,
      },
      eatingAndDrinking: {
        type: Sequelize.TEXT,
      },
      howItakeMyMedication: {
        type: Sequelize.TEXT,
      },
      thingsIdLikeYouToKnowAboutMe: {
        type: Sequelize.TEXT,
      } /** END */,
      myStrengths: {
        /** GOALS START */ type: Sequelize.TEXT,
      },
      myWeaknesses: {
        type: Sequelize.TEXT,
      },
      longTermHealthGoals: {
        type: Sequelize.TEXT,
      },
      howOthersSeeMe: {
        type: Sequelize.TEXT,
      } /** END */,
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
    await queryInterface.dropTable('personal_information');
  },
};
