const commonService = require('../services/common-service');
const mailValidator = require('../validators/email');
const config = require('../config/config');

module.exports = {
  sendResetPasswordMail: async (ctx) => {
    try {
      const { error, validatedData } = await mailValidator.validateResetPasswordMail(ctx.request.body);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }
      const mailSubject = 'Rest Password Mail';
      const mailContentHtml = `<p>Click the below link to reset your account password</p> </br> <a 
            href=${config.frontEndUrl}/reset-password?token=${validatedData.token}&username=${encodeURIComponent(
  validatedData.username
)}> click here</a>`;
      await commonService.sendMail(validatedData.email, mailSubject, '', mailContentHtml);
      ctx.res.ok({ msg: 'Mail Sent Successfully' });
    } catch (error) {
      console.log('\n mail error...', error);
      ctx.res.internalServerError({ error: (error.response && error.response.data) || error });
    }
  },
  sendAccountVerificationMail: async (ctx) => {
    try {
      const { error, validatedData } = await mailValidator.validateAccountVerificationMail(ctx.request.body);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }
      const mailSubject = 'Account Verification Mail';
      const mailContentHtml = `<p>Click the below link to verify your account.</p> </br> <a 
            href=${config.frontEndUrl}?token=${validatedData.token}&username=${encodeURIComponent(
  validatedData.username
)}> click here</a>`;
      await commonService.sendMail(validatedData.email, mailSubject, '', mailContentHtml);
      ctx.res.ok({ msg: 'Mail Sent Successfully' });
    } catch (error) {
      console.log('\n mail error...', error);
      ctx.res.internalServerError({ error: (error.response && error.response.data) || error });
    }
  },
  sendMailToUpdateEmail: async (ctx) => {
    try {
      const primaryMailSubject = 'Account Mail Update Notification.';
      const primaryMailContentHtml = '<p>Your account has been requested to change new email.</p>';
      const primaryMailSendResp = commonService.sendMail(
        ctx.request.body.primaryMail,
        primaryMailSubject,
        '',
        primaryMailContentHtml
      );

      const newMailSubject = 'Account Mail Update OTP.';
      const newMailContentHtml = `<p>Enter the below OTP to update your account mail.</p> <br> ${ctx.request.body.token}`;
      const newMailSendResp = commonService.sendMail(ctx.request.body.newMail, newMailSubject, '', newMailContentHtml);

      await Promise.all([newMailSendResp, primaryMailSendResp]);
      ctx.res.ok({ msg: 'Mail Sent Successfully' });
    } catch (error) {
      console.log('\n mail error...', error);
      ctx.res.internalServerError({ error: (error.response && error.response.data) || error });
    }
  },
  sendAccountMailUpdated: async (ctx) => {
    try {
      const mailSubject = 'Account Mail Update Notification.';
      const mailContentHtml = '<p>Your account mail has been updated to this mail.</p>';
      await commonService.sendMail(ctx.request.body.email, mailSubject, '', mailContentHtml);
      ctx.res.ok({ msg: 'Mail Sent Successfully' });
    } catch (error) {
      console.log('\n mail error...', error);
      ctx.res.internalServerError({ error: (error.response && error.response.data) || error });
    }
  },
  sendMailForTwoFactorAuth: async (ctx) => {
    try {
      const mailSubject = 'Two Factor Auth Enable OTP.';
      const mailContentHtml = `<p>Enter the below OTP to enable two factor auth.</p> <br> ${ctx.request.body.token}`;
      await commonService.sendMail(ctx.request.body.email, mailSubject, '', mailContentHtml);
      ctx.res.ok({ msg: 'Mail Sent Successfully' });
    } catch (error) {
      console.log('\n mail error...', error);
      ctx.res.internalServerError({ error: (error.response && error.response.data) || error });
    }
  },
  sendLoginOtp: async (ctx) => {
    try {
      const mailSubject = 'Your 6 digit login code.';
      const mailContentHtml = `<p>Hi ${ctx.request.body.name},</p> </br></br>
            Your 4 digit login code is  ${ctx.request.body.token}`;
      await commonService.sendMail(ctx.request.body.email, mailSubject, '', mailContentHtml);
      ctx.res.ok({ msg: 'Mail Sent Successfully' });
    } catch (error) {
      console.log('\n mail error...', error);
      ctx.res.internalServerError({ error: (error.response && error.response.data) || error });
    }
  },
};
