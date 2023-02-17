const commonService = require('../services/common-service');
const { Joi } = require('../services/imports');

const getByUuidSchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const archivedCopingByIdSchema = Joi.object({
  uuids: Joi.array().items(Joi.string()).required().error(commonService.getValidationMessage),
  archived: Joi.boolean().error(commonService.getValidationMessage),
  userId: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const insertCopingSchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  userId: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  title: Joi.string().allow('', null).error(commonService.getValidationMessage),
  description: Joi.string().allow('', null).error(commonService.getValidationMessage),
  achieved: Joi.boolean().error(commonService.getValidationMessage),
  // archived: Joi.boolean().error(commonService.getValidationMessage),

  status: Joi.string()
    .valid('Active', 'Inactive', 'Archived')
    .allow('', null)
    .default('Active')
    .error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const getCopingSchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  userId: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  title: Joi.string().allow('', null).error(commonService.getValidationMessage),
  description: Joi.string().allow('', null).error(commonService.getValidationMessage),
  achieved: Joi.boolean().error(commonService.getValidationMessage),
  archive: Joi.boolean().error(commonService.getValidationMessage),
  status: Joi.string()
    .valid('Active', 'Inactive', 'Archived')
    .allow('', null)
    .default('Active')
    .error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const deleteCopingSchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const updateCopingSchema = insertCopingSchema
  .append({
    uuid: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
    userId: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
    title: Joi.string().allow('', null).error(commonService.getValidationMessage),
    description: Joi.string().allow('', null).error(commonService.getValidationMessage),
    achieved: Joi.boolean().error(commonService.getValidationMessage),
    // archive: Joi.boolean().error(commonService.getValidationMessage),
    status: Joi.string()
      .valid('Active', 'Inactive', 'Archived')
      .allow('', null)
      .default('Active')
      .error(commonService.getValidationMessage),
  })
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
  validateGetByUuid: async (dataToValidate) => await validateFunc(getByUuidSchema, dataToValidate),
  validateSaveCoping: async (dataToValidate) => await validateFunc(insertCopingSchema, dataToValidate),
  validateGetCoping: async (dataToValidate) => await validateFunc(getCopingSchema, dataToValidate),

  validateArchived: async (dataToValidate) => await validateFunc(archivedCopingByIdSchema, dataToValidate),
  validateCopingDelete: async (dataToValidate) => await validateFunc(deleteCopingSchema, dataToValidate),
  validateCopingUpdate: async (dataToValidate) => await validateFunc(updateCopingSchema, dataToValidate),
};
