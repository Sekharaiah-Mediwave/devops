const commonService = require('../services/common-service');
const { Joi } = require('../services/imports');

const getByIdSchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const saveSchema = Joi.object({
  name: Joi.string().required().error(commonService.getValidationMessage),
  permission: Joi.object().default(null).error(commonService.getValidationMessage),
  members: Joi.array().items(Joi.string().guid({ version: 'uuidv4' })).required()
    .error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const updateSchema = saveSchema
  .append({
    uuid: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
  })
  .error(commonService.getValidationMessage);

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('active', 'archived').required().error(commonService.getValidationMessage),
  uuids: Joi.array().items(Joi.string().guid({ version: 'uuidv4' })).required()
    .error(commonService.getValidationMessage),
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
  validateGetById: async (dataToValidate) => await validateFunc(getByIdSchema, dataToValidate),
  validateSave: async (dataToValidate) => await validateFunc(saveSchema, dataToValidate),
  validateUpdate: async (dataToValidate) => await validateFunc(updateSchema, dataToValidate),
  validateUpdateStatus: async (dataToValidate) => await validateFunc(updateStatusSchema, dataToValidate),
};
