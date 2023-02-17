const commonService = require('../services/common-service');
const { Joi } = require('../services/imports');

const saveSchema = Joi.object({
  user_id: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  subject: Joi.string().error(commonService.getValidationMessage),
  message: Joi.string().error(commonService.getValidationMessage),
  notification_type: Joi.string()
    .allow('', null)
    .default('both')
    .error(commonService.getValidationMessage),
  schedule_type: Joi.string()
    .valid('daily', 'weekly', 'monthly', 'yearly', 'direct', 'once')
    .allow('', null)
    .default('direct')
    .error(commonService.getValidationMessage),
  month: Joi.string().allow('', null).default('jan').error(commonService.getValidationMessage),
  week_day: Joi.string()
    .valid('mon', 'tues', 'wed', 'thur', 'fri', 'sat', 'sun')
    .allow('', null)
    .default('mon')
    .error(commonService.getValidationMessage),
  day: Joi.number().allow('', null).default(1).error(commonService.getValidationMessage),
  send_to: Joi.array().items(Joi.object()).allow(null).error(commonService.getValidationMessage),
  time: Joi.date().allow(null).error(commonService.getValidationMessage),
  end_date: Joi.date().allow(null, '').error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const markAsReadSchema = Joi.object({
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
  // validateGetById: async (dataToValidate) => {
  //   return await validateFunc(getByIdSchema, dataToValidate);
  // },

  validateSave: async (dataToValidate) => await validateFunc(saveSchema, dataToValidate),
  validateMarkAsRead: async (dataToValidate) => await validateFunc(markAsReadSchema, dataToValidate),
};
