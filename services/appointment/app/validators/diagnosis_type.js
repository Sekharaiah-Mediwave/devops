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
  start_time: Joi.when('status', {
    is: Joi.string().valid('draft'),
    then: Joi.date().allow(null).error(commonService.getValidationMessage),
    otherwise: Joi.date().required().error(commonService.getValidationMessage),
  }),
  end_time: Joi.when('status', {
    is: Joi.string().valid('draft'),
    then: Joi.date().allow(null).greater(Joi.ref('..start_time')).error(commonService.getValidationMessage),
    otherwise: Joi.date().required().greater(Joi.ref('..start_time')).error(commonService.getValidationMessage),
  }),
  duration: Joi.when('status', {
    is: Joi.string().valid('draft'),
    then: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
    otherwise: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
  }),
  clinicians: Joi.when('status', {
    is: Joi.string().valid('draft'),
    then: Joi.array().items(Joi.string().guid({ version: 'uuidv4' })).allow('', null).default([])
      .error(commonService.getValidationMessage),
    otherwise: Joi.array().items(Joi.string().guid({ version: 'uuidv4' })).required()
      .error(commonService.getValidationMessage),
  }),
  status: Joi.string().valid('active', 'draft').required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const updateSchema = saveSchema
  .append({
    uuid: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
  })
  .error(commonService.getValidationMessage);

const approveRequestSchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
  status: Joi.string().valid('accepted', 'rejected').required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const getListSchema = Joi.object({
  sortField: Joi.string().allow('', null).default('createdAt').error(commonService.getValidationMessage),
  sortOrder: Joi.string().valid('ASC', 'DESC', '', null).default('DESC').error(commonService.getValidationMessage),
  search: Joi.string().allow('', null).error(commonService.getValidationMessage),
  duration: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  approved_by: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  author: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  pageNo: Joi.number().min(1).default(1).allow('', null).error(commonService.getValidationMessage),
  itemsPerPage: Joi.number().min(0).default(10).allow('', null).error(commonService.getValidationMessage),
  createdFromDate: Joi.date().allow('', null).max('now').error(commonService.getValidationMessage),
  createdToDate: Joi.date().greater(Joi.ref('..createdFromDate')).allow('', null).default(new Date()).error(commonService.getValidationMessage),
  approvedFromDate: Joi.date().allow('', null).max('now').error(commonService.getValidationMessage),
  approvedToDate: Joi.date().greater(Joi.ref('..approvedFromDate')).allow('', null).default(new Date()).error(commonService.getValidationMessage),
  status: Joi.array().items(Joi.string().valid('active', 'drafted', 'approval_waiting').error(commonService.getValidationMessage)).allow('', null).default([]).error(commonService.getValidationMessage),
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
  validateApproveRequest: async (dataToValidate) => await validateFunc(approveRequestSchema, dataToValidate),
  validateGetList: async (dataToValidate) => await validateFunc(getListSchema, dataToValidate),
};
