const commonService = require('../services/common-service');
const { Joi } = require('../services/imports');

const getByUuidSchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const insertTemperatureSchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  userId: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  date: Joi.date().allow('', null).error(commonService.getValidationMessage),
  bodyTemperature: Joi.number().allow('', null).error(commonService.getValidationMessage),
  status: Joi.string()
    .valid('Active', 'Inactive', 'Archived')
    .allow('', null)
    .default('Active')
    .error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const getTemperatureSchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  userId: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  date: Joi.date().allow(null).error(commonService.getValidationMessage),
  status: Joi.string()
    .valid('Active', 'Inactive', 'Archived')
    .allow('', null)
    .default('Active')
    .error(commonService.getValidationMessage),
  bodyTemperature: Joi.number().allow(null).error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const deleteSchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const updateSchema = insertTemperatureSchema
  .append({
    uuid: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
    userId: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
    date: Joi.date().allow(null).error(commonService.getValidationMessage),
    status: Joi.string()
      .valid('Active', 'Inactive', 'Archived')
      .allow('', null)
      .default('Active')
      .error(commonService.getValidationMessage),
    bodyTemperature: Joi.number().allow(null).error(commonService.getValidationMessage),
  })
  .error(commonService.getValidationMessage);

const getChartDataSchema = Joi.object({
  userId: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  date: Joi.date().required().error(commonService.getValidationMessage),
  type: Joi.string().allow('', null).error(commonService.getValidationMessage),
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
  validateSaveTemperature: async (dataToValidate) => await validateFunc(insertTemperatureSchema, dataToValidate),
  validateGetTemperature: async (dataToValidate) => await validateFunc(getTemperatureSchema, dataToValidate),

  validateGetByUuid: async (dataToValidate) => await validateFunc(getByUuidSchema, dataToValidate),
  validateGetChartData: async (dataToValidate) => await validateFunc(getChartDataSchema, dataToValidate),
  validateDelete: async (dataToValidate) => await validateFunc(deleteSchema, dataToValidate),
  validateUpdate: async (dataToValidate) => await validateFunc(updateSchema, dataToValidate),
};
