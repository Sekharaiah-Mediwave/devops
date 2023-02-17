const commonService = require('../services/common-service');
const { Joi } = require('../services/imports');

const trackerOverviewSchema = Joi.object({
  type: Joi.string().valid('week', 'month', 'year').required().error(commonService.getValidationMessage),
  date: Joi.date().required().error(commonService.getValidationMessage),
  compareIds: Joi.string().required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const updateProfileSchema = Joi.object({
  lastName: Joi.string().error(commonService.getValidationMessage),
  mobileNumber: Joi.string().allow('', null).error(commonService.getValidationMessage),
  centreId: Joi.string().guid({ version: 'uuidv4' }).error(commonService.getValidationMessage),
  expertise: Joi.string().allow('', null).error(commonService.getValidationMessage),
  specialism: Joi.array().items(Joi.string()).allow('', null).error(commonService.getValidationMessage),
  team: Joi.array().items(Joi.string()).allow('', null).error(commonService.getValidationMessage),
  jobRole: Joi.array().items(Joi.string()).allow('', null).error(commonService.getValidationMessage),
  department: Joi.array().items(Joi.string()).allow('', null).error(commonService.getValidationMessage),
  qualification: Joi.array().items(Joi.string()).allow('', null).error(commonService.getValidationMessage),
  profilePic: Joi.object({
    xs: Joi.string().allow('', null).error(commonService.getValidationMessage),
    sm: Joi.string().allow('', null).error(commonService.getValidationMessage),
    md: Joi.string().allow('', null).error(commonService.getValidationMessage),
    lg: Joi.string().allow('', null).error(commonService.getValidationMessage),
    xl: Joi.string().allow('', null).error(commonService.getValidationMessage),
  })
    .allow(null, '')
    .error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const updateConsentSchema = Joi.object({
  consent: Joi.boolean().default(false).error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const updatePreferencesSchema = Joi.object({
  preferences: Joi.array().items(Joi.string()).error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const updateFavoriteSchema = Joi.object({
  resource_id: Joi.string().error(commonService.getValidationMessage),
  resource_type: Joi.string().error(commonService.getValidationMessage),
  action: Joi.string().valid('add', 'remove'),
}).error(commonService.getValidationMessage);

const getDirectoryUsersSchema = Joi.object({
  pageSize: Joi.number().min(1).allow('', null).default(10).error(commonService.getValidationMessage),
  pageNo: Joi.number().min(1).allow('', null).default(1).error(commonService.getValidationMessage),
  sortField: Joi.string()
    .valid('createdAt', 'firstName', 'email', 'userRole.roleInfo.name')
    .allow('', null)
    .default('createdAt')
    .error(commonService.getValidationMessage),
  sortOrder: Joi.string()
    .valid('ASC', 'DESC')
    .allow('', null)
    .default('DESC')
    .error(commonService.getValidationMessage),
  search: Joi.string().allow('', null).error(commonService.getValidationMessage),
  centreId: Joi.string().guid({ version: 'uuidv4' }).allow('', null).min(0).error(commonService.getValidationMessage),
  roleId: Joi.string().guid({ version: 'uuidv4' }).allow('', null).min(0).error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const getCirclePeoplesSchema = Joi.object({
  pageSize: Joi.number().min(1).allow('', null).default(10).error(commonService.getValidationMessage),
  pageNo: Joi.number().min(1).allow('', null).default(1).error(commonService.getValidationMessage),
  sortField: Joi.string()
    .valid('createdAt', 'firstName', 'email', 'userRole.roleInfo.name')
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

const getUsersByRoleSchema = Joi.object({
  role: Joi.string().allow('', null).error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const getCircleColleguesSchema = Joi.object({
  pageSize: Joi.number().min(1).allow('', null).default(10).error(commonService.getValidationMessage),
  pageNo: Joi.number().min(1).allow('', null).default(1).error(commonService.getValidationMessage),
  sortField: Joi.string()
    .valid('createdAt', 'firstName', 'email', 'userRole.roleInfo.name', 'userProfile.centre.name')
    .allow('', null)
    .default('createdAt')
    .error(commonService.getValidationMessage),
  sortOrder: Joi.string()
    .valid('ASC', 'DESC')
    .allow('', null)
    .default('DESC')
    .error(commonService.getValidationMessage),
  search: Joi.string().allow('', null).error(commonService.getValidationMessage),
  centreId: Joi.string().guid({ version: 'uuidv4' }).allow('', null).min(0).error(commonService.getValidationMessage),
  roleId: Joi.string().guid({ version: 'uuidv4' }).allow('', null).min(0).error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const adminCommunityUsersSchema = Joi.object({
  pageSize: Joi.number().min(1).allow('', null).default(10).error(commonService.getValidationMessage),
  pageNo: Joi.number().min(1).allow('', null).default(1).error(commonService.getValidationMessage),
  sortField: Joi.string()
    .valid('createdAt', 'firstName', 'userProfile.team', 'nhsNumber', 'status', 'userProfile.centre.name')
    .allow('', null)
    .default('createdAt')
    .error(commonService.getValidationMessage),
  sortOrder: Joi.string()
    .valid('ASC', 'DESC')
    .allow('', null)
    .default('DESC')
    .error(commonService.getValidationMessage),
  search: Joi.string().allow('', null).error(commonService.getValidationMessage),
  filter: Joi.string()
    .allow('', null)
    .valid('', null, 'All', 'Active', 'Deactivated')
    .error(commonService.getValidationMessage),
  type: Joi.number().required().valid(1, 2, 3, 4).error(commonService.getValidationMessage),
  toDate: Joi.date().allow(null, '').error(commonService.getValidationMessage),
  fromDate: Joi.date().allow(null, '').error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const getadminUsersSchema = Joi.object({
  pageSize: Joi.number().min(1).allow('', null).default(10).error(commonService.getValidationMessage),
  pageNo: Joi.number().min(1).allow('', null).default(1).error(commonService.getValidationMessage),
  sortField: Joi.string()
    .valid('createdAt', 'firstName', 'userProfile.team', 'nhsNumber', 'status', 'userProfile.centre.name')
    .allow('', null)
    .default('createdAt')
    .error(commonService.getValidationMessage),
  sortOrder: Joi.string()
    .valid('ASC', 'DESC')
    .allow('', null)
    .default('DESC')
    .error(commonService.getValidationMessage),
  search: Joi.string().allow('', null).error(commonService.getValidationMessage),
  filter: Joi.string()
    .allow('', null)
    .valid('', null, 'All', 'Active', 'Deactivated')
    .error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const getClinicianUsersSchema = Joi.object({
  pageSize: Joi.number().min(1).allow('', null).default(10).error(commonService.getValidationMessage),
  pageNo: Joi.number().min(1).allow('', null).default(1).error(commonService.getValidationMessage),
  sortField: Joi.string()
    .valid('createdAt', 'firstName', 'userProfile.team', 'nhsNumber', 'status', 'userProfile.centre.name')
    .allow('', null)
    .default('createdAt')
    .error(commonService.getValidationMessage),
  sortOrder: Joi.string()
    .valid('ASC', 'DESC')
    .allow('', null)
    .default('DESC')
    .error(commonService.getValidationMessage),
  search: Joi.string().allow('', null).error(commonService.getValidationMessage),
  filter: Joi.string()
    .allow('', null)
    .valid('', null, 'All', 'Active', 'Deactivated')
    .error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const getClinicianAndAdminSchema = Joi.object({
  pageSize: Joi.number().min(1).allow('', null).default(10).error(commonService.getValidationMessage),
  pageNo: Joi.number().min(1).allow('', null).default(1).error(commonService.getValidationMessage),
  sortField: Joi.string()
    // .valid('createdAt', 'firstName', 'userProfile.team', 'nhsNumber', 'status', 'userProfile.centre.name')
    .allow('', null)
    .default('createdAt')
    .error(commonService.getValidationMessage),
  sortOrder: Joi.string()
    .valid('ASC', 'DESC')
    .allow('', null)
    .default('DESC')
    .error(commonService.getValidationMessage),
  search: Joi.string().allow('', null).error(commonService.getValidationMessage),
  status: Joi.string().allow('', null).error(commonService.getValidationMessage),
  role: Joi.string().required()
    .valid('All', 'Clinician', 'Admin')
    .error(commonService.getValidationMessage),
  filter: Joi.string()
    .allow('', null)
    .valid('', null, 'All', 'Active', 'Deactivated')
    .error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const listCareteamsSchema = Joi.object({
  pageSize: Joi.number().min(1).allow('', null).default(10).error(commonService.getValidationMessage),
  pageNo: Joi.number().min(1).allow('', null).default(1).error(commonService.getValidationMessage),
  sortField: Joi.string()
    .valid('createdAt', 'firstName', 'userProfile.team', 'nhsNumber', 'status', 'userProfile.centre.name')
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

const listUsersInCareteamsSchema = Joi.object({
  pageSize: Joi.number().min(1).allow('', null).default(10).error(commonService.getValidationMessage),
  pageNo: Joi.number().min(1).allow('', null).default(1).error(commonService.getValidationMessage),
  sortField: Joi.string()
    .valid('createdAt', 'firstName', 'userProfile.team', 'nhsNumber', 'status', 'userProfile.centre.name')
    .allow('', null)
    .default('createdAt')
    .error(commonService.getValidationMessage),
  sortOrder: Joi.string()
    .valid('ASC', 'DESC')
    .allow('', null)
    .default('DESC')
    .error(commonService.getValidationMessage),
  search: Joi.string().allow('', null).error(commonService.getValidationMessage),
  teamId: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const updateDirectorySettingsSchema = Joi.object({
  visible: Joi.boolean().default(false).error(commonService.getValidationMessage),
  centre: Joi.boolean().default(false).error(commonService.getValidationMessage),
  associatedClinician: Joi.boolean().default(false).error(commonService.getValidationMessage),
  mobileNumber: Joi.boolean().default(false).error(commonService.getValidationMessage),
  specialism: Joi.boolean().default(false).error(commonService.getValidationMessage),
  expertise: Joi.boolean().default(false).error(commonService.getValidationMessage),
  qualification: Joi.boolean().default(false).error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const updateAccountSettingsSchema = Joi.object({
  inAppNotification: Joi.boolean().default(false).error(commonService.getValidationMessage),
  emailAppNotification: Joi.boolean().default(false).error(commonService.getValidationMessage),
  notifyPeriodCount: Joi.number().default(0).error(commonService.getValidationMessage),
  notifyPeriod: Joi.string()
    .default('weeks')
    .valid('days', 'weeks', 'months', 'years')
    .error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const addAccessSchema = Joi.object({
  add: Joi.boolean().default(false).error(commonService.getValidationMessage),
  none: Joi.boolean().default(true).error(commonService.getValidationMessage),
})
  .default({ add: false, none: true })
  .error(commonService.getValidationMessage);

const userCreateBaseSchema = Joi.object({
  firstName: Joi.string().required().error(commonService.getValidationMessage),
  email: Joi.string()
    .required()
    .email({ tlds: { allow: false } })
    .error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);
const checkEmailExistSchema = Joi.object({
  email: Joi.string()
    .required()
    .email({ tlds: { allow: false } })
    .error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);
const getInvitedUsersSchema = Joi.object({
  status: Joi.string().allow(null).default(null).error(commonService.getValidationMessage),
  relationship: Joi.array().allow(null).items(Joi.string()).default(null).error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const createAdminSchema = userCreateBaseSchema
  .append({
    mobileNumber: Joi.string().allow('', null).error(commonService.getValidationMessage),
    team: Joi.string().allow('', null).error(commonService.getValidationMessage),
    type: Joi.string().allow('', null).error(commonService.getValidationMessage),
    centreId: Joi.string().guid({ version: 'uuidv4' }).error(commonService.getValidationMessage),
    access: Joi.object({
      createUsers: Joi.object({
        caresTeam: addAccessSchema,
        clinicians: addAccessSchema,
        patients: addAccessSchema,
      })
        .required()
        .error(commonService.getValidationMessage),
      connect: Joi.object({ connectRemoveCircleUsers: addAccessSchema })
        .required()
        .error(commonService.getValidationMessage),
      activeUser: Joi.object({ enableDisableUsers: addAccessSchema })
        .required()
        .error(commonService.getValidationMessage),
      createQuestionairees: Joi.object({ create: addAccessSchema, share: addAccessSchema })
        .required()
        .error(commonService.getValidationMessage),
    })
      .required()
      .error(commonService.getValidationMessage),
  })
  .error(commonService.getValidationMessage);

const createClinicianSchema = userCreateBaseSchema
  .append({
    dob: Joi.date().required().error(commonService.getValidationMessage),
    centreId: Joi.string().guid({ version: 'uuidv4' }).error(commonService.getValidationMessage),
  })
  .error(commonService.getValidationMessage);

const createCareTeamSchema = userCreateBaseSchema
  .append({
    centreId: Joi.string().guid({ version: 'uuidv4' }).error(commonService.getValidationMessage),
    teams: Joi.array().items(Joi.string().required()).allow(null).error(commonService.getValidationMessage),
  })
  .error(commonService.getValidationMessage);

const createPatientSchema = userCreateBaseSchema
  .append({
    mobileNumber: Joi.string().allow('', null).error(commonService.getValidationMessage),
    nhsNumber: Joi.number().allow('', null).error(commonService.getValidationMessage),
  })
  .error(commonService.getValidationMessage);

const patientToLinkSchema = Joi.object({
  userId: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const linkCareteamAndPatientsSchema = Joi.object({
  careteamId: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
  patientIds: Joi.array()
    .items(Joi.string().guid({ version: 'uuidv4' }))
    .required()
    .error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const removeUserConnectionsSchema = Joi.object({
  circleIds: Joi.array()
    .items(Joi.string().guid({ version: 'uuidv4' }))
    .min(1)
    .required()
    .error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const deactivateUsersSchema = Joi.object({
  userIds: Joi.array()
    .items(Joi.string().guid({ version: 'uuidv4' }))
    .min(1)
    .required()
    .error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const removeUserFromCareTeamSchema = Joi.object({
  userIds: Joi.array()
    .items(Joi.string().guid({ version: 'uuidv4' }))
    .min(1)
    .required()
    .error(commonService.getValidationMessage),
  teamId: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const linkCliniciansAndPatientsSchema = Joi.object({
  clinicianIds: Joi.array()
    .items(Joi.string().guid({ version: 'uuidv4' }))
    .min(1)
    .required()
    .error(commonService.getValidationMessage),
  patientIds: Joi.array()
    .items(Joi.string().guid({ version: 'uuidv4' }))
    .min(1)
    .required()
    .error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const updateUserModuleSchema = Joi.object({
  userModuleId: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
  status: Joi.string().valid('active', 'deactive').required().error(commonService.getValidationMessage),
  permission: Joi.object().default(null).error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const updateRolePermissionSchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
  permissionStatus: Joi.string().valid('active', 'deactive').required().error(commonService.getValidationMessage),
  permission: Joi.object().default(null).error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const updateUserRoleScopeSchema = Joi.object({
  status:Joi.boolean().required(),
  roleId: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
  roleScope: Joi.object().default(null).error(commonService.getValidationMessage),
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
  validateTrackerOverview: async (dataToValidate) => await validateFunc(trackerOverviewSchema, dataToValidate),
  validateUpdateProfile: async (dataToValidate) => await validateFunc(updateProfileSchema, dataToValidate),
  validateUpdateConsent: async (dataToValidate) => await validateFunc(updateConsentSchema, dataToValidate),
  validateUpdatePreferences: async (dataToValidate) => await validateFunc(updatePreferencesSchema, dataToValidate),
  validateUpdateFavorite: async (dataToValidate) => await validateFunc(updateFavoriteSchema, dataToValidate),
  validateGetDirectoryUsers: async (dataToValidate) => await validateFunc(getDirectoryUsersSchema, dataToValidate),
  validateGetCirclePeoples: async (dataToValidate) => await validateFunc(getCirclePeoplesSchema, dataToValidate),
  validateGetUsersByRole: async (dataToValidate) => await validateFunc(getUsersByRoleSchema, dataToValidate),
  validateGetCircleCollegues: async (dataToValidate) => await validateFunc(getCircleColleguesSchema, dataToValidate),
  validateUpdateDirectorySettings: async (dataToValidate) =>
    await validateFunc(updateDirectorySettingsSchema, dataToValidate),
  validateUpdateAccountSettings: async (dataToValidate) =>
    await validateFunc(updateAccountSettingsSchema, dataToValidate),
  validateAdminCreateUser: async (dataToValidate) => await validateFunc(createAdminSchema, dataToValidate),
  validateCreateClinician: async (dataToValidate) => await validateFunc(createClinicianSchema, dataToValidate),
  validateCreateCareTeam: async (dataToValidate) => await validateFunc(createCareTeamSchema, dataToValidate),
  validateCreatePatient: async (dataToValidate) => await validateFunc(createPatientSchema, dataToValidate),
  validateAdminCommunityUsers: async (dataToValidate) => await validateFunc(adminCommunityUsersSchema, dataToValidate),
  validateGetAdminUsers: async (dataToValidate) => await validateFunc(getadminUsersSchema, dataToValidate),
  validateGetClinicianUsers: async (dataToValidate) => await validateFunc(getClinicianUsersSchema, dataToValidate),
  validateGetClinicianAndAdmin: async (dataToValidate) => await validateFunc(getClinicianAndAdminSchema, dataToValidate),
  validateListCareteams: async (dataToValidate) => await validateFunc(listCareteamsSchema, dataToValidate),
  validateListUsersInCareteams: async (dataToValidate) =>
    await validateFunc(listUsersInCareteamsSchema, dataToValidate),
  validatePatientsToLink: async (dataToValidate) => await validateFunc(patientToLinkSchema, dataToValidate),
  linkClinicianAndPatients: async (dataToValidate) =>
    await validateFunc(linkCliniciansAndPatientsSchema, dataToValidate),
  validateRemoveUserConnections: async (dataToValidate) =>
    await validateFunc(removeUserConnectionsSchema, dataToValidate),
  validateDeactivateUsers: async (dataToValidate) => await validateFunc(deactivateUsersSchema, dataToValidate),
  validateRemoveUserFromCareTeam: async (dataToValidate) =>
    await validateFunc(removeUserFromCareTeamSchema, dataToValidate),
  linkCareteamAndPatients: async (dataToValidate) => await validateFunc(linkCareteamAndPatientsSchema, dataToValidate),
  validateCheckEmailExist: async (dataToValidate) => await validateFunc(checkEmailExistSchema, dataToValidate),
  validateGetInvitedUsers: async (dataToValidate) => await validateFunc(getInvitedUsersSchema, dataToValidate),
  validateUpdateUserModule: async (dataToValidate) => await validateFunc(updateUserModuleSchema, dataToValidate),
  validateUpdateRolePermission: async (dataToValidate) => await validateFunc(updateRolePermissionSchema, dataToValidate),
  validateUpdateRoleScopeModule: async (dataToValidate) => await validateFunc(updateUserRoleScopeSchema, dataToValidate),
};
