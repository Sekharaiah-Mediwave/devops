const commonService = require('../services/common-service');
const { Joi } = require('../services/imports');

const rGoalStep = Joi.object().keys({
  name: Joi.string().max(255),
  meta_how_often: Joi.string().valid('once_a_day', 'other'),
  meta_do_this_for_type: Joi.string().valid('days', 'weeks', 'months'),
  meta_do_this_for_value: Joi.number(),
  meta_has_reminder: Joi.boolean(),
  isDelete: Joi.boolean().default(false),
  meta_days: Joi.array().items(Joi.string().valid('mon', 'tues', 'wed', 'thur', 'fri', 'sat', 'sun')),
  // .toISOString() from frontend
  meta_times: Joi.array().items(Joi.date()),
  id: Joi.number(),
  uuid: Joi.string().guid({ version: 'uuidv4' }),
  meta_reminder_minutes: Joi.number().valid(15, 30, 45, 60, 75, 90, 120, 150)
})

const getListSchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  userId: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  status: Joi.string().valid('active', 'archived').allow('', null).error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const rGoal = Joi.object().keys({
  name: Joi.string().max(255).error(commonService.getValidationMessage),
  description: Joi.string().max(1000).error(commonService.getValidationMessage),
  archived_date: Joi.date().error(commonService.getValidationMessage),
  from_date: Joi.date().error(commonService.getValidationMessage),
  to_date: Joi.date().error(commonService.getValidationMessage),
  steps: Joi.array().items(rGoalStep).error(commonService.getValidationMessage),
  userId: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const getByIdSchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const getByDate = Joi.object({
  date: Joi.date().allow(null).error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const getById = Joi.object({
  goal_id: Joi.string().guid({ version: 'uuidv4' }).error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const getByEntryId = Joi.object({
  entry_id: Joi.string().guid({ version: 'uuidv4' }).error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const status = Joi.object({
  status: Joi.string().valid('active', 'archived', 'completed').error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const saveSchema = Joi.object({
  userId: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  entryDate: Joi.date().allow(null).error(commonService.getValidationMessage),
  status: Joi.string()
    .valid('Active', 'Inactive', 'Archived')
    .allow('', null)
    .default('Active')
    .error(commonService.getValidationMessage),
  notes: Joi.string().allow('', null).error(commonService.getValidationMessage),
  createdFrom: Joi.string()
    .allow('', null)
    .valid('diary', 'alcohol', 'mood', 'sleep', 'smoke', 'pain', 'problem')
    .default('diary')
    .error(commonService.getValidationMessage),
  add_to_diary: Joi.boolean().error(commonService.getValidationMessage),
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
    notes: Joi.string().allow('', null).error(commonService.getValidationMessage),
  })
  .error(commonService.getValidationMessage);

const archiveSchema = Joi.object({
  uuids: Joi.array()
    .items(Joi.string().guid({ version: 'uuidv4' }))
    .required()
    .error(commonService.getValidationMessage),
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
  fromDate: Joi.date().required().error(commonService.getValidationMessage),
  toDate: Joi.date().required().error(commonService.getValidationMessage),
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
  // validateGetById: async (dataToValidate) => {
  //   return await validateFunc(getByIdSchema, dataToValidate);
  // },
  validateGetList: async (dataToValidate) => {
    return await validateFunc(getListSchema, dataToValidate);
  },
  validateStatus: async (dataToValidate) => {
    return await validateFunc(status, dataToValidate);
  },
  validateSave: async (dataToValidate) => {
    return await validateFunc(rGoal, dataToValidate);
  },
  validateGetByDate: async (dataToValidate) => {
    return await validateFunc(getByDate, dataToValidate);
  },
  validateGetById: async (dataToValidate) => {
    return await validateFunc(getById, dataToValidate);
  },
  validateGetByEntryId: async (dataToValidate) => {
    return await validateFunc(getByEntryId, dataToValidate);
  },
};
