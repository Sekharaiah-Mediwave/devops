const commonService = require('../services/common-service');
const { Joi } = require('../services/imports');

const getByIdSchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const saveSchema = Joi.object({
  diagnosis_type_id: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
  clinic_location_id: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
  clinic_name_id: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
  appointment_type_id: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
  clinic_id: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
  // clinic_time_id: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
  slot_id: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
  booked_to: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
  booked_from: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  joining_details: Joi.string().allow('', null).error(commonService.getValidationMessage),
  date: Joi.date().required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const saveAmendSchema = Joi.object({
  clinic_id: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
  patient_id: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
  diagnosis_type: Joi.string().allow(null).error(commonService.getValidationMessage),
  urgency_type: Joi.string().allow(null).error(commonService.getValidationMessage),
  date: Joi.date().required().error(commonService.getValidationMessage),
  start_time: Joi.date().required().error(commonService.getValidationMessage),
  end_time: Joi.date().required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const checkSlotBookedSchema = Joi.object({
  startDate: Joi.date().required().error(commonService.getValidationMessage),
  endDate: Joi.date().min(Joi.ref('..startDate')).required().error(commonService.getValidationMessage),
  diagnosis_type_id: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  clinic_location_id: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  clinic_name_id: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  appointment_type_id: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  clinic_id: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const updateSchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
  status: Joi.string().valid('active', 'cancelled', 'missed', 'completed').required().error(commonService.getValidationMessage),
  appointment_status_id: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  notes: Joi.string().allow('', null).error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const cancelSchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
  appointment_status_id: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
  cancellation_reason: Joi.string().required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const getListSchema = Joi.object({
  sortField: Joi.string().allow('', null).default('createdAt').error(commonService.getValidationMessage),
  sortOrder: Joi.string().valid('ASC', 'DESC', '', null).default('DESC').error(commonService.getValidationMessage),
  range: Joi.string().valid('past', 'present', 'future').error(commonService.getValidationMessage),
  all: Joi.number().valid(0, 1).default(0).error(commonService.getValidationMessage),
  search: Joi.string().allow('', null).error(commonService.getValidationMessage),
  pageNo: Joi.number().min(1).default(1).allow('', null).error(commonService.getValidationMessage),
  itemsPerPage: Joi.number().min(0).default(10).allow('', null).error(commonService.getValidationMessage),
  fromDate: Joi.date().allow('', null).error(commonService.getValidationMessage),
  toDate: Joi.when('fromDate', {
    is: Joi.exist(),
    then: Joi.date().min(Joi.ref('..fromDate')).required().error(commonService.getValidationMessage),
    otherwise: Joi.date().min(Joi.ref('..fromDate')).allow('', null).error(commonService.getValidationMessage),
  }).error(commonService.getValidationMessage),
  amendList: Joi.number().valid(0, 1).default(0).error(commonService.getValidationMessage),

  locationSearch: Joi.string().allow('', null).error(commonService.getValidationMessage),
  clinicNameSearch: Joi.string().allow('', null).error(commonService.getValidationMessage),
  patientSearch: Joi.string().allow('', null).error(commonService.getValidationMessage),

  user_id: Joi.string().guid({ version: 'uuidv4' }).error(commonService.getValidationMessage).allow('', null).error(commonService.getValidationMessage),
  clinic_name_id: Joi.array().items(Joi.string().guid({ version: 'uuidv4' }).error(commonService.getValidationMessage)).allow('', null).default([]).error(commonService.getValidationMessage),
  clinic_id: Joi.array().items(Joi.string().guid({ version: 'uuidv4' }).error(commonService.getValidationMessage)).allow('', null).default([]).error(commonService.getValidationMessage),
  appointment_type_id: Joi.array().items(Joi.string().guid({ version: 'uuidv4' }).error(commonService.getValidationMessage)).allow('', null).default([]).error(commonService.getValidationMessage),
  diagnosis_type_id: Joi.array().items(Joi.string().guid({ version: 'uuidv4' }).error(commonService.getValidationMessage)).allow('', null).default([]).error(commonService.getValidationMessage),
  clinic_location_id: Joi.array().items(Joi.string().guid({ version: 'uuidv4' }).error(commonService.getValidationMessage)).allow('', null).default([]).error(commonService.getValidationMessage),
  appointment_status_id: Joi.array().items(Joi.string().guid({ version: 'uuidv4' }).error(commonService.getValidationMessage)).allow('', null).default([]).error(commonService.getValidationMessage),
  status: Joi.array().items(Joi.string().valid('active', 'cancelled', 'missed', 'completed').error(commonService.getValidationMessage)).allow('', null).default([]).error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const getAllListSchema = Joi.object({
  fromDate: Joi.date().allow('', null).error(commonService.getValidationMessage),
  toDate: Joi.when('fromDate', {
    is: Joi.exist(),
    then: Joi.date().min(Joi.ref('..fromDate')).required().error(commonService.getValidationMessage),
    otherwise: Joi.date().min(Joi.ref('..fromDate')).allow('', null).error(commonService.getValidationMessage),
  }).error(commonService.getValidationMessage),
  sortField: Joi.string().allow('', null).default('createdAt').error(commonService.getValidationMessage),
  sortOrder: Joi.string().valid('ASC', 'DESC', '', null).default('DESC').error(commonService.getValidationMessage),
  range: Joi.string().valid('past', 'present', 'future').error(commonService.getValidationMessage),
  all: Joi.number().valid(0, 1).default(0).error(commonService.getValidationMessage),
  amendList: Joi.number().valid(0, 1).default(0).error(commonService.getValidationMessage),
  user_id: Joi.string().guid({ version: 'uuidv4' }).error(commonService.getValidationMessage).allow('', null).error(commonService.getValidationMessage),
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
  validateAmendSave: async (dataToValidate) => await validateFunc(saveAmendSchema, dataToValidate),
  validateUpdate: async (dataToValidate) => await validateFunc(updateSchema, dataToValidate),
  validateCheckSlotBooked: async (dataToValidate) => await validateFunc(checkSlotBookedSchema, dataToValidate),
  validateGetList: async (dataToValidate) => await validateFunc(getListSchema, dataToValidate),
  validateCancel: async (dataToValidate) => await validateFunc(cancelSchema, dataToValidate),
  validateGetAllList: async (dataToValidate) => await validateFunc(getAllListSchema, dataToValidate),
};
