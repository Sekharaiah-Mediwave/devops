const { sgMail } = require('./imports');
const config = require('../config/config');

module.exports = {
  sendMail: async (toMailId, mailSubject, mailText, mailHtml) => {
    const msg = {
      to: toMailId,
      from: config.fromMailId,
      subject: mailSubject,
    };
    if (mailText) {
      msg.text = mailText;
    }
    if (mailHtml) {
      msg.html = mailHtml;
    }
    try {
      const mailSendResp = await sgMail.send(msg);
      return mailSendResp;
    } catch (error) {
      console.log('\n mail send error...', error);
      return '';
    }
  },
  sendBulkMail: async (messages = []) => {
    try {
      if (messages.length) {
        messages = messages.map((innerData) => {
          innerData.from = config.fromMailId;
          return innerData;
        });
        const mailSendResp = await sgMail.send(messages);
        return mailSendResp;
      }
      return [];
    } catch (error) {
      console.log('\n mail send error...', error.response.body.errors);
      return '';
    }
  },
  getValidationMessage: (joiErrors = []) => {
    joiErrors.forEach((err) => {
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
    joiErrors = joiErrors.map((error) => ({
      message: error.message,
      field: error.context.key,
    }));
    if (joiErrors.length === 1) {
      return joiErrors[0];
    }
    return joiErrors;
  },
};
