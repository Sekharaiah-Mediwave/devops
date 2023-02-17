const commonService = require('../services/common-service');
const { Joi } = require('../services/imports');

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

const getByUuidSchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

module.exports = {
  validateGetByUuid: async (dataToValidate) => await validateFunc(getByUuidSchema, dataToValidate),
};
