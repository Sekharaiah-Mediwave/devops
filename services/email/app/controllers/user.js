const commonService = require('../services/common-service');
const config = require('../config/config');

const mailContent = (ctx, role) => {
  const mailSubject = 'Account Created';
  const mailContentHtml = `<strong>Dear ${ctx.request.body.firstName}</strong> </br>
            <p>Your ${role} account for MAIA is created and credentials shared below.</p> </br>
            <p>Username: ${ctx.request.body.username} </p> </br>
            <p>Password: ${ctx.request.body.password}</p> </br>
            <a href=${config.frontEndUrl}> MAIA Site</a>`;
  return { mailSubject, mailContentHtml };
};

module.exports = {
  adminCreatedMail: async (ctx) => {
    try {
      const { mailSubject, mailContentHtml } = mailContent(ctx, 'admin');
      await commonService.sendMail(ctx.request.body.email, mailSubject, '', mailContentHtml);
      ctx.res.ok({ msg: 'Mail Sent Successfully' });
    } catch (error) {
      console.log('\n mail error...', error);
      ctx.res.internalServerError({ error: (error.response && error.response.data) || error });
    }
  },
  clinicianCreatedMail: async (ctx) => {
    try {
      const { mailSubject, mailContentHtml } = mailContent(ctx, 'clinician');
      await commonService.sendMail(ctx.request.body.email, mailSubject, '', mailContentHtml);
      ctx.res.ok({ msg: 'Mail Sent Successfully' });
    } catch (error) {
      console.log('\n mail error...', error);
      ctx.res.internalServerError({ error: (error.response && error.response.data) || error });
    }
  },
  careTeamCreatedMail: async (ctx) => {
    try {
      const { mailSubject, mailContentHtml } = mailContent(ctx, 'care team');
      await commonService.sendMail(ctx.request.body.email, mailSubject, '', mailContentHtml);
      ctx.res.ok({ msg: 'Mail Sent Successfully' });
    } catch (error) {
      console.log('\n mail error...', error);
      ctx.res.internalServerError({ error: (error.response && error.response.data) || error });
    }
  },
  patientCreatedMail: async (ctx) => {
    try {
      const { mailSubject, mailContentHtml } = mailContent(ctx, 'patient');
      await commonService.sendMail(ctx.request.body.email, mailSubject, '', mailContentHtml);
      ctx.res.ok({ msg: 'Mail Sent Successfully' });
    } catch (error) {
      console.log('\n mail error...', error);
      ctx.res.internalServerError({ error: (error.response && error.response.data) || error });
    }
  },
};
