/* eslint-disable no-useless-escape */
const commonService = require('../services/common-service');
const { Joi } = require('../services/imports');

const patterns = {
  positiveNumber: /^\d*[1-9]\d*$/,
  age: /^(?:1[0-9][0-9]|[1-9]|200|[1-9][0-9])$/,
  name: /^[a-zA-Z. ]+$/,
  mobile: /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]{10}$/,
  noSpace: /\S/,
};

const resetPasswordMailSchema = Joi.object({
  token: Joi.string().required().pattern(patterns.noSpace).error(commonService.getValidationMessage),
  username: Joi.string().required().error(commonService.getValidationMessage),
  email: Joi.string()
    .required()
    .email({ tlds: { allow: false } })
    .error(commonService.getValidationMessage),
});

const accountVerificationMailSchema = Joi.object({
  token: Joi.string().required().pattern(patterns.noSpace).error(commonService.getValidationMessage),
  username: Joi.string().required().error(commonService.getValidationMessage),
  email: Joi.string()
    .required()
    .email({ tlds: { allow: false } })
    .error(commonService.getValidationMessage),
});

const inviteUser = Joi.object({
  inviteCode: Joi.string().required().pattern(patterns.noSpace).error(commonService.getValidationMessage),
  invitedUserEmail: Joi.string()
    .required()
    .email({ tlds: { allow: false } })
    .error(commonService.getValidationMessage),
  invitedUserFname: Joi.string().pattern(patterns.name).required().error(commonService.getValidationMessage),
  invitedUserLname: Joi.string().pattern(patterns.name).allow('', null).error(commonService.getValidationMessage),
});

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
  validateResetPasswordMail: async (dataToValidate) => await validateFunc(resetPasswordMailSchema, dataToValidate),
  validateAccountVerificationMail: async (dataToValidate) =>
    await validateFunc(accountVerificationMailSchema, dataToValidate),
  inviteUser: async (dataToValidate) => await validateFunc(inviteUser, dataToValidate),
};
