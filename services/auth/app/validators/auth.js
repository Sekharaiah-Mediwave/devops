/* eslint-disable no-useless-escape */
const config = require('../config/config');
const commonService = require('../services/common-service');
const { Joi } = require('../services/imports');

const patterns = {
  positiveNumber: /^\d*[1-9]\d*$/,
  age: /^(?:1[0-9][0-9]|[1-9]|200|[1-9][0-9])$/,
  name: /^[a-zA-Z ]+$/,
  mobile: /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]{10}$/,
  noSpace: /\S/,
};

const signUpSchema = Joi.object({
  username: Joi.string().required().error(commonService.getValidationMessage),
  email: Joi.string()
    .required()
    .email({ tlds: { allow: false } })
    .error(commonService.getValidationMessage),
  firstName: Joi.string().pattern(patterns.name).required().error(commonService.getValidationMessage),
  lastName: Joi.string().pattern(patterns.name).allow('', null).error(commonService.getValidationMessage),
  mobileNumber: Joi.string().allow('', null).pattern(patterns.mobile).error(commonService.getValidationMessage),
  dob: Joi.date().required().error(commonService.getValidationMessage),
  nhsNumber: Joi.number().allow('', null).error(commonService.getValidationMessage),
  haveCarer: Joi.boolean().error(commonService.getValidationMessage),
  careForSomeone: Joi.boolean().error(commonService.getValidationMessage),
  invitedUser: Joi.boolean().default(false).error(commonService.getValidationMessage),
  inviteCode: Joi.string().default(null).allow('', null).error(commonService.getValidationMessage),
  loginType: Joi.string().valid('normal', 'google', 'nhs', 'azure').error(commonService.getValidationMessage),
  roleName: Joi.string()
    .valid('', null, 'Clinician', 'non-clinician')
    .when('loginType', {
      is: Joi.string().valid('azure'),
      then: Joi.string().default(null),
    })
    .error(commonService.getValidationMessage),
  password: Joi.string()
    .allow('', null)
    .when('loginType', {
      is: Joi.string().valid('normal'),
      then: Joi.required(),
    })
    .error(commonService.getValidationMessage),
  accessToken: Joi.string()
    .allow('', null)
    .when('loginType', {
      is: Joi.string().invalid('nhs', 'normal'),
      then: Joi.required(),
    })
    .error(commonService.getValidationMessage),
  accessCode: Joi.string()
    .allow('', null)
    .when('loginType', {
      is: Joi.string().invalid('google', 'nhs', 'normal'),
      then: Joi.required(),
    })
    .error(commonService.getValidationMessage),
})
  .with('nhsNumber', ['loginType', 'accessToken'])
  .error(commonService.getValidationMessage);

const loginSchema = Joi.object({
  email: Joi.string().error(commonService.getValidationMessage),
  username: Joi.string().error(commonService.getValidationMessage),
  password: Joi.string()
    .allow('', null)
    .when('loginType', {
      is: Joi.string().valid('normal'),
      then: Joi.required(),
    })
    .error(commonService.getValidationMessage),
  loginType: Joi.string()
    .required()
    .valid('normal', 'google', 'nhs', 'azure')
    .default('normal')
    .error(commonService.getValidationMessage),
})
  .or('email', 'username')
  .error(commonService.getValidationMessage);

const loginWithOtpSchema = Joi.object({
  otp: Joi.string().required().error(commonService.getValidationMessage),
  email: Joi.string().error(commonService.getValidationMessage),
  username: Joi.string().error(commonService.getValidationMessage),
  password: Joi.string()
    .allow('', null)
    .when('loginType', {
      is: Joi.string().valid('normal'),
      then: Joi.required(),
    })
    .error(commonService.getValidationMessage),
  loginType: Joi.string()
    .required()
    .valid('normal', 'google', 'nhs', 'azure')
    .default('normal')
    .error(commonService.getValidationMessage),
})
  .or('email', 'username')
  .error(commonService.getValidationMessage);

const resetPasswordMailSchema = Joi.object({
  email: Joi.string()
    .required()
    .email({ tlds: { allow: false } })
    .error(commonService.getValidationMessage),
});

const resetPasswordSchema = Joi.object({
  username: Joi.string().required().error(commonService.getValidationMessage),
  token: Joi.string().max(6).required().pattern(patterns.noSpace).error(commonService.getValidationMessage),
  password: Joi.string().required().error(commonService.getValidationMessage),
});

const getAccessTokenSignUpOtpSchema = Joi.object({
  username: Joi.string().required().error(commonService.getValidationMessage),
  token: Joi.string().max(6).required().pattern(patterns.noSpace).error(commonService.getValidationMessage),
});

const verifyUserTokenSchema = Joi.object({
  username: Joi.string().required().error(commonService.getValidationMessage),
  token: Joi.string().max(6).required().pattern(patterns.noSpace).error(commonService.getValidationMessage),
});

const getRefreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().error(commonService.getValidationMessage),
});

const verifyUserAccountSchema = Joi.object({
  username: Joi.string().required().error(commonService.getValidationMessage),
  token: Joi.string().max(6).required().error(commonService.getValidationMessage),
});

const getUserFromNhsSchema = Joi.object({
  authoriseCode: Joi.string().required().error(commonService.getValidationMessage),
});

const getThirdPartyLoginSchema = Joi.object({
  loginType: Joi.string().required().error(commonService.getValidationMessage),
  email: Joi.string()
    .allow('', null)
    .email({ tlds: { allow: false } })
    .when('loginType', {
      is: Joi.string().invalid('nhs'),
      then: Joi.required(),
    })
    .error(commonService.getValidationMessage),
  accessToken: Joi.string()
    .allow('', null)
    .when('loginType', {
      is: Joi.string().invalid('nhs', 'normal'),
      then: Joi.required(),
    })
    .error(commonService.getValidationMessage),
  accessCode: Joi.string()
    .allow('', null)
    .when('loginType', {
      is: Joi.string().invalid('google', 'normal'),
      then: Joi.required(),
    })
    .error(commonService.getValidationMessage),
});

const checkUserExistsSchema = Joi.object({
  email: Joi.string().error(commonService.getValidationMessage),
  username: Joi.string().error(commonService.getValidationMessage),
})
  .or('email', 'username')
  .error(commonService.getValidationMessage);

const deleteUserSchema = Joi.object({
  email: Joi.string().error(commonService.getValidationMessage),
  username: Joi.string().error(commonService.getValidationMessage),
  uuid: Joi.string().error(commonService.getValidationMessage),
})
  .or('email', 'username', 'id', 'uuid')
  .error(commonService.getValidationMessage);

const getUserRoleSchema = Joi.object({
  email: Joi.string().required().error(commonService.getValidationMessage),
  roleName: Joi.string()
    .valid(config.roleNames.sa, config.roleNames.cl, config.roleNames.p, config.roleNames.t, config.roleNames.a, config.roleNames.ma)
    .error(commonService.getValidationMessage),
});

const updateUserInvite = Joi.object({
  inviteCode: Joi.string().required().pattern(patterns.noSpace).error(commonService.getValidationMessage),
  email: Joi.string()
    .required()
    .email({ tlds: { allow: false } })
    .error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const generateQBToken = Joi.object({
  token: Joi.string().required().error(commonService.getValidationMessage),
  refreshToken: Joi.string().required().error(commonService.getValidationMessage),
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
  validateLoginUser: async (dataToValidate) => await validateFunc(loginSchema, dataToValidate),
  validateLoginWithOtp: async (dataToValidate) => await validateFunc(loginWithOtpSchema, dataToValidate),
  validateSignUpUser: async (dataToValidate) => await validateFunc(signUpSchema, dataToValidate),
  validateResetPassowrdMail: async (dataToValidate) => await validateFunc(resetPasswordMailSchema, dataToValidate),
  validateResetPassowrd: async (dataToValidate) => await validateFunc(resetPasswordSchema, dataToValidate),
  validateGetAccessTokenSignUpOtp: async (dataToValidate) =>
    await validateFunc(getAccessTokenSignUpOtpSchema, dataToValidate),
  validateVerifyUserToken: async (dataToValidate) => await validateFunc(verifyUserTokenSchema, dataToValidate),
  validateRefreshToken: async (dataToValidate) => await validateFunc(getRefreshTokenSchema, dataToValidate),
  validateVerifyUserAccount: async (dataToValidate) => await validateFunc(verifyUserAccountSchema, dataToValidate),
  validateGetUserFromNhs: async (dataToValidate) => await validateFunc(getUserFromNhsSchema, dataToValidate),
  validateThirdPartyAuth: async (dataToValidate) => await validateFunc(getThirdPartyLoginSchema, dataToValidate),
  validateUserExists: async (dataToValidate) => await validateFunc(checkUserExistsSchema, dataToValidate),
  validateDeleteUser: async (dataToValidate) => await validateFunc(deleteUserSchema, dataToValidate),
  validateChangeUserRole: async (dataToValidate) => await validateFunc(getUserRoleSchema, dataToValidate),
  updateUserInvite: async (dataToValidate) => await validateFunc(updateUserInvite, dataToValidate),
  generateQBToken: async (dataToValidate) => await validateFunc(generateQBToken, dataToValidate),
};
