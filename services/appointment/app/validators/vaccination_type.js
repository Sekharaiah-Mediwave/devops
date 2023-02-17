const commonService = require('../services/common-service');
const { Joi } = require('../services/imports');

const getByIdSchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const saveSchema = Joi.object({
  name: Joi.string().required().error(commonService.getValidationMessage),
  description: Joi.when('status', {
    is: Joi.string().valid('draft'),
    then: Joi.string().allow(null, '').error(commonService.getValidationMessage),
    otherwise: Joi.string().required().error(commonService.getValidationMessage),
  }),
  start_date: Joi.when('status', {
    is: Joi.string().valid('draft'),
    then: Joi.date().allow(null).error(commonService.getValidationMessage),
    otherwise: Joi.date().required().error(commonService.getValidationMessage),
  }),
  end_date: Joi.when('status', {
    is: Joi.string().valid('draft'),
    then: Joi.date().allow(null).error(commonService.getValidationMessage),
    otherwise: Joi.date().required().error(commonService.getValidationMessage),
  }),
  start_time: Joi.when('status', {
    is: Joi.string().valid('draft'),
    then: Joi.date().allow(null).error(commonService.getValidationMessage),
    otherwise: Joi.date().required().error(commonService.getValidationMessage),
  }),
  end_time: Joi.when('status', {
    is: Joi.string().valid('draft'),
    then: Joi.date().allow(null).error(commonService.getValidationMessage),
    otherwise: Joi.date().required().error(commonService.getValidationMessage),
  }),
  duration: Joi.when('status', {
    is: Joi.string().valid('draft'),
    then: Joi.number().allow(null).error(commonService.getValidationMessage),
    otherwise: Joi.number().required().error(commonService.getValidationMessage),
  }),
  vaccineDose: Joi.when('status', {
    is: Joi.string().valid('draft'),
    then: Joi.array().items(Joi.object().keys({
      uuid: Joi.string().guid({ version: 'uuidv4' }).allow(null).error(commonService.getValidationMessage),
      name: Joi.string().allow(null, ''),
      vaccination_type_id: Joi.string().guid({ version: 'uuidv4' }).allow(null, ''),
      start: Joi.number().allow(null).error(commonService.getValidationMessage),
      end: Joi.number().allow(null).error(commonService.getValidationMessage),
    })).allow(null)
      .error(commonService.getValidationMessage),
    otherwise: Joi.array().items(Joi.object().keys({
      uuid: Joi.string().guid({ version: 'uuidv4' }).allow(null).error(commonService.getValidationMessage),
      name: Joi.string().required(),
      vaccination_type_id: Joi.string().guid({ version: 'uuidv4' }),
      start: Joi.number().error(commonService.getValidationMessage),
      end: Joi.number().error(commonService.getValidationMessage),
    })).required()
      .error(commonService.getValidationMessage),
  }),
  clinicians: Joi.when('status', {
    is: Joi.string().valid('draft'),
    then: Joi.array().items(Joi.string().guid({ version: 'uuidv4' })).allow(null)
    .error(commonService.getValidationMessage),
    otherwise: Joi.array().items(Joi.string().guid({ version: 'uuidv4' })).required()
    .error(commonService.getValidationMessage),
  }),
  status: Joi.string().valid('active', 'draft').error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const updateSchema = saveSchema
  .append({
    uuid: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
  })
  .error(commonService.getValidationMessage);
const assignQuestionnaireSchema = Joi.object({
  questionnaire_id: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
  vaccine_type_id: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
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
  validateAssignQuestionnaire: async (dataToValidate) => await validateFunc(assignQuestionnaireSchema, dataToValidate),
};
