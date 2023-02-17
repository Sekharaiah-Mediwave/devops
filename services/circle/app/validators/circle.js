/* eslint-disable no-useless-escape */
const commonService = require('../services/common-service');
const { Joi } = require('../services/imports');

const patterns = {
  positiveNumber: /^\d*[1-9]\d*$/,
  age: /^(?:1[0-9][0-9]|[1-9]|200|[1-9][0-9])$/,
  name: /^[a-zA-Z ]+$/,
  mobile: /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]{10}$/,
  noSpace: /\S/,
};

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

const getByUuidSchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const inviteUserCircleSchema = Joi.object({
  email: Joi.string()
    .required()
    .email({ tlds: { allow: false } })
    .error(commonService.getValidationMessage),
  firstName: Joi.string().pattern(patterns.name).required().error(commonService.getValidationMessage),
  lastName: Joi.string().pattern(patterns.name).allow('', null).error(commonService.getValidationMessage),
  relationship: Joi.string().pattern(patterns.noSpace).required().error(commonService.getValidationMessage),
  fromId: Joi.string().allow(null).guid({ version: 'uuidv4' }).error(commonService.getValidationMessage),

  modules: Joi.any().required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const circleAcceptOrDeniedOrSchema = Joi.object({
  circleId: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const circleCancelSchema = Joi.object({
  circleId: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
  type: Joi.string().required().valid('circle', 'invite').error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const communityCircleUsersListSchema = Joi.object({
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
  type: Joi.number().required().valid(1, 2, 3, 4, 5).error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const userModuleUpdateSchema = Joi.object({
  circleId: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
  modules: Joi.object().required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const getByIdSchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const getConnectedUserByUserIdSchema = Joi.object({
  userId: Joi.string().guid({ version: 'uuidv4' }).allow('', null).error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

module.exports = {
  validateGetByUuid: async (dataToValidate) => await validateFunc(getByUuidSchema, dataToValidate),
  inviteUserCircle: async (dataToValidate) => await validateFunc(inviteUserCircleSchema, dataToValidate),
  circleAcceptOrDeniedOrSchema: async (dataToValidate) =>
    await validateFunc(circleAcceptOrDeniedOrSchema, dataToValidate),
  circleCancelSchema: async (dataToValidate) => await validateFunc(circleCancelSchema, dataToValidate),
  validateCommunityCircleUsersList: async (dataToValidate) =>
    await validateFunc(communityCircleUsersListSchema, dataToValidate),
  validateGetConnectedUserByUserId: async (dataToValidate) =>
    await validateFunc(getConnectedUserByUserIdSchema, dataToValidate),
  validateUserModuleUpdate: async (dataToValidate) => await validateFunc(userModuleUpdateSchema, dataToValidate),
  validateGetById: async (dataToValidate) => await validateFunc(getByIdSchema, dataToValidate),
};
