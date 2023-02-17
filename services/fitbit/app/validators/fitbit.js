/* eslint-disable no-useless-escape */
const config = require('../config/config');
const commonService = require('../services/common-service');
const { Joi } = require('../services/imports');

const patterns = {
    positiveNumber: /^\d*[1-9]\d*$/,
    age: /^(?:1[0-9][0-9]|[1-9]|200|[1-9][0-9])$/,
    name: /^[a-zA-Z ]+$/,
    mobile: /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]{10}$/,
    noSpace: /\S/
};

const fitBitOauth2TokenSchema = Joi.object({
    userId: Joi.string().allow('', null).guid({ version: 'uuidv4' }).optional().error(commonService.getValidationMessage),
    code: Joi.string().required().error(commonService.getValidationMessage),
    codeVerifier: Joi.string().required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const sleepLogByDateRangeSchema = Joi.object({
    userId: Joi.string().allow('', null).guid({ version: 'uuidv4' }).optional().error(commonService.getValidationMessage),
    type: Joi.string().valid('week', 'month', 'day').required().error(commonService.getValidationMessage),
    startDate: Joi.date().required().error(commonService.getValidationMessage),
    endDate: Joi.date().required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const sleepLogByDateSchema = Joi.object({
    userId: Joi.string().allow('', null).guid({ version: 'uuidv4' }).optional().error(commonService.getValidationMessage),
    date: Joi.date().required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const stepSchema = Joi.object({
    date: Joi.date().required().error(commonService.getValidationMessage),
    userId: Joi.string().allow('', null).guid({ version: 'uuidv4' }).optional().error(commonService.getValidationMessage),
    type: Joi.string().valid('week', 'month', 'day').required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const stepByDateRangeSchema = Joi.object({
    startDate: Joi.date().required().error(commonService.getValidationMessage),
    endDate: Joi.date().required().error(commonService.getValidationMessage),
    userId: Joi.string().allow('', null).guid({ version: 'uuidv4' }).optional().error(commonService.getValidationMessage),
    type: Joi.string().valid('week', 'month', 'day').required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const sleepGoalSchema = Joi.object({
    userId: Joi.string().allow('', null).guid({ version: 'uuidv4' }).optional().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

async function validateFunc(schemaName, dataToValidate) {
    try {
        const {
            error,
            value
        } = schemaName.validate(dataToValidate);
        return {
            error: (error ? commonService.convertJoiErrors(error.details) : ''),
            validatedData: value
        };
    } catch (error) {
        return {
            error
        };
    }
}

module.exports = {
    validateFitBitOauth2Token: async (dataToValidate) => {
        return await validateFunc(fitBitOauth2TokenSchema, dataToValidate);
    },
    validateFitBitSleepLogByDateRange: async (dataToValidate) => {
        return await validateFunc(sleepLogByDateRangeSchema, dataToValidate);
    },
    validateFitBitSleepGoal: async (dataToValidate) => {
        return await validateFunc(sleepGoalSchema, dataToValidate);
    },
    validateFitBitSleepLogByDate: async (dataToValidate) => {
        return await validateFunc(sleepLogByDateSchema, dataToValidate);
    },
    validateFitBitStepByDate: async (dataToValidate) => {
        return await validateFunc(stepSchema, dataToValidate);
    },
    validateFitBitStepByDateRange: async (dataToValidate) => {
        return await validateFunc(stepByDateRangeSchema, dataToValidate);
    },
    
};