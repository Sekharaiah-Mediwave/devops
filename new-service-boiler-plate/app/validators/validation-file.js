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

const Schema = Joi.object({
    userId: Joi.string().allow('', null).guid({ version: 'uuidv4' }).optional().error(commonService.getValidationMessage),
    code: Joi.string().required().error(commonService.getValidationMessage),
    codeVerifier: Joi.string().required().error(commonService.getValidationMessage),
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
        return await validateFunc(Schema, dataToValidate);
    },
    
};