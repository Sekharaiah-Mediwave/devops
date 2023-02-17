const commonService = require('../services/common-service');
const { Joi } = require('../services/imports');

const getByIdSchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const saveSchema = Joi.object({
  name: Joi.string().required().error(commonService.getValidationMessage),
  address: Joi.string().required().error(commonService.getValidationMessage),
  location: Joi.string().allow('', null).error(commonService.getValidationMessage),
  uuid: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  clinic_name_id: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  city: Joi.string().required().error(commonService.getValidationMessage),
  postcode: Joi.string().required().error(commonService.getValidationMessage),
}).or('uuid', 'location').error(commonService.getValidationMessage);

const getLocationListSchema = Joi.object({
  sortField: Joi.string().allow('', null).default('location').error(commonService.getValidationMessage),
  sortOrder: Joi.string().valid('ASC', 'DESC', '', null).default('DESC').error(commonService.getValidationMessage),
  search: Joi.string().allow('', null).error(commonService.getValidationMessage),
  pageNo: Joi.number().min(1).default(1).allow('', null).error(commonService.getValidationMessage),
  itemsPerPage: Joi.number().min(0).default(10).allow('', null).error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const getNameListSchema = Joi.object({
  sortField: Joi.string().allow('', null).default('name').error(commonService.getValidationMessage),
  sortOrder: Joi.string().valid('ASC', 'DESC', '', null).default('DESC').error(commonService.getValidationMessage),
  search: Joi.string().allow('', null).error(commonService.getValidationMessage),
  clinic_location_id: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  pageNo: Joi.number().min(1).default(1).allow('', null).error(commonService.getValidationMessage),
  itemsPerPage: Joi.number().min(0).default(10).allow('', null).error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const getListSchema = Joi.object({
  sortField: Joi.string().allow('', null).default('createdAt').error(commonService.getValidationMessage),
  sortOrder: Joi.string().valid('ASC', 'DESC', '', null).default('DESC').error(commonService.getValidationMessage),
  search: Joi.string().allow('', null).error(commonService.getValidationMessage),
  pageNo: Joi.number().min(1).default(1).allow('', null).error(commonService.getValidationMessage),
  itemsPerPage: Joi.number().min(0).default(10).allow('', null).error(commonService.getValidationMessage),
  fromDate: Joi.date().allow('', null).max('now').error(commonService.getValidationMessage),
  toDate: Joi.date().greater(Joi.ref('..fromDate')).allow('', null).default(new Date()).error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const deleteLocationByIdSchema = Joi.object({
  clinic_location_id: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const deleteNameByIdSchema = Joi.object({
  clinic_location_id: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
  clinic_name_id: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const updateSchema = saveSchema
  .append({
    uuid: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
    clinic_name_id: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
  })
  .error(commonService.getValidationMessage);

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
  validateGetNameList: async (dataToValidate) => await validateFunc(getNameListSchema, dataToValidate),
  validateGetLocationList: async (dataToValidate) => await validateFunc(getLocationListSchema, dataToValidate),
  validateDeleteLocationById: async (dataToValidate) => await validateFunc(deleteLocationByIdSchema, dataToValidate),
  validateDeleteNameById: async (dataToValidate) => await validateFunc(deleteNameByIdSchema, dataToValidate),
};
