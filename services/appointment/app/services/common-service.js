const { momentTz } = require('./imports');

const indiaTz = (date) => {
    if (!date) {
        return momentTz().tz('Asia/Kolkata');
    }
    return momentTz(momentTz(date).toDate()).tz('Asia/Kolkata');
};
module.exports = {
    indiaTz,
    setHeaders: (headersData, headerKeys = []) => {
        if (headersData) {
            let returnHeaders = {};
            if (headerKeys.length) {
                headerKeys.forEach((headerKeyName) => {
                    returnHeaders = { ...returnHeaders, [headerKeyName]: headersData[headerKeyName] };
                });
                headersData = returnHeaders;
            }
            return {
                headers: headersData
            };
        }
        return undefined;
    },
    compareDates: (dateVar1, dateVar2, condition) => {
        if (condition == 'greater') {
            return indiaTz(dateVar1).toDate().getTime() > indiaTz(dateVar2).toDate().getTime();
        }
        if (condition == 'lesser') {
            return indiaTz(dateVar1).toDate().getTime() < indiaTz(dateVar2).toDate().getTime();
        }
        if (condition == 'equal') {
            return indiaTz(dateVar1).toDate().getTime() == indiaTz(dateVar2).toDate().getTime();
        }
        if (condition == 'le') {
            return indiaTz(dateVar1).toDate().getTime() <= indiaTz(dateVar2).toDate().getTime();
        }
        if (condition == 'ge') {
            return indiaTz(dateVar1).toDate().getTime() >= indiaTz(dateVar2).toDate().getTime();
        }
        return indiaTz(dateVar1).toDate().getTime() > indiaTz(dateVar2).toDate().getTime();
    },
    updateQueryStringParameter: (uri, key, value) => {
        const returnArr = key.map((innerKeyData, idx) => {
            const re = new RegExp('([?&])' + innerKeyData + '=.*?(&|$)', 'i');
            const separator = uri.indexOf('?') !== -1 ? '&' : '?';
            if (uri.match(re)) {
                uri = uri.replace(re, '$1' + innerKeyData + '=' + value[idx] + '$2');
                return uri;
            }
            else {
                uri = uri + separator + innerKeyData + '=' + value[idx];
                return uri;
            }
        });
        return returnArr[returnArr.length - 1] || uri;
    },
    getValidationMessage: (joiErrors = []) => {
        joiErrors.forEach(err => {
            switch (err.code) {
                case 'date.greater':
                    err.message = `${err.local.label} must be greater than ${err.local.limit.key}!`;
                    break;
                case 'object.xor':
                    err.message = `Any one of ${err.local.peers.join(', ')} is allowed!`;
                    break;
                case 'object.unknown':
                    err.message = `${err.local.label} should not allowed!`;
                    break;
                case 'any.empty':
                    err.message = `${err.local.value} should not be empty!`;
                    break;
                case 'any.required':
                    err.message = `${err.local.label} must be required!`;
                    break;
                case 'object.base':
                    err.message = `Valid ${err.local.label} json is required!`;
                    break;
                case 'json.invalid':
                    err.message = `Valid ${err.local.label} json is required!`;
                    break;
                case 'string.invalid':
                    err.message = `Valid ${err.local.label} is required!`;
                    break;
                case 'string.empty':
                    err.message = `${err.local.label} should not be empty!`;
                    break;
                case 'string.min':
                    err.message = `${err.local.label} should have at least ${err.local.limit} characters!`;
                    break;
                case 'string.max':
                    err.message = `${err.local.label} should have at most ${err.local.limit} characters!`;
                    break;
                case 'string.pattern.base':
                    err.message = `${err.local.label} with value ${err.local.value} fails to match the ${err.local.label} pattern`;
                    break;
                case 'date.base':
                    err.message = `${err.local.label} must be a valid date`;
                    break;
                case 'boolean.base':
                    err.message = `${err.local.label} must be boolean`;
                    break;
                case 'number.min':
                    err.message = `${err.local.label} must be larger than or equal to ${err.local.limit}`;
                    break;
                case 'number.max':
                    err.message = `${err.local.label} must be lesser than or equal to ${err.local.limit}`;
                    break;
                case 'alternatives.match':
                    err.message = `${err.local.label} must have correct value`;
                    break;
                case 'object.missing':
                    err.message = `At least one of ${err.local.peers.join(', ')} is required`;
                    break;
                case 'object.with':
                    err.message = `${err.local.peerWithLabel} is required`;
                    break;
                default:
                    break;
            }
        });
        return joiErrors;
    },
    convertJoiErrors: (joiErrors = []) => {
        joiErrors = joiErrors.map(error => {
            return {
                message: error.message,
                field: error.context.key
            };
        });
        if (joiErrors.length === 1) {
            return joiErrors[0];
        }
        return joiErrors;
    }
};