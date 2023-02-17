const commonService = require('../services/common-service');
const { _ } = require('../services/imports');
const config = require('../config/config');

module.exports = {
  sendRGoalNoTasksForToday: async (ctx) => {
    try {
      console.log('no tasks for day payload ::> ', ctx.request.body);

      const tasks_html = `<html>

        <% if(body.name){ %>
        <p>Dear <%= body.name %>, </p>
        <% } else{ %>
        <p>Hi there, </p>
        <% } %>
    
        <p>
        Congratulations, you are right on target! You have completed all your steps for today (<%= body.date %>) <br/>
        which help you reach your goals: <b>  <%= body.goal_names_csv %> </b>
        </p>
        
        <p>Well done and try to keep it up!</p>
        
        <p>
        Best wishes from
        <% if(trustMessage){ %>
            The <%= trustMessage %> team
        <% } else{ %>
            The MyPHR team
        <% } %>
        </p>
        
        </html>`;

      let tasks_template = _.template(tasks_html);
      ctx.request.body.goal_names_csv = ctx.request.body.goal_names ? ctx.request.body.goal_names.join(', ') : '';
      tasks_template = tasks_template({
        body: ctx.request.body,
        trustMessage: '',
      });

      const mailSendResp = await commonService.sendMail(
        ctx.request.body.email,
        'Congrats on finishing your tasks for the day',
        '',
        tasks_template
      );
      ctx.res.ok({ result: mailSendResp });
    } catch (error) {
      console.log('\n daily remainder mail error...', error);
      ctx.res.internalServerError({ error: (error.response && error.response.data) || error });
    }
  },
  sendRGoalReminders: async (ctx) => {
    try {
      /*
          if (!sgMail && !config.using_nhs_email_service) {
            console.log('::ERROR >> sendgrid not configured and is not using nhs email service.')
            return ctx.res.badRequest({
              message: 'Sendgrid can only be used for sending bulk emails. Its not configured.'
            })
          }
          */

      // this will be an array of payloads
      const trustMessage = '';
      //   if (config.email_trust) {
      //     trustMessage = config.email_trust_message;
      //   }

      const goals_reminder_html = `<html>

          <% if(body.name){ %>
            <p>Dear <%= body.name %>, </p>
          <% } else{ %>
            <p>Hi there, </p>
          <% } %>
        
        
        <p>
        Congratulations, you are taking steps towards reaching your goal: <b><%= body.goal_name %></b>!
        </p>
        
        <p>
          Time to get ready for your next step, which starts in <b> <%= body.duration %> </b>.
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
      const goals_reminder_template = _.template(goals_reminder_html);

      // console.log(ctx.request.body);

      const payload = ctx.request.body.map((p) => {
        // console.log(p, '---------')
        const new_p = {};
        new_p.to = p.email_id;
        new_p.subject = 'Goal reminder';
        new_p.html = goals_reminder_template({
          body: p,
          trustMessage,
        });

        return new_p;
      });

      // console.log('p___ ', payload)

      // await sgMail.send(payload); // this needs to be sendgrid

      // we decided to use nhs's email service for sending
      // emails and that means we can't use sendgrids clean
      // api function of sending an array of payloads as it is
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
  sendRGoalBulkCompleted: async (ctx) => {
    try {
      // if (!sgMail) {
      //   console.log('::ERROR >> sendgrid not configured.')
      //   return ctx.res.badRequest({
      //     message: 'Sendgrid can only be used for sending bulk emails. Its not configured.'
      //   })
      // }

      // this will be an array of payloads
      const trustMessage = '';
      //   if (config.email_trust) {
      //     trustMessage = config.email_trust_message;
      //   }

      const goals_completed_html = `<html>

          <% if(body.name){ %>
            <p>Dear <%= body.name %>, </p>
          <% } else{ %>
            <p>Hi there, </p>
          <% } %>
        
        
        <p>
        Congratulations, you have completed your goal: <b><%= body.goal_name %></b>!
        That is fantastic news; you have reached your personal milestone. Well done!
        </p>
        
        <p>
          Why not set another goal for yourself today in the Goal Tracker here: <a href="<%= link %>"> <%= link %> </a>.
          You can also read about how to set a goal, realistic goals here:
        </p>
        
        <p>
          Good luck!
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
      const goals_template = _.template(goals_completed_html);

      // console.log(ctx.request.body);

      const payload = ctx.request.body.map((p) => {
        // console.log(p, '---------')
        const new_p = {};
        new_p.to = p.email;
        new_p.subject = 'Goal completed';
        new_p.html = goals_template({
          body: p,
          trustMessage,
          link: `${config.frontEndUrl}/tracker/goals/new-goal`,
        });

        return new_p;
      });

      // console.log('p___ ', payload)

      // await sgMail.send(payload); // this needs to be sendgrid

      // we decided to use nhs's email service for sending
      // emails and that means we can't use sendgrids clean
      // api function of sending an array of payloads as it is
      const promises = [];
      for (const p of payload) {
        promises.push(commonService.sendMail(p.to, p.subject, '', p.html));
      }
      await Promise.all(promises);

      return ctx.res.ok({
        result: 'goal completed mails successfully sent',
      });
    } catch (error) {
      console.log(error);
      return ctx.res.internalServerError({ error: (error.response && error.response.data) || error });
    }
  },
};
