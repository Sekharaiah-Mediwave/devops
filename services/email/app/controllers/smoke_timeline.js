const commonService = require('../services/common-service');
const config = require('../config/config');

module.exports = {
  sendReminderMail: async (ctx) => {
    try {
      const messages = (ctx.request.body.smokeUserRecords || []).map((smokeData) => ({
        to: smokeData.email,
        subject: `Dear ${smokeData.name}`,
        html: `<p>
                        Congratulations! You have not smoked since ${smokeData.entryStartDate}. See your timeline progress by visiting
                        <a href="${config.frontEndUrl}/tracking/trackers/smoke">the smoking tracker</a>.
                        </p>`,
      }));
      const mailSendResp = await commonService.sendBulkMail(messages);
      ctx.res.ok({ result: mailSendResp });
    } catch (error) {
      console.log('\n daily remainder mail error...', error);
      ctx.res.internalServerError({ error: (error.response && error.response.data) || error });
    }
  },
};
