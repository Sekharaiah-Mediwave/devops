const commonService = require('../services/common-service');
const { Joi } = require('../services/imports');

const getByIdSchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const getListSchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  userId: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  entryDate: Joi.date().allow('', null).error(commonService.getValidationMessage),
  fromDate: Joi.date().allow('', null).error(commonService.getValidationMessage),
  toDate: Joi.date().allow('', null).error(commonService.getValidationMessage),
  status: Joi.string().valid('Active', 'Archived').allow('', null).error(commonService.getValidationMessage),
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
  smokedItems: Joi.object()
    .when('smokeType', {
      is: Joi.valid('eCigarette'),
      then: Joi.object({
        vape: Joi.object({
          puff: Joi.number().min(0).allow(null).error(commonService.getValidationMessage),
          strength: Joi.number().min(0).allow(null).error(commonService.getValidationMessage),
        })
          .min(1)
          .allow(null)
          .error(commonService.getValidationMessage),
      })
        .min(1)
        .error(commonService.getValidationMessage),
      otherwise: Joi.object({
        cigarette: Joi.object(cigaretteInnerJson).allow(null).error(commonService.getValidationMessage),
        rollUps: Joi.object(cigaretteInnerJson).allow(null).error(commonService.getValidationMessage),
        lightCigarette: Joi.object(cigaretteInnerJson).allow(null).error(commonService.getValidationMessage),
        other: Joi.object({ singles: cigaretteInnerJson.singles })
          .allow(null)
          .error(commonService.getValidationMessage),
      })
        .min(1)
        .error(commonService.getValidationMessage),
    })
    .required()
    .error(commonService.getValidationMessage),
  smokeType: Joi.string()
    .valid('cigarette', 'eCigarette')
    .required()
    .default('cigarette')
    .error(commonService.getValidationMessage),
  entryDate: Joi.date().max('now').required().error(commonService.getValidationMessage),
  notes: Joi.string().allow('', null).error(commonService.getValidationMessage),
  managedStatus: Joi.number().valid(1, 2, 3, 4, 5).error(commonService.getValidationMessage),
  status: Joi.string()
    .valid('Active', 'Inactive', 'Archived')
    .allow('', null)
    .default('Active')
    .error(commonService.getValidationMessage),
  add_to_diary: Joi.boolean().allow(null).default(false).error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const updateSchema = saveSchema
  .append({
    uuid: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
  })
  .error(commonService.getValidationMessage);

const archiveSchema = Joi.object({
  uuids: Joi.array()
    .items(Joi.string().guid({ version: 'uuidv4' }))
    .required()
    .error(commonService.getValidationMessage),
  status: Joi.string().valid('Active', 'Archived').required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const deleteSchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
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
  validateGetList: async (dataToValidate) => await validateFunc(getListSchema, dataToValidate),
  validateGetChartData: async (dataToValidate) => await validateFunc(getChartDataSchema, dataToValidate),
  validateSave: async (dataToValidate) => await validateFunc(saveSchema, dataToValidate),
  validateUpdate: async (dataToValidate) => await validateFunc(updateSchema, dataToValidate),
  validateArchive: async (dataToValidate) => await validateFunc(archiveSchema, dataToValidate),
  validateDelete: async (dataToValidate) => await validateFunc(deleteSchema, dataToValidate),
};
