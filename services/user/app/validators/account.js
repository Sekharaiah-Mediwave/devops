const commonService = require('../services/common-service');
const { Joi } = require('../services/imports');

const patterns = {
  positiveNumber: /^\d*[1-9]\d*$/,
  age: /^(?:1[0-9][0-9]|[1-9]|200|[1-9][0-9])$/,
  name: /^[a-zA-Z. ]+$/,
  // eslint-disable-next-line no-useless-escape
  mobile: /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]{10}$/,
  noSpace: /\S/,
};

const getMyProfileSchema = Joi.object({
  profileType: Joi.string()
    .valid('myBackground', 'myNeeds', 'myGoals')
    .required()
    .error(commonService.getValidationMessage),
});

const updateSchema = Joi.object({
  username: Joi.string().required().error(commonService.getValidationMessage),
  password: Joi.string().required().error(commonService.getValidationMessage),
  mobileNumber: Joi.string().allow('', null).error(commonService.getValidationMessage),
  firstName: Joi.string().pattern(patterns.name).allow('', null).error(commonService.getValidationMessage),
  lastName: Joi.string().pattern(patterns.name).allow('', null).error(commonService.getValidationMessage),
});

const updatePasswordSchema = Joi.object({
  password: Joi.string().required().error(commonService.getValidationMessage),
  newPassword: Joi.string().required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const updateMailSchema = Joi.object({
  otp: Joi.string().required().error(commonService.getValidationMessage),
  email: Joi.string()
    .required()
    .email({ tlds: { allow: false } })
    .error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const sendOtpMailSchema = Joi.object({
  email: Joi.string()
    .required()
    .email({ tlds: { allow: false } })
    .error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const enableTwoFactorAuthSchema = Joi.object({
  otp: Joi.string().required().error(commonService.getValidationMessage),
  mailOtp: Joi.boolean().allow(null).default(false).error(commonService.getValidationMessage),
  mobileOtp: Joi.boolean().allow(null).default(false).error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const myPersonalSchema = Joi.object({
  firstName: Joi.string().error(commonService.getValidationMessage),
  lastName: Joi.string().error(commonService.getValidationMessage),
  nameCalled: Joi.string().error(commonService.getValidationMessage),
  dob: Joi.date().error(commonService.getValidationMessage),
  mobileNumber: Joi.string().allow('', null).error(commonService.getValidationMessage),
  gender: Joi.string().valid('male', 'female').error(commonService.getValidationMessage),
  maritalStatus: Joi.string()
    .valid('Single', 'Married', 'Cohabiting', 'Divorced', 'Widowed')
    .error(commonService.getValidationMessage),
  ethnicity: Joi.string().error(commonService.getValidationMessage),
  profilePic: Joi.object({
    xs: Joi.string().allow('', null).error(commonService.getValidationMessage),
    sm: Joi.string().allow('', null).error(commonService.getValidationMessage),
    md: Joi.string().allow('', null).error(commonService.getValidationMessage),
    lg: Joi.string().allow('', null).error(commonService.getValidationMessage),
    xl: Joi.string().allow('', null).error(commonService.getValidationMessage),
  })
    .allow(null, '')
    .error(commonService.getValidationMessage),
  languagesSpoken: Joi.array().items(Joi.string()).error(commonService.getValidationMessage),
  iNeedAnInterpreter: Joi.boolean().error(commonService.getValidationMessage),
});

const myProfileSchema = Joi.object({
  profileType: Joi.string()
    .valid('myBackground', 'myNeeds', 'myGoals')
    .required()
    .error(commonService.getValidationMessage),
})
  .when(Joi.object({ profileType: Joi.string().valid('myBackground') }).unknown(), {
    then: Joi.object({
      myPersonalHistory: Joi.string().allow(null).allow('').error(commonService.getValidationMessage),
      myFamilyAndFriends: Joi.string().allow(null).allow('').error(commonService.getValidationMessage),
      myHistoryAndLifestyle: Joi.string().allow(null).allow('').error(commonService.getValidationMessage),
      thingsIvalue: Joi.string().allow(null).allow('').error(commonService.getValidationMessage),
      spiritualBeliefs: Joi.string().allow(null).allow('').error(commonService.getValidationMessage),
      achievementsAndInterests: Joi.string().allow(null).allow('').error(commonService.getValidationMessage),
      favouritePlaces: Joi.string().allow(null).allow('').error(commonService.getValidationMessage),
    }),
  })
  .when(Joi.object({ profileType: Joi.string().valid('myNeeds') }).unknown(), {
    then: Joi.object({
      auditoryHearing: Joi.number().allow(null).allow('').error(commonService.getValidationMessage),
      auditoryDescription: Joi.string().allow(null).allow('').error(commonService.getValidationMessage),
      visuallyHearing: Joi.number().allow(null).allow('').error(commonService.getValidationMessage),
      visuallyDescription: Joi.string().allow(null).allow('').error(commonService.getValidationMessage),
      mobilityHearing: Joi.number().allow(null).allow('').error(commonService.getValidationMessage),
      mobilityDescription: Joi.string().allow(null).allow('').error(commonService.getValidationMessage),
      importantRoutines: Joi.string().allow(null).allow('').error(commonService.getValidationMessage),
      thingsThatUpsetMe: Joi.string().allow(null).allow('').error(commonService.getValidationMessage),
      thingsThatCalmMeOrHelpMeSleep: Joi.string().allow(null).allow('').error(commonService.getValidationMessage),
      thingsIcanDoForMyself: Joi.string().allow(null).allow('').error(commonService.getValidationMessage),
      thingsImightNeedHelpWith: Joi.string().allow(null).allow('').error(commonService.getValidationMessage),
      notesOnMyPersonalCare: Joi.string().allow(null).allow('').error(commonService.getValidationMessage),
      eatingAndDrinking: Joi.string().allow(null).allow('').error(commonService.getValidationMessage),
      howItakeMyMedication: Joi.string().allow(null).allow('').error(commonService.getValidationMessage),
      thingsIdLikeYouToKnowAboutMe: Joi.string().allow(null).allow('').error(commonService.getValidationMessage),
    }),
  })
  .when(Joi.object({ profileType: Joi.string().valid('myGoals') }).unknown(), {
    then: Joi.object({
      myStrengths: Joi.string().allow(null).allow('').error(commonService.getValidationMessage),
      myWeaknesses: Joi.string().allow(null).allow('').error(commonService.getValidationMessage),
      longTermHealthGoals: Joi.string().allow(null).allow('').error(commonService.getValidationMessage),
      howOthersSeeMe: Joi.string().allow(null).allow('').error(commonService.getValidationMessage),
    }),
  });

const addUserTrackersSchema = Joi.object({
  enabledTrackers: Joi.object({
    sleep: Joi.boolean().error(commonService.getValidationMessage),
    problem: Joi.boolean().error(commonService.getValidationMessage),
    pain: Joi.boolean().error(commonService.getValidationMessage),
    mood: Joi.boolean().error(commonService.getValidationMessage),
    alcohol: Joi.boolean().error(commonService.getValidationMessage),
    smoke: Joi.boolean().error(commonService.getValidationMessage),
    'blood-pressure': Joi.boolean().error(commonService.getValidationMessage),
    'bmi-weight': Joi.boolean().error(commonService.getValidationMessage),
    temperature: Joi.boolean().error(commonService.getValidationMessage),
    overview: Joi.boolean().error(commonService.getValidationMessage),
    fitbitStep: Joi.boolean().optional().error(commonService.getValidationMessage),
  })
    .required()
    .error(commonService.getValidationMessage),
});

const keyHealthInfoSchema = Joi.object({
  nhsNumber: Joi.string().allow(null).allow('').error(commonService.getValidationMessage),
  hospitalDetails: Joi.array()
    .items(
      Joi.object({
        hospitalName: Joi.string().allow('', null),
        hospitalNumber: Joi.string().allow('', null),
      })
    )
    .error(commonService.getValidationMessage),
  primaryDiagnosis: Joi.array().items(Joi.string().allow(null).allow('')).error(commonService.getValidationMessage),
  secondaryDiagnosis: Joi.array().items(Joi.string().allow(null).allow('')).error(commonService.getValidationMessage),
  allergies: Joi.array().items(Joi.string().allow(null).allow('')).error(commonService.getValidationMessage),
  immunisations: Joi.array().items(Joi.string().allow(null).allow('')).error(commonService.getValidationMessage),
  bloodType: Joi.string().allow(null).allow('').error(commonService.getValidationMessage),
  familyHistory: Joi.array().items(Joi.string().allow(null).allow('')).error(commonService.getValidationMessage),
  height: Joi.number().allow(null).allow('').error(commonService.getValidationMessage),
  weight: Joi.number().allow(null).allow('').error(commonService.getValidationMessage),
  religion: Joi.string().allow(null).allow('').error(commonService.getValidationMessage),
  dietaryPreference: Joi.string().allow(null).allow('').error(commonService.getValidationMessage),
  socialCareNeeds: Joi.string().allow(null).allow('').error(commonService.getValidationMessage),
  organDonation: Joi.string().allow(null).allow('').error(commonService.getValidationMessage),
  advanceCarePlanningDocument: Joi.string().allow(null).allow('').error(commonService.getValidationMessage),
  powerOfAttorney: Joi.boolean().allow(null).allow('').error(commonService.getValidationMessage),
  iHaveAssignedSomeone: Joi.boolean().allow(null).allow('').error(commonService.getValidationMessage),
});

const keyContactSchema = Joi.object({
  nextOfKin: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().allow(null).allow('').error(commonService.getValidationMessage),
        contactNumber: Joi.string().allow(null).allow('').error(commonService.getValidationMessage),
        relationship: Joi.string().allow(null).allow('').error(commonService.getValidationMessage),
      })
    )
    .error(commonService.getValidationMessage),
  powerOfAttorney: Joi.object({
    name: Joi.string().allow(null).allow('').error(commonService.getValidationMessage),
    contactNumber: Joi.string().allow(null).allow('').error(commonService.getValidationMessage),
    relationship: Joi.string().allow(null).allow('').error(commonService.getValidationMessage),
  }).error(commonService.getValidationMessage),
  gp: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().allow(null).allow('').error(commonService.getValidationMessage),
        postcode: Joi.string().allow(null).allow('').error(commonService.getValidationMessage),
      })
    )
    .error(commonService.getValidationMessage),
  clinicians: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().allow(null).allow('').error(commonService.getValidationMessage),
        hospitalName: Joi.string().allow(null).allow('').error(commonService.getValidationMessage),
      })
    )
    .error(commonService.getValidationMessage),
  socialWorkers: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().allow(null).allow('').error(commonService.getValidationMessage),
        contactDetails: Joi.string().allow(null).allow('').error(commonService.getValidationMessage),
      })
    )
    .error(commonService.getValidationMessage),
});

const updateSkinSchema = Joi.object({
  userSkin: Joi.string()
    .valid('theme-default', 'theme-dark', 'theme-calm', 'theme-dyslexia')
    .required()
    .error(commonService.getValidationMessage),
});

const getUserDataSchema = Joi.object({
  userId: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

async function validateFunc(schemaName, dataToValidate) {
  try {
    const { error, value } = schemaName.validate(dataToValidate);
    return {
      error: error ? commonService.convertJoiErrors(error.details) : '',
      validatedData: value,
    };
  } catch (error) {
    return {
      error,
    };
  }
}

module.exports = {
  validateUpdateUser: async (dataToValidate) => await validateFunc(updateSchema, dataToValidate),
  validateMyProfileInfo: async (dataToValidate) => await validateFunc(myProfileSchema, dataToValidate),
  validateGetMyProfileInfo: async (dataToValidate) => await validateFunc(getMyProfileSchema, dataToValidate),
  validateMyPersonalDetails: async (dataToValidate) => await validateFunc(myPersonalSchema, dataToValidate),
  validateAddUserTrackers: async (dataToValidate) => await validateFunc(addUserTrackersSchema, dataToValidate),
  validateKeyHealthInfo: async (dataToValidate) => await validateFunc(keyHealthInfoSchema, dataToValidate),
  validateKeyContact: async (dataToValidate) => await validateFunc(keyContactSchema, dataToValidate),
  validateSendOtpMail: async (dataToValidate) => await validateFunc(sendOtpMailSchema, dataToValidate),
  validateEnableTwoFactorAuth: async (dataToValidate) => await validateFunc(enableTwoFactorAuthSchema, dataToValidate),
  validateUpdateMail: async (dataToValidate) => await validateFunc(updateMailSchema, dataToValidate),
  validateUpdatePassword: async (dataToValidate) => await validateFunc(updatePasswordSchema, dataToValidate),
  validateUpdateUserSkin: async (dataToValidate) => await validateFunc(updateSkinSchema, dataToValidate),
  validateGetUserData: async (dataToValidate) => await validateFunc(getUserDataSchema, dataToValidate),
};
