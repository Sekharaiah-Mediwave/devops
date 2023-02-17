const commonService = require('../services/common-service');
const { Joi } = require('../services/imports');

const getByIdSchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const saveSchema = Joi.object({
  name: Joi.string().required().error(commonService.getValidationMessage),
  code: Joi.string().required().error(commonService.getValidationMessage),
  description: Joi.when('status', {
    is: Joi.string().valid('draft'),
    then: Joi.string().allow(null, '').error(commonService.getValidationMessage),
    otherwise: Joi.string().required().error(commonService.getValidationMessage),
  }),
  // status: Joi.string().valid('active', 'draft').allow('', null).default('active').required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const updateSchema = saveSchema
  .append({
    uuid: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
  })
  .error(commonService.getValidationMessage);

const getListSchema = Joi.object({
  sortField: Joi.string().allow('', null).default('createdAt').error(commonService.getValidationMessage),
  sortOrder: Joi.string().valid('ASC', 'DESC', '', null).default('DESC').error(commonService.getValidationMessage),
  search: Joi.string().allow('', null).error(commonService.getValidationMessage),
  pageNo: Joi.number().min(1).default(1).allow('', null).error(commonService.getValidationMessage),
  itemsPerPage: Joi.number().min(0).default(10).allow('', null).error(commonService.getValidationMessage),
  status: Joi.array().items(Joi.string().valid('active', 'drafted').error(commonService.getValidationMessage)).allow('', null).default([]).error(commonService.getValidationMessage),
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
  validateGetList: async (dataToValidate) => await validateFunc(getListSchema, dataToValidate),
};
