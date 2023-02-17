const commonService = require('../services/common-service');
const { Joi } = require('../services/imports');

const updateMaiaSchema = Joi.object({
  globalSettings: Joi.object().unknown(true).required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);
const updateUserSchema = Joi.object({
  userSettings: Joi.object().unknown(true).required().error(commonService.getValidationMessage),
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
  validateMaiaUpdate: async (dataToValidate) => await validateFunc(updateMaiaSchema, dataToValidate),
  validateUserUpdate: async (dataToValidate) => await validateFunc(updateUserSchema, dataToValidate),
};
