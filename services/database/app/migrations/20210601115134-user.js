module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user', {
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
      fhirId: {
        type: Sequelize.INTEGER,
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING,
        unique: true,
      },
      mobileNumber: {
        type: Sequelize.STRING,
      },
      firstName: {
        type: Sequelize.STRING,
      },
      middleName: {
        type: Sequelize.STRING,
      },
      lastName: {
        type: Sequelize.STRING,
      },
      address1: {
        type: Sequelize.STRING,
      },
      address2: {
        type: Sequelize.STRING,
      },
      address3: {
        type: Sequelize.STRING,
      },
      address4: {
        type: Sequelize.STRING,
      },
      loginType: {
        type: Sequelize.STRING /* normal, google, azure, nhs */,
        defaultValue: 'normal',
      },
      maritalStatus: {
        type: Sequelize.STRING /* Single, Married, Not Specified */,
        defaultValue: 'Not Specified',
      },
      dob: {
        type: Sequelize.DATE,
      },
      nhsNumber: {
        type: Sequelize.STRING,
      },
      accessToken: {
        type: Sequelize.STRING(1000),
      },
      refreshToken: {
        type: Sequelize.STRING(1000),
      },
      termsAndCondition: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      privacyStatement: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      lastLoginDate: {
        type: Sequelize.DATE,
      },
      status: {
        type: Sequelize.STRING /* Active --- user verified, Inactive --- user not verified */,
        defaultValue: 'Inactive',
      },
      gender: {
        type: Sequelize.STRING /* Male, Female */,
      },
      mailOtp: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      mobileOtp: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      enabledTrackers: {
        type: Sequelize.JSON,
      },
      userSkin: {
        type: Sequelize.STRING,
        defaultValue: 'theme-default',
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
    await queryInterface.dropTable('user');
  },
};
