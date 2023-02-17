const commonService = require('../services/common-service');
const { Joi } = require('../services/imports');

const getProblemByIdSchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const getProblemListSchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  userId: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  startedFrom: Joi.date().allow('', null).error(commonService.getValidationMessage),
  fromDate: Joi.date().allow('', null).error(commonService.getValidationMessage),
  toDate: Joi.date().allow('', null).error(commonService.getValidationMessage),
  status: Joi.string().valid('Active', 'Archived').allow('', null).error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const archiveProblemSchema = Joi.object({
  uuids: Joi.array()
    .items(Joi.string().guid({ version: 'uuidv4' }))
    .required()
    .error(commonService.getValidationMessage),
  status: Joi.string().valid('Active', 'Archived').required().error(commonService.getValidationMessage),
  userId: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const deleteProblemSchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const saveProblemSchema = Joi.object({
  refer: Joi.string().required(),
  describe: Joi.string().allow('', null),
  startedFrom: Joi.date().max('now').required(),
  managedStatus: Joi.number().required().max(5),
  effectOnMood: Joi.number().required().max(5),
  status: Joi.string().valid('Active', 'Archived').allow('', null).error(commonService.getValidationMessage),
  userId: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const getProblemRecordByIdSchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const getProblemRecordListSchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  userId: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  problemId: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  datetime: Joi.date().allow('', null).error(commonService.getValidationMessage),
  fromDate: Joi.date().allow('', null).error(commonService.getValidationMessage),
  toDate: Joi.date().allow('', null).error(commonService.getValidationMessage),
  status: Joi.string().valid('Active', 'Archived').allow('', null).error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const archiveProblemRecordSchema = Joi.object({
  uuids: Joi.array()
    .items(Joi.string().guid({ version: 'uuidv4' }))
    .required()
    .error(commonService.getValidationMessage),
  status: Joi.string().valid('Active', 'Archived').required().error(commonService.getValidationMessage),
  userId: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const deleteProblemRecordSchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const saveProblemRecordSchema = Joi.object({
  notes: Joi.string().allow('', null).error(commonService.getValidationMessage),
  datetime: Joi.date().max('now').required().error(commonService.getValidationMessage),
  managedStatus: Joi.number().required().max(5).error(commonService.getValidationMessage),
  effectOnMood: Joi.number().required().max(5).error(commonService.getValidationMessage),
  userId: Joi.string().guid({ version: 'uuidv4' }).allow(0, null).error(commonService.getValidationMessage),
  problemId: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
  status: Joi.string().valid('Active', 'Archived').allow('', null).error(commonService.getValidationMessage),
  add_to_diary: Joi.boolean().allow(null).default(false).error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const updateProblemRecordSchema = saveProblemRecordSchema
  .append({
    uuid: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
  })
  .error(commonService.getValidationMessage);

const problemRecordGetChartDataSchema = Joi.object({
  problemId: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
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
  validateSaveProblem: async (dataToValidate) => await validateFunc(saveProblemSchema, dataToValidate),
  validateProblemGetById: async (dataToValidate) => await validateFunc(getProblemByIdSchema, dataToValidate),
  validateProblemGetList: async (dataToValidate) => await validateFunc(getProblemListSchema, dataToValidate),
  validateProblemArchive: async (dataToValidate) => await validateFunc(archiveProblemSchema, dataToValidate),
  validateProblemDelete: async (dataToValidate) => await validateFunc(deleteProblemSchema, dataToValidate),

  validateSaveProblemRecord: async (dataToValidate) => await validateFunc(saveProblemRecordSchema, dataToValidate),
  validateUpdateProblemRecord: async (dataToValidate) => await validateFunc(updateProblemRecordSchema, dataToValidate),
  validateProblemRecordGetById: async (dataToValidate) =>
    await validateFunc(getProblemRecordByIdSchema, dataToValidate),
  validateProblemRecordGetList: async (dataToValidate) =>
    await validateFunc(getProblemRecordListSchema, dataToValidate),
  validateProblemRecordArchive: async (dataToValidate) =>
    await validateFunc(archiveProblemRecordSchema, dataToValidate),
  validateProblemRecordDelete: async (dataToValidate) => await validateFunc(deleteProblemRecordSchema, dataToValidate),
  validateProblemRecordGetChartData: async (dataToValidate) =>
    await validateFunc(problemRecordGetChartDataSchema, dataToValidate),
};
