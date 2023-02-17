const commonService = require('../services/common-service');

module.exports = function modelRole(sequelize, types) {
  const User = sequelize.define(
    'user',
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
      fhirId: {
        type: types.INTEGER,
      },
      username: {
        type: types.STRING,
        allowNull: false,
        unique: {
          args: true,
          msg: 'Username already in use!',
        },
      },
      password: {
        type: types.STRING,
        allowNull: true,
      },
      email: {
        type: types.STRING,
        unique: {
          args: true,
          msg: 'Email address already in use!',
        },
      },
      mobileNumber: {
        type: types.STRING,
      },
      firstName: {
        type: types.STRING,
      },
      middleName: {
        type: types.STRING,
      },
      lastName: {
        type: types.STRING,
      },
      address1: {
        type: types.STRING,
      },
      address2: {
        type: types.STRING,
      },
      address3: {
        type: types.STRING,
      },
      address4: {
        type: types.STRING,
      },
      loginType: {
        type: types.STRING /* normal, google, azure, nhs */,
        defaultValue: 'normal',
      },
      maritalStatus: {
        type: types.STRING /* Single, Married, Not Specified */,
        defaultValue: 'Not Specified',
      },
      dob: {
        type: types.DATE,
      },
      nhsNumber: {
        type: types.STRING,
      },
      accessToken: {
        type: types.STRING(1000),
      },
      refreshToken: {
        type: types.STRING(1000),
      },
      termsAndCondition: {
        type: types.BOOLEAN,
        defaultValue: false,
      },
      privacyStatement: {
        type: types.BOOLEAN,
        defaultValue: false,
      },
      lastLoginDate: {
        type: types.DATE,
      },
      status: {
        type: types.STRING /* Active --- user verified, Inactive --- user not verified */,
        defaultValue: 'Inactive',
      },
      gender: {
        type: types.STRING /* Male, Female */,
      },
      mailOtp: {
        type: types.BOOLEAN,
        defaultValue: false,
      },
      mobileOtp: {
        type: types.BOOLEAN,
        defaultValue: false,
      },
      enabledTrackers: {
        type: types.JSON,
      },
      userSkin: {
        type: types.STRING,
        defaultValue: 'theme-default',
      },
      consent: {
        type: types.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: 'user',
    }
  );

  User.beforeCreate(async (user) => {
    try {
      if (user.password) {
        user.password = await commonService.hashPassword(user.password);
      }
    } catch (error) {
      console.log('\n save password hash error...', error);
    }
  });
  User.addHook('beforeUpdate', async (user) => {
    try {
      if (user.changed('password') && user.password) {
        user.password = await commonService.hashPassword(user.password);
      }
    } catch (error) {
      console.log('\n update password hash error...', error);
    }
  });

  User.associate = function (models) {
    User.hasMany(models.health_information, {
      as: 'healthInfo',
      foreignKey: 'userId',
      sourceKey: 'uuid',
    });
    User.hasMany(models.user_verification, {
      as: 'userVerification',
      foreignKey: 'userId',
      sourceKey: 'uuid',
    });
    User.hasMany(models.mood, {
      as: 'mood',
      foreignKey: 'userId',
      sourceKey: 'uuid',
    });
    User.hasMany(models.alcohol, {
      as: 'alcohol',
      foreignKey: 'userId',
      sourceKey: 'uuid',
    });
    User.hasMany(models.temperature, {
      as: 'temperature',
      foreignKey: 'userId',
      sourceKey: 'uuid',
    });
    User.hasMany(models.bmi, {
      as: 'bmi',
      foreignKey: 'userId',
      sourceKey: 'uuid',
    });
    User.hasMany(models.blood, {
      as: 'blood',
      foreignKey: 'userId',
      sourceKey: 'uuid',
    });
    User.hasMany(models.problem, {
      as: 'problemInfo',
      foreignKey: 'userId',
      sourceKey: 'uuid',
    });
    User.hasMany(models.problem_records, {
      as: 'problemRecords',
      foreignKey: 'userId',
      sourceKey: 'uuid',
    });
    User.hasMany(models.contact_information, {
      as: 'contactInfo',
      foreignKey: 'userId',
      sourceKey: 'uuid',
    });
    User.hasMany(models.personal_information, {
      as: 'personalInfo',
      foreignKey: 'userId',
      sourceKey: 'uuid',
    });
    User.hasMany(models.circle, {
      as: 'connectFrom',
      foreignKey: 'fromId',
      sourceKey: 'uuid',
    });
    User.hasMany(models.circle, {
      as: 'connectTo',
      foreignKey: 'toId',
      sourceKey: 'uuid',
    });
    User.hasMany(models.chat_room, {
      as: 'createdbyUser',
      foreignKey: 'created_by',
      sourceKey: 'uuid',
    });
    User.hasMany(models.chat_room_messages, {
      as: 'messageAuthor',
      foreignKey: 'author',
      sourceKey: 'uuid',
    });
    User.hasMany(models.chat_room_participants, {
      as: 'participantsUser',
      foreignKey: 'userId',
      sourceKey: 'uuid',
    });
    User.belongsTo(models.user_role, {
      as: 'userRole',
      targetKey: 'userId',
      foreignKey: 'uuid',
    });
    User.belongsTo(models.user_profile, {
      as: 'userProfile',
      targetKey: 'userId',
      foreignKey: 'uuid',
    });
    User.belongsTo(models.directory_settings, {
      as: 'directorySettings',
      targetKey: 'userId',
      foreignKey: 'uuid',
    });
    User.belongsTo(models.account_settings, {
      as: 'accountSettings',
      targetKey: 'userId',
      foreignKey: 'uuid',
    });
    User.belongsTo(models.user_profile, {
      as: 'userResourceLibrary',
      targetKey: 'userId',
      foreignKey: 'uuid',
    });
    User.belongsTo(models.user_module, {
      as: 'userModule',
      targetKey: 'userId',
      foreignKey: 'uuid',
    });
    User.hasMany(models.user_module, {
      as: 'invitedUserModule',
      foreignKey: 'createdBy',
      sourceKey: 'uuid',
    });
    User.hasMany(models.authenticated_apps, {
      as: 'authenticatedApps',
      foreignKey: 'userId',
      sourceKey: 'uuid',
    });
  };

  return User;
};
