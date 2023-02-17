module.exports = function modelRole(sequelize, types) {
  const ProfileInformation = sequelize.define(
    'personal_information',
    {
      id: {
        type: types.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        unique: true,
      },
      uuid: {
        type: types.UUID,
        defaultValue: types.UUIDV4,
        primarykey: true,
        unique: true,
      },
      userId: {
        type: types.UUID,
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
        type: types.INTEGER,
        allowNull: true,
      },
      myPersonalHistory: {
        /** MY BACKGROUND START */ type: types.TEXT,
      },
      myFamilyAndFriends: {
        type: types.TEXT,
      },
      myHistoryAndLifestyle: {
        type: types.TEXT,
      },
      thingsIvalue: {
        type: types.TEXT,
      },
      spiritualBeliefs: {
        type: types.TEXT,
      },
      achievementsAndInterests: {
        type: types.TEXT,
      },
      favouritePlaces: {
        type: types.TEXT,
      } /** END */,
      auditoryHearing: {
        /** MY NEEDS START */ type: types.INTEGER,
      },
      auditoryDescription: {
        type: types.TEXT,
      },
      visuallyHearing: {
        type: types.INTEGER,
      },
      visuallyDescription: {
        type: types.TEXT,
      },
      mobilityHearing: {
        type: types.TEXT,
      },
      mobilityDescription: {
        type: types.TEXT,
      },
      importantRoutines: {
        type: types.TEXT,
      },
      thingsThatUpsetMe: {
        type: types.TEXT,
      },
      thingsThatCalmMeOrHelpMeSleep: {
        type: types.TEXT,
      },
      thingsIcanDoForMyself: {
        type: types.TEXT,
      },
      thingsImightNeedHelpWith: {
        type: types.TEXT,
      },
      notesOnMyPersonalCare: {
        type: types.TEXT,
      },
      eatingAndDrinking: {
        type: types.TEXT,
      },
      howItakeMyMedication: {
        type: types.TEXT,
      },
      thingsIdLikeYouToKnowAboutMe: {
        type: types.TEXT,
      } /** END */,
      myStrengths: {
        /** GOALS START */ type: types.TEXT,
      },
      myWeaknesses: {
        type: types.TEXT,
      },
      longTermHealthGoals: {
        type: types.TEXT,
      },
      howOthersSeeMe: {
        type: types.TEXT,
      } /** END */,
      fhirSynced: {
        type: types.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: 'personal_information',
      indexes: [
        {
          fields: ['id', 'uuid', 'userId'],
        },
      ],
    }
  );

  ProfileInformation.addHook('beforeUpdate', (ProfileInformationRecord) => {
    try {
      ProfileInformationRecord.fhirSynced = false;
    } catch (error) {
      console.log('\n update profile information hook error...', error);
    }
  });

  ProfileInformation.associate = function (models) {
    ProfileInformation.belongsTo(models.user, {
      as: 'userInfo',
      foreignKey: 'userId',
      targetKey: 'uuid',
    });
  };

  return ProfileInformation;
};
