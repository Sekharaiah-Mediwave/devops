const commonService = require('../services/common-service');
const { Joi } = require('../services/imports');

const getPainByIdSchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const getPainListSchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  userId: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  status: Joi.string().valid('Active', 'Archived').allow('', null).error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const savePainSchema = Joi.object({
  refer: Joi.string().required().error(commonService.getValidationMessage),
  describeCondition: Joi.string().allow('').error(commonService.getValidationMessage),
  whereHurts: Joi.string().error(commonService.getValidationMessage),
  severity: Joi.number().min(0).max(10).required()
    .error(commonService.getValidationMessage),
  effectOnMood: Joi.number().min(1).max(5).required()
    .error(commonService.getValidationMessage),
  startedFrom: Joi.date().max('now').required().error(commonService.getValidationMessage),
  status: Joi.string()
    .valid('Active', 'Archived')
    .allow('', null)
    .default('Active')
    .error(commonService.getValidationMessage),
  userId: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const archivePainSchema = Joi.object({
  uuids: Joi.array()
    .items(Joi.string().guid({ version: 'uuidv4' }))
    .required()
    .error(commonService.getValidationMessage),
  status: Joi.string().valid('Active', 'Archived').required().error(commonService.getValidationMessage),
  userId: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const deletePainSchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const getPainRecordByIdSchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const getPainRecordListSchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  userId: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  painId: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  datetime: Joi.date().allow('', null).error(commonService.getValidationMessage),
  fromDate: Joi.date().allow('', null).error(commonService.getValidationMessage),
  toDate: Joi.date().allow('', null).error(commonService.getValidationMessage),
  status: Joi.string().valid('Active', 'Archived').allow('', null).error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const archivePainRecordSchema = Joi.object({
  uuids: Joi.array()
    .items(Joi.string().guid({ version: 'uuidv4' }))
    .required()
    .error(commonService.getValidationMessage),
  status: Joi.string().valid('Active', 'Archived').required().error(commonService.getValidationMessage),
  userId: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const deletePainRecordSchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const savePainRecordSchema = Joi.object({
  severity: Joi.number().min(0).max(10).required()
    .error(commonService.getValidationMessage),
  startedFrom: Joi.string()
    .valid('morning', 'afternoon', 'evening')
    .required()
    .error(commonService.getValidationMessage),
  duration: Joi.number().required().error(commonService.getValidationMessage), // minutes, 60X24 for whole day
  notes: Joi.string().allow('', null).error(commonService.getValidationMessage),
  datetime: Joi.date().max('now').required().error(commonService.getValidationMessage),
  effectOnMood: Joi.number().min(1).max(5).required()
    .max(5)
    .error(commonService.getValidationMessage),
  overviewsRate: Joi.number().min(1).max(5).required()
    .max(5)
    .error(commonService.getValidationMessage),
  userId: Joi.string().guid({ version: 'uuidv4' }).allow(0, null).error(commonService.getValidationMessage),
  painId: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
  status: Joi.string().valid('Active', 'Archived').allow('', null).error(commonService.getValidationMessage),
  add_to_diary: Joi.boolean().allow(null).default(false).error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const updatePainRecordSchema = savePainRecordSchema
  .append({
    uuid: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
  })
  .error(commonService.getValidationMessage);

const painRecordGetChartDataSchema = Joi.object({
  painId: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
  userId: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  date: Joi.date().required().error(commonService.getValidationMessage),
  type: Joi.string().valid('week', 'month', 'year').required().error(commonService.getValidationMessage),
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
  validateSavePain: async (dataToValidate) => await validateFunc(savePainSchema, dataToValidate),
  validatePainGetById: async (dataToValidate) => await validateFunc(getPainByIdSchema, dataToValidate),
  validatePainGetList: async (dataToValidate) => await validateFunc(getPainListSchema, dataToValidate),
  validatePainArchive: async (dataToValidate) => await validateFunc(archivePainSchema, dataToValidate),
  validatePainDelete: async (dataToValidate) => await validateFunc(deletePainSchema, dataToValidate),

  validateSavePainRecord: async (dataToValidate) => await validateFunc(savePainRecordSchema, dataToValidate),
  validateUpdatePainRecord: async (dataToValidate) => await validateFunc(updatePainRecordSchema, dataToValidate),
  validatePainRecordGetById: async (dataToValidate) => await validateFunc(getPainRecordByIdSchema, dataToValidate),
  validatePainRecordGetList: async (dataToValidate) => await validateFunc(getPainRecordListSchema, dataToValidate),
  validatePainRecordArchive: async (dataToValidate) => await validateFunc(archivePainRecordSchema, dataToValidate),
  validatePainRecordDelete: async (dataToValidate) => await validateFunc(deletePainRecordSchema, dataToValidate),
  validatePainRecordGetChartData: async (dataToValidate) =>
    await validateFunc(painRecordGetChartDataSchema, dataToValidate),
};
