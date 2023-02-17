const commonService = require('../services/common-service');
const { Joi } = require('../services/imports');

const getByIdSchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const saveSchema = Joi.object({
  appointment_type_id: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
  diagnosis_type_id: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
  clinic_location_id: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
  clinic_name_id: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
  selectedDates: Joi.array().items(Joi.date().required().error(commonService.getValidationMessage)).required().min(1).error(commonService.getValidationMessage),
  selectedSlots: Joi.array().items(Joi.date().required().error(commonService.getValidationMessage)).required().min(1).error(commonService.getValidationMessage),
  status: Joi.string().valid('active', 'draft').default('active').required().error(commonService.getValidationMessage),
  clinic_joining_details: Joi.string().allow('', null).error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const updateSchema = saveSchema
  .append({
    uuid: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
  })
  .error(commonService.getValidationMessage);

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('active', 'draft').required().error(commonService.getValidationMessage),
  uuids: Joi.array().items(Joi.string().guid({ version: 'uuidv4' })).required()
    .error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const getListSchema = Joi.object({
  sortField: Joi.string().allow('', null).default('createdAt').error(commonService.getValidationMessage),
  sortOrder: Joi.string().valid('ASC', 'DESC', '', null).default('DESC').error(commonService.getValidationMessage),
  range: Joi.string().valid('past', 'present', 'future').error(commonService.getValidationMessage),
  all: Joi.number().valid(0, 1).default(0).error(commonService.getValidationMessage),
  search: Joi.string().allow('', null).error(commonService.getValidationMessage),
  locationSearch: Joi.string().allow('', null).error(commonService.getValidationMessage),
  clinicNameSearch: Joi.string().allow('', null).error(commonService.getValidationMessage),
  clinicianSearch: Joi.string().allow('', null).error(commonService.getValidationMessage),
  diagnosis_type_id: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  appointment_type_id: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  clinic_location_id: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  clinic_name_id: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  pageNo: Joi.number().min(1).default(1).allow('', null).error(commonService.getValidationMessage),
  itemsPerPage: Joi.number().min(0).default(10).allow('', null).error(commonService.getValidationMessage),
  status: Joi.array().items(Joi.string().valid('active', 'drafted').error(commonService.getValidationMessage)).allow('', null).default([]).error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const getTimesByClinicSchema = Joi.object({
  clinicId: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const getTimeByIdSchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const getSlotsByClinicSchema = Joi.object({
  clinicId: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const getSlotsByClinicTimeSchema = Joi.object({
  clinicTimeId: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const getSlotByIdSchema = Joi.object({
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
  validateSave: async (dataToValidate) => await validateFunc(saveSchema, dataToValidate),
  validateUpdate: async (dataToValidate) => await validateFunc(updateSchema, dataToValidate),
  validateUpdateStatus: async (dataToValidate) => await validateFunc(updateStatusSchema, dataToValidate),
  validateGetList: async (dataToValidate) => await validateFunc(getListSchema, dataToValidate),
  validateGetTimesByClinic: async (dataToValidate) => await validateFunc(getTimesByClinicSchema, dataToValidate),
  validateGetTimeById: async (dataToValidate) => await validateFunc(getTimeByIdSchema, dataToValidate),
  validateGetSlotsByClinic: async (dataToValidate) => await validateFunc(getSlotsByClinicSchema, dataToValidate),
  validateGetSlotsByClinicTime: async (dataToValidate) => await validateFunc(getSlotsByClinicTimeSchema, dataToValidate),
  validateGetSlotById: async (dataToValidate) => await validateFunc(getSlotByIdSchema, dataToValidate),
};
