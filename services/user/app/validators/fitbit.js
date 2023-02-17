const commonService = require('../services/common-service');
const { Joi } = require('../services/imports');

const getByIdSchema = Joi.object({
    uuid: Joi.string().guid({ version: 'uuidv4' }).required().error(commonService.getValidationMessage),
    tableName: Joi.string().required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const saveSchema = Joi.object({
    appName: Joi.string().required().error(commonService.getValidationMessage),
    status: Joi.string().allow('connected', 'disconnected').required().error(commonService.getValidationMessage)
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
    validateSave: async (dataToValidate) => {
        return await validateFunc(saveSchema, dataToValidate);
    },
};