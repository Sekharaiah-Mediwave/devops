const commonService = require('../services/common-service');
const { Joi } = require('../services/imports');

const getByIdSchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
  tableName: Joi.string().required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const deleteSchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
  tableName: Joi.string().required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const getListSchema = Joi.object({
  tableName: Joi.string().required().error(commonService.getValidationMessage),
  pageSize: Joi.number().min(1).allow('', null).default(50).error(commonService.getValidationMessage),
  pageNo: Joi.number().min(1).allow('', null).default(1).error(commonService.getValidationMessage),
  sortField: Joi.string()
    .valid('createdAt', 'name', 'description', 'uuid', 'id')
    .allow('', null)
    .default('createdAt')
    .error(commonService.getValidationMessage),
  sortOrder: Joi.string()
    .valid('ASC', 'DESC')
    .allow('', null)
    .default('DESC')
    .error(commonService.getValidationMessage),
  search: Joi.string().allow('', null).error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const saveSchema = Joi.object({
  tableName: Joi.string().required().error(commonService.getValidationMessage),
  dataToSave: Joi.object({
    name: Joi.string().required().error(commonService.getValidationMessage),
    description: Joi.string().allow('', null).error(commonService.getValidationMessage),
  }).error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const updateSchema = Joi.object({
  tableName: Joi.string().required().error(commonService.getValidationMessage),
  uuid: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
  dataToUpdate: Joi.object({
    name: Joi.string().required().error(commonService.getValidationMessage),
    description: Joi.string().allow('', null).error(commonService.getValidationMessage),
  }).error(commonService.getValidationMessage),
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
  validateSave: async (dataToValidate) => await validateFunc(saveSchema, dataToValidate),
  validateUpdate: async (dataToValidate) => await validateFunc(updateSchema, dataToValidate),
  validateDelete: async (dataToValidate) => await validateFunc(deleteSchema, dataToValidate),
};
