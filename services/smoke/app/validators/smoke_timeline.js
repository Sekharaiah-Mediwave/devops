const commonService = require('../services/common-service');
const { Joi } = require('../services/imports');

const getListSchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  userId: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  entryStartDate: Joi.date().allow('', null).error(commonService.getValidationMessage),
  entryEndDate: Joi.date().allow('', null).error(commonService.getValidationMessage),
  status: Joi.string()
    .valid('InProgress', 'Ended')
    .allow('', null)
    .default('Ended')
    .error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const getLatestQuittingSchema = Joi.object({
  userId: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  status: Joi.string()
    .valid('InProgress', 'Ended')
    .allow('', null)
    .default('InProgress')
    .error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const getChartDataSchema = Joi.object({
  userId: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  date: Joi.date().required().error(commonService.getValidationMessage),
  type: Joi.string().valid('week', 'month', 'year').required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const cigaretteInnerJson = {
  singles: Joi.number().min(0).allow(null).error(commonService.getValidationMessage),
  packets: Joi.number().min(0).allow(null).error(commonService.getValidationMessage),
};

const saveSchema = Joi.object({
  userId: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  smokedItems: Joi.object({
    cigarette: Joi.object(cigaretteInnerJson).allow(null).error(commonService.getValidationMessage),
    rollUps: Joi.object(cigaretteInnerJson).allow(null).error(commonService.getValidationMessage),
    lightCigarette: Joi.object(cigaretteInnerJson).allow(null).error(commonService.getValidationMessage),
    other: Joi.object({ packets: cigaretteInnerJson.packets }).allow(null).error(commonService.getValidationMessage),
  })
    .min(1)
    .required()
    .error(commonService.getValidationMessage),
  quitBeforeStartAgain: Joi.object({
    years: Joi.number().min(0).allow(null).default(0).error(commonService.getValidationMessage),
    months: Joi.number().min(0).max(12).allow(null).default(0).error(commonService.getValidationMessage),
    days: Joi.number().min(0).max(31).allow(null).default(0).error(commonService.getValidationMessage),
  }).error(commonService.getValidationMessage),
  smokeType: Joi.string()
    .valid('quitting', 'eCigarette')
    .required()
    .default('quitting')
    .error(commonService.getValidationMessage),
  entryStartDate: Joi.date().max('now').required().error(commonService.getValidationMessage),
  notes: Joi.string().allow('', null).error(commonService.getValidationMessage),
  triedToQuitBefore: Joi.boolean().required().error(commonService.getValidationMessage),
  averageSpendPerWeek: Joi.number().min(0).required().error(commonService.getValidationMessage),
  managedStatus: Joi.number().valid(1, 2, 3, 4, 5).error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const noSmokeEntrySchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
  date: Joi.date().required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const dailyReminderSchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
  dailyReminder: Joi.boolean().required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const endQuittingSchema = Joi.object({
  userId: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  uuid: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
  entryEndDate: Joi.date().required().error(commonService.getValidationMessage),
  smokingTrigger: Joi.string()
    .valid('loneliness', 'anger', 'stress', 'pain', 'sadness', 'boredom', 'urge', 'others')
    .required()
    .error(commonService.getValidationMessage),
  smokingTriggerOthers: Joi.string()
    .when('smokingTrigger', {
      is: Joi.valid('others'),
      then: Joi.string().required().error(commonService.getValidationMessage),
      otherwise: Joi.string().allow('', null).error(commonService.getValidationMessage),
    })
    .error(commonService.getValidationMessage),
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
  validateGetList: async (dataToValidate) => await validateFunc(getListSchema, dataToValidate),
  validateGetChartData: async (dataToValidate) => await validateFunc(getChartDataSchema, dataToValidate),
  validateSave: async (dataToValidate) => await validateFunc(saveSchema, dataToValidate),
  validateNoSmokeEntry: async (dataToValidate) => await validateFunc(noSmokeEntrySchema, dataToValidate),
  validateDailyReminder: async (dataToValidate) => await validateFunc(dailyReminderSchema, dataToValidate),
  validateEndQuitting: async (dataToValidate) => await validateFunc(endQuittingSchema, dataToValidate),
  validateGetLatestQuitting: async (dataToValidate) => await validateFunc(getLatestQuittingSchema, dataToValidate),
};
