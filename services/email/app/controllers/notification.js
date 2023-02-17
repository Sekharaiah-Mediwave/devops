const commonService = require('../services/common-service');
const { _ } = require('../services/imports');
const config = require('../config/config');

module.exports = {
  sendReminders: async (ctx) => {
    try {
      const reminder_html = `<html>        
        <p>
          <%= body.message %>
        </p>        
        </html>
        `;
      const event_reminder_template = _.template(reminder_html);

      // console.log(ctx.request.body);

      const payload = ctx.request.body.map((p) => {
        // console.log(p, '---------')
        const new_p = {};
        new_p.to = p.emails;
        new_p.subject = p.subject;
        new_p.html = event_reminder_template({
          body: p,
        });

        return new_p;
      });

      const promises = [];
      for (const p of payload) {
        promises.push(commonService.sendMail(p.to, p.subject, '', p.html));
      }
      await Promise.all(promises);

      return ctx.res.ok({
        result: 'notification mails successfully sent',
      });
    } catch (error) {
      console.log(error);
      return ctx.res.internalServerError({ error: (error.response && error.response.data) || error });
    }
  },
};
