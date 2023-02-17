const commonService = require('../services/common-service');
const { Joi } = require('../services/imports');

const getByUuidSchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const archiveByIdSchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
  status: Joi.string()
    .valid('Active', 'Inactive', 'Archive', 'Unarchive')
    .allow('', null)
    .default('Active')
    .error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const insertDiagnosesSchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  userId: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  name: Joi.string().allow('', null).error(commonService.getValidationMessage),
  // notes: Joi.string().allow("", null).error(commonService.getValidationMessage),
  diagnosedDate: Joi.date().error(commonService.getValidationMessage),
  status: Joi.string()
    .valid('Active', 'Inactive', 'Archive', 'Unarchive')
    .allow('', null)
    .default('Active')
    .error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const insertMedicationSchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  userId: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  name: Joi.string().allow('', null).error(commonService.getValidationMessage),
  // notes: Joi.string().allow("", null).error(commonService.getValidationMessage),
  medicationDate: Joi.date().error(commonService.getValidationMessage),
  archived: Joi.boolean().allow('', null).error(commonService.getValidationMessage),
  medicationType: Joi.string().allow('', null).error(commonService.getValidationMessage),
  otherMedicationWay: Joi.string().allow('', null).error(commonService.getValidationMessage),
  symptom: Joi.string().allow('', null).error(commonService.getValidationMessage),
  dosage: Joi.number().allow('', null).error(commonService.getValidationMessage),
  frequency: Joi.number().allow('', null).error(commonService.getValidationMessage),
  archivedDate: Joi.date().allow('', null).error(commonService.getValidationMessage),
  diagnosesId: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  status: Joi.string()
    .valid('Active', 'Inactive')
    .allow('', null)
    .default('Active')
    .error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const getDiagnosesSchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  userId: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  name: Joi.string().allow('', null).error(commonService.getValidationMessage),
  date: Joi.date().allow('', null).error(commonService.getValidationMessage),
  archivedDate: Joi.date().allow('', null).error(commonService.getValidationMessage),
  // notes: Joi.boolean().error(commonService.getValidationMessage),
  createdBy: Joi.string().allow('', null).error(commonService.getValidationMessage),
  updatedBy: Joi.string().allow('', null).error(commonService.getValidationMessage),
  archived: Joi.boolean().allow('', null).error(commonService.getValidationMessage),
  status: Joi.string()
    .valid('Active', 'Inactive', 'Archive', 'Unarchive')
    .allow('', null)
    .default('Active')
    .error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const deleteSchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const updateDiagnosesSchema = insertDiagnosesSchema
  .append({
    uuid: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
    userId: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
    name: Joi.string().allow('', null).error(commonService.getValidationMessage),
    // notes: Joi.string().allow("", null).error(commonService.getValidationMessage),
    diagnosedDate: Joi.date().error(commonService.getValidationMessage),
    status: Joi.string()
      .valid('Active', 'Inactive', 'Archive', 'Unarchive')
      .allow('', null)
      .default('Active')
      .error(commonService.getValidationMessage),
  })
  .error(commonService.getValidationMessage);

const updateMedicationSchema = insertMedicationSchema
  .append({
    uuid: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
    userId: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
    name: Joi.string().allow('', null).error(commonService.getValidationMessage),
    // notes: Joi.string().allow("", null).error(commonService.getValidationMessage),
    medicationDate: Joi.date().error(commonService.getValidationMessage),
    archived: Joi.boolean().allow('', null).error(commonService.getValidationMessage),
    medicationType: Joi.string().allow('', null).error(commonService.getValidationMessage),
    otherMedicationWay: Joi.string().allow('', null).error(commonService.getValidationMessage),
    symptom: Joi.string().allow('', null).error(commonService.getValidationMessage),
    dosage: Joi.number().allow('', null).error(commonService.getValidationMessage),
    frequency: Joi.number().allow('', null).error(commonService.getValidationMessage),
    archivedDate: Joi.date().error(commonService.getValidationMessage),
    diagnosesId: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
    status: Joi.string()
      .valid('Active', 'Inactive', 'Archived', 'Unarchived')
      .allow('', null)
      .default('Active')
      .error(commonService.getValidationMessage),
  })
  .error(commonService.getValidationMessage);

const insertMedicationNoteSchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  userId: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  notes: Joi.string().allow('', null).error(commonService.getValidationMessage),
  medicationId: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  status: Joi.string()
    .valid('Active', 'Inactive')
    .allow('', null)
    .default('Active')
    .error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const updateMedicationNotesSchema = insertMedicationNoteSchema
  .append({
    uuid: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
    userId: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
    notes: Joi.string().allow('', null).error(commonService.getValidationMessage),
    medicationId: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
    status: Joi.string()
      .valid('Active', 'Inactive')
      .allow('', null)
      .default('Active')
      .error(commonService.getValidationMessage),
  })
  .error(commonService.getValidationMessage);

/* Activity section */

const insertActivitySchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  userId: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  activityName: Joi.string().allow('', null).error(commonService.getValidationMessage),
  discription: Joi.string().allow('', null).error(commonService.getValidationMessage),
  status: Joi.string()
    .valid('Active', 'Inactive', 'Archive', 'Unarchive')
    .allow('', null)
    .default('Active')
    .error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const updateActivitySchema = insertActivitySchema
  .append({
    uuid: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
    userId: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
    activityName: Joi.string().allow('', null).error(commonService.getValidationMessage),
    discription: Joi.string().allow('', null).error(commonService.getValidationMessage),
    status: Joi.string()
      .valid('Active', 'Inactive', 'Archive', 'Unarchive')
      .allow('', null)
      .default('Active')
      .error(commonService.getValidationMessage),
  })
  .error(commonService.getValidationMessage);

const getActivitySchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  userId: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  activityName: Joi.string().allow('', null).error(commonService.getValidationMessage),
  discription: Joi.string().allow('', null).error(commonService.getValidationMessage),
  archived: Joi.boolean().allow('', null).error(commonService.getValidationMessage),
  status: Joi.string()
    .valid('Active', 'Inactive', 'Archive', 'Unarchive')
    .allow('', null)
    .default('Active')
    .error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

/* Exercise and Diertary and Mesurement */
const insertExerciseSchema = Joi.array()
  .items(
    Joi.object({
      uuid: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
      userId: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
      exerciseName: Joi.string().allow('', null).error(commonService.getValidationMessage),
      exerciseRepeat: Joi.string()
        .valid('Days', 'Weeks', 'Months', 'Year')
        .allow('', null)
        .error(commonService.getValidationMessage),
      exerciseFrequency: Joi.number().allow('', null).error(commonService.getValidationMessage),
      exerciseDuration: Joi.number().allow('', null).error(commonService.getValidationMessage),
      status: Joi.string()
        .valid('Active', 'Inactive')
        .allow('', null)
        .default('Active')
        .error(commonService.getValidationMessage),
    })
  )
  .error(commonService.getValidationMessage);

const getExerciseSchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  userId: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  exerciesName: Joi.string().allow('', null).error(commonService.getValidationMessage),
  exerciseRepeat: Joi.string()
    .valid('Days', 'Weeks', 'Months', 'Year')
    .allow('', null)
    .error(commonService.getValidationMessage),
  exerciseFrequency: Joi.number().allow('', null).error(commonService.getValidationMessage),
  exerciseDuration: Joi.number().allow('', null).error(commonService.getValidationMessage),
  diertaryNeed: Joi.string().allow('', null).error(commonService.getValidationMessage),
  chest: Joi.string().allow('', null).error(commonService.getValidationMessage),
  waist: Joi.number().allow('', null).error(commonService.getValidationMessage),
  hips: Joi.number().allow('', null).error(commonService.getValidationMessage),
  upperLeg: Joi.number().allow('', null).error(commonService.getValidationMessage),
  upperArm: Joi.number().allow('', null).error(commonService.getValidationMessage),
  status: Joi.string()
    .valid('Active', 'Inactive', 'Archive', 'Unarchive')
    .allow('', null)
    .default('Active')
    .error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const insertDietarySchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  userId: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  dietaryNeed: Joi.string().allow('', null).error(commonService.getValidationMessage),
  chest: Joi.number().allow('', null).error(commonService.getValidationMessage),
  waist: Joi.number().allow('', null).error(commonService.getValidationMessage),
  hips: Joi.number().allow('', null).error(commonService.getValidationMessage),
  upperLeg: Joi.number().allow('', null).error(commonService.getValidationMessage),
  upperArm: Joi.number().allow('', null).error(commonService.getValidationMessage),
  status: Joi.string()
    .valid('Active', 'Inactive', 'Archive', 'Unarchive')
    .allow('', null)
    .default('Active')
    .error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const updateExerciseSchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  userId: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
  exerciseName: Joi.string().allow('', null).error(commonService.getValidationMessage),
  exerciseRepeat: Joi.string()
    .valid('Days', 'Weeks', 'Months', 'Year')
    .allow('', null)
    .error(commonService.getValidationMessage),
  exerciseFrequency: Joi.number().allow('', null).error(commonService.getValidationMessage),
  exerciseDuration: Joi.number().allow('', null).error(commonService.getValidationMessage),
  status: Joi.string()
    .valid('Active', 'Inactive')
    .allow('', null)
    .default('Active')
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
  validateGetByUuid: async (dataToValidate) => await validateFunc(getByUuidSchema, dataToValidate),
  validateSaveDiagnoses: async (dataToValidate) => await validateFunc(insertDiagnosesSchema, dataToValidate),
  validateGetDiagnoses: async (dataToValidate) => await validateFunc(getDiagnosesSchema, dataToValidate),
  validateGetMedication: async (dataToValidate) => await validateFunc(getDiagnosesSchema, dataToValidate),
  validateSaveMedication: async (dataToValidate) => await validateFunc(insertMedicationSchema, dataToValidate),
  validateDiagnosesUpdate: async (dataToValidate) => await validateFunc(updateDiagnosesSchema, dataToValidate),
  validateMedicationUpdate: async (dataToValidate) => await validateFunc(updateMedicationSchema, dataToValidate),
  validateDiagnosesArchived: async (dataToValidate) => await validateFunc(archiveByIdSchema, dataToValidate),
  validateMedicationArchived: async (dataToValidate) => await validateFunc(archiveByIdSchema, dataToValidate),
  validateDelete: async (dataToValidate) => await validateFunc(deleteSchema, dataToValidate),

  validateSaveMedicationNotes: async (dataToValidate) => await validateFunc(insertMedicationNoteSchema, dataToValidate),
  validateMedicationNotesUpdate: async (dataToValidate) =>
    await validateFunc(updateMedicationNotesSchema, dataToValidate),

  /* Activity section */
  validateSaveActivity: async (dataToValidate) => await validateFunc(insertActivitySchema, dataToValidate),
  validateGetActivity: async (dataToValidate) => await validateFunc(getActivitySchema, dataToValidate),
  validateActivityArchive: async (dataToValidate) => await validateFunc(archiveByIdSchema, dataToValidate),
  validateActivityUpdate: async (dataToValidate) => await validateFunc(updateActivitySchema, dataToValidate),
  /* Exercies and Diertary  and Mesurement */
  validateSaveExercise: async (dataToValidate) => await validateFunc(insertExerciseSchema, dataToValidate),
  validateGetExercise: async (dataToValidate) => await validateFunc(getExerciseSchema, dataToValidate),
  validateSaveDietaryAndMeasurement: async (dataToValidate) => await validateFunc(insertDietarySchema, dataToValidate),
  validateExerciseUpdate: async (dataToValidate) => await validateFunc(updateExerciseSchema, dataToValidate),
};
