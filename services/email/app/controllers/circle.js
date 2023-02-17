const commonService = require('../services/common-service');
const mailValidator = require('../validators/email');
const config = require('../config/config');

module.exports = {
  sendUserInvite: async (ctx) => {
    try {
      const { error, validatedData } = await mailValidator.inviteUser(ctx.request.body);

      if (error) {
        return ctx.res.unprocessableEntity({ msg: error });
      }

      console.log(ctx.request.body);
      const mailSubject = 'User Invite';
      const mailContentHtml = `<p>Click the below link to access maia</p> </br> <a
            href=${config.frontEndUrl}/signup?token=${validatedData.inviteCode}&email=${encodeURIComponent(
  validatedData.invitedUserEmail
)}&type=invite&fname=${validatedData.invitedUserFname}&lname=${validatedData.invitedUserLname}> click here</a>`;
      await commonService.sendMail(validatedData.invitedUserEmail, mailSubject, '', mailContentHtml);
      return ctx.res.ok({ msg: 'Mail Sent Successfully' });
    } catch (error) {
      console.log('\n mail error...', error);
      const errorMessage = (error.response && error.response.data) || error;
      return ctx.res.internalServerError({ msg: errorMessage });
    }
  },
  circleConnect: async (ctx) => {
    try {
      const mailSubject = 'Circle connect request';
      const mailContentHtml = `<p>Click the below link to view and the invites</p> </br> <a
            href=${config.frontEndUrl}/my-community/request-recieved> click here</a>`;
      await commonService.sendMail(ctx.request.body.invitedUserEmail, mailSubject, '', mailContentHtml);
      return ctx.res.ok({ msg: 'Mail Sent Successfully' });
    } catch (error) {
      console.log('\n mail error...', error);
      const errorMessage = (error.response && error.response.data) || error;
      return ctx.res.internalServerError({ msg: errorMessage });
    }
  },
};
