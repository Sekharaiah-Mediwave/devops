const commonService = require('../services/common-service');
const { Joi } = require('../services/imports');

const getByUuidSchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
})
  // .or("userId", "id")
  .error(commonService.getValidationMessage);

const saveSchema = Joi.object({
  userId: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  entryDate: Joi.date().allow(null).error(commonService.getValidationMessage),
  status: Joi.string()
    .valid('Active', 'Inactive', 'Archived')
    .allow('', null)
    .default('Active')
    .error(commonService.getValidationMessage),
  managedStatus: Joi.number().allow(null).error(commonService.getValidationMessage),
  heartRate: Joi.number().allow(null).error(commonService.getValidationMessage),
  diastolicBloodPressure: Joi.number().allow(null).error(commonService.getValidationMessage),
  systolicBloodPressure: Joi.number().allow(null).error(commonService.getValidationMessage),
  notes: Joi.string().allow('', null).error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const updateSchema = saveSchema
  .append({
    uuid: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
    userId: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
    entryDate: Joi.date().allow(null).error(commonService.getValidationMessage),
    status: Joi.string()
      .valid('Active', 'Inactive', 'Archived')
      .allow('', null)
      .default('Active')
      .error(commonService.getValidationMessage),
    managedStatus: Joi.number().allow(null).error(commonService.getValidationMessage),
    heartRate: Joi.number().allow(null).error(commonService.getValidationMessage),
    diastolicBloodPressure: Joi.number().allow(null).error(commonService.getValidationMessage),
    systolicBloodPressure: Joi.number().allow(null).error(commonService.getValidationMessage),
    notes: Joi.string().allow('', null).error(commonService.getValidationMessage),
  })
  .error(commonService.getValidationMessage);

const archiveSchema = Joi.object({
  uuids: Joi.array().items(Joi.string()).required().error(commonService.getValidationMessage),
  status: Joi.string()
    .valid('Active', 'Archived')
    .allow('', null)
    .default('Active')
    .error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const deleteSchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const getChartDataSchema = Joi.object({
  userId: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  date: Joi.date().required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const getListSchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  userId: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  entryDate: Joi.date().allow(null).error(commonService.getValidationMessage),
  status: Joi.string()
    .valid('Active', 'Inactive', 'Archived')
    .allow('', null)
    .default('Active')
    .error(commonService.getValidationMessage),
  managedStatus: Joi.number().allow(null).error(commonService.getValidationMessage),
  heartRate: Joi.number().allow(null).error(commonService.getValidationMessage),
  diastolicBloodPressure: Joi.number().allow(null).error(commonService.getValidationMessage),
  systolicBloodPressure: Joi.number().allow(null).error(commonService.getValidationMessage),
  notes: Joi.string().allow('', null).error(commonService.getValidationMessage),
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
  validateGetByUuid: async (dataToValidate) => await validateFunc(getByUuidSchema, dataToValidate),
  validateGetList: async (dataToValidate) => await validateFunc(getListSchema, dataToValidate),
  validateGetChartData: async (dataToValidate) => await validateFunc(getChartDataSchema, dataToValidate),
  validateSave: async (dataToValidate) => await validateFunc(saveSchema, dataToValidate),
  validateUpdate: async (dataToValidate) => await validateFunc(updateSchema, dataToValidate),
  validateArchive: async (dataToValidate) => await validateFunc(archiveSchema, dataToValidate),
  validateDelete: async (dataToValidate) => await validateFunc(deleteSchema, dataToValidate),
};
