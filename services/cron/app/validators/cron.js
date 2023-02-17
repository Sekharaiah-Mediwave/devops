const commonService = require('../services/common-service');
const { Joi } = require('../services/imports');

const saveSchema = Joi.object({
  name: Joi.string().error(commonService.getValidationMessage),
  mailApiRoute: Joi.string().required().error(commonService.getValidationMessage),
  cronInitialValues: Joi.object({}).unknown(true).allow(null).error(commonService.getValidationMessage),
  cronScheduleTime: Joi.string().required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const updateSchema = saveSchema
  .append({
    uuid: Joi.string().guid({ version: 'uuidv4' }).error(commonService.getValidationMessage),
  })
  .or('name', 'uuid')
  .error(commonService.getValidationMessage);

const deleteSchema = Joi.object({
  name: Joi.string().error(commonService.getValidationMessage),
  uuid: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
})
  .or('uuid', 'name')
  .error(commonService.getValidationMessage);

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
  validateSave: async (dataToValidate) => await validateFunc(saveSchema, dataToValidate),
  validateUpdate: async (dataToValidate) => await validateFunc(updateSchema, dataToValidate),
  validateDelete: async (dataToValidate) => await validateFunc(deleteSchema, dataToValidate),
};
