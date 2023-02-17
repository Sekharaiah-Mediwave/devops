const commonService = require('../services/common-service');
const { _ } = require('../services/imports');

module.exports = {
  sendReminders: async (ctx) => {
    try {
      const trustMessage = 'Maia';

      const reminder_html = `<html>

          <% if(body.userInfo.firstName){ %>
            <p>Dear <%= body.name %>, </p>
          <% } else{ %>
            <p>Hi there, </p>
          <% } %>
        
        
        
        <p>
          Time to get ready for your event, which starts in <b> <%= body.reminder_type %> </b>.
        </p>
        
        <p>
          Good luck, we know you can do it!
        </p>
        
        
        <p>
        Best wishes from
        <% if(trustMessage){ %>
          The <%= trustMessage %> team
        <% } else{ %>
          The MyPHR team
        <% } %>
        </p>
        
        </html>
        `;
      const event_reminder_template = _.template(reminder_html);

      // console.log(ctx.request.body);

      const payload = ctx.request.body.map((p) => {
        // console.log(p, '---------')
        const new_p = {};
        new_p.to = p.userInfo.email;
        new_p.subject = 'Event reminder';
        new_p.html = event_reminder_template({
          body: p,
          trustMessage,
        });

        return new_p;
      });

      const promises = [];
      for (const p of payload) {
        promises.push(commonService.sendMail(p.to, p.subject, '', p.html));
      }
      await Promise.all(promises);

      return ctx.res.ok({
        result: 'reminder mails successfully sent',
      });
    } catch (error) {
      console.log(error);
      return ctx.res.internalServerError({ error: (error.response && error.response.data) || error });
    }
  },
};
