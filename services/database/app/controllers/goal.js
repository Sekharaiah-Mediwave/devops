const commonService = require('../services/common-service');
const dbService = require('../services/db-service');
const { _, moment, uuidv4 } = require('../services/imports');
const config = require('../config/config');
const request = require('../middleware/axios-request');
const responseMessages = require('../middleware/response-messages');
const { Sequelize } = require('../config/sequelize');

const { Op } = Sequelize;

const saveDiaryRecord = async (savePayload) => await dbService.create('diary', savePayload, {});

function removeDuplicates(dataValue) {
  return dataValue.filter((a, b) => dataValue.indexOf(a) === b);
}
function setHeaders(headersData) {
  let headers;
  if (headersData.authorization) {
    headers = {
      authorization: headersData.authorization,
      domain_url: headersData.domain_url,
    };
  } else {
    headers = {
      domain_url: headersData.domain_url,
    };
  }
  return headers;
}

async function sendEmail(ctx) {
  return await request.post(ctx, `${config.emailUrl}/email/goal/send-rgoal-no-tasks-for-today`, ctx.request.body);
}

module.exports = {
  saveDiaryRecord,
  syncFhir: async (ctx) => {
    try {
      const updatePromise = _.filter(ctx.request.body.fhirSyncArray || [], (innerData) => !innerData.deleted).map(
        (innerData) =>
          dbService.update('diary', { fhirSynced: true, fhirId: innerData.fhirId }, { where: { id: innerData.id } }, {})
      );

      const idsToDelete = _.filter(ctx.request.body.fhirSyncArray || [], (innerData) => innerData.deleted).map(
        (innerData) => innerData.id
      );

      const updateResp = await Promise.all(updatePromise);
      const deletedResp = await dbService.destroy('diary', { where: { id: { [Op.in]: idsToDelete } } });

      ctx.res.ok({ result: { updateResp, deletedResp } });
      return;
    } catch (error) {
      console.log('\n diary fhir sync update error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  createRGoal: async (ctx) => {
    try {
      const goalData = {
        ...ctx.request.body,
      };

      delete goalData.steps;
      goalData.user_id = ctx.request.body.userId || ctx.req.decoded.uuid;

      const rgoal = await dbService.create('RGoal', goalData, {});
      if (!rgoal) {
        return ctx.res.badRequest({
          msg: 'Failed to create goal',
        });
      }

      const rgoal_steps = ctx.request.body.steps
        ? ctx.request.body.steps.map((s) => ({
          ...s,
          r_goal_id: rgoal.uuid,
        }))
        : [];

      if (rgoal_steps.length) {
        const bulk_create_status = await dbService.bulkCreate('RGoalStep', rgoal_steps);
        const bc_steps = JSON.parse(JSON.stringify(bulk_create_status));

        for (const s of bc_steps) {
          // now generate calendar entries for all the dates
          let diff = moment(goalData.to_date).diff(moment(goalData.from_date), 'days');
          const dates = [];

          if (s.meta_how_often === 'once_a_day') {
            // if a goal is from 23/04/2020 to 24/04/2020, diff only gives one day
            // but we need entries for 2 days
            for (let i = 0; i <= diff; i++) {
              const date = moment(goalData.from_date).add(i, 'day').format('YYYY-MM-DD');
              // dates.push(date);
              const obj = {
                r_goal_id: rgoal.uuid,
                r_goal_step_id: s.uuid,
                status: 'active',
              };

              const time = moment(s.meta_times[0]).format('HH:mm');
              obj.date_time = new Date(`${date} ${time}`);

              if (s.meta_has_reminder === true) {
                // obj.reminder_date_time = moment(obj.date_time).subtract(3, 'hours').toDate();
                obj.reminder_date_time = moment(obj.date_time).subtract(s.meta_reminder_minutes, 'minutes').toDate();
                obj.reminder_send = false;
              }
              dates.push(obj);
            } // -for
          } else if (s.meta_how_often === 'other') {
            const days = ['mon', 'tues', 'wed', 'thur', 'fri', 'sat', 'sun'];
            // [0,1,2,3,4,5,6]: the + 1 is for making the 1st day as 1
            // moment.day() gives 1st day of week
            const day_nums = s.meta_days.map((d) => days.indexOf(d) + 1);

            // do this for 3 weeks?
            let last_date = moment(goalData.from_date)
              .add(s.meta_do_this_for_value, s.meta_do_this_for_type)
              .format('YYYY-MM-DD');

            if (s.meta_do_this_for_type == 'days') {
              last_date = moment(goalData.to_date).format('YYYY-MM-DD');
            }

            diff = moment(last_date).diff(moment(goalData.from_date), 'days');
            // console.log('-----', last_date, '----', diff , ' --- ', day_nums)
            // console.log(s)
            // console.log('-------------------------')
            for (let i = 0; i <= diff; i++) {
              // include last day too
              const date = moment(goalData.from_date).add(i, 'day');
              // console.log('-----> ', date.day())
              if (day_nums.includes(date.day())) {
                for (const t of s.meta_times) {
                  const obj = {
                    r_goal_id: rgoal.uuid,
                    r_goal_step_id: s.uuid,
                    status: 'active',
                  };
                  const time = moment(t).format('HH:mm');
                  obj.date_time = new Date(`${date.format('YYYY-MM-DD')} ${time}`);

                  if (s.meta_has_reminder === true) {
                    // obj.reminder_date_time = moment(obj.date_time).subtract(3, 'hours').toDate();
                    obj.reminder_date_time = moment(obj.date_time)
                      .subtract(s.meta_reminder_minutes, 'minutes')
                      .toDate();
                    obj.reminder_send = false;
                  }
                  dates.push(obj);
                }
              }
            }
          }

          console.log('-- dates-->', dates);
          await dbService.bulkCreate('RGoalStepDateTime', dates);
        }
      }

      return ctx.res.ok({
        message: 'Goal created successfully',
      });
    } catch (e) {
      console.log(e);
      return ctx.res.badRequest({
        msg: 'bad request!',
      });
    }
  },
  getRGoalsByDate: async (ctx) => {
    try {
      // expects a query string of date
      const date = ctx.request.query.date ? ctx.request.query.date : moment().format('YYYY-MM-DD');

      const items = await dbService.findAll('RGoalStepDateTime', {
        where: {
          date_time: {
            [Op.gt]: `${moment(date).startOf('day')}`,
            [Op.lte]: moment(date).endOf('day'),
          },
        },
        attributes: ['uuid', 'date_time', 'status'],
        include: [
          {
            model: 'RGoalStep',
            attributes: [
              ['uuid', 'goal_step_id'],
              ['name', 'step_name'],
              'meta_how_often',
              'meta_reminder_minutes',
              'meta_do_this_for_type',
              'meta_do_this_for_value',
              'meta_has_reminder',
              'meta_days',
              'meta_times',
            ],
            as: 'step_details',
            include: [
              {
                model: 'RGoal',
                attributes: [
                  ['uuid', 'goal_id'],
                  ['name', 'goal_name'],
                  'user_id',
                  'description',
                  'createdAt',
                  'from_date',
                  'to_date',
                  'status',
                ],
                as: 'goal_details',
                where: {
                  user_id: ctx.request.body.userId || ctx.req.decoded.uuid,
                },
              },
            ],
          },
        ],
      });

      const itemsParsed = JSON.parse(JSON.stringify(items));

      console.log('------> ', itemsParsed);

      const result = {
        all: [],
        active: [],
        completed: [],
        active_orig: itemsParsed.filter((i) => i.status === 'active'),
        completed_orig: itemsParsed.filter((i) => i.status === 'completed'),
      };

      /**
       * {
            "id": 64,
            "date_time": "2020-05-11T02:00:00.000Z",
            "status": "completed",
            "step_details": {
              "goal_step_id": 15,
              "step_name": "Watch master chef",
              "goal_details": {
                "goal_id": 16,
                "goal_name": "Learning to cook"
              }
            }
          }

          {
            goal_id: 16,
            goal_name: 'foo',
            steps: [
              { entry_id: 64 ,step_id: 15, step_name: 'bar', status: 'active', date_time: '' }
            ]
          }
       */
      for (const type of ['active', 'completed']) {
        for (const i of result[`${type}_orig`]) {
          // the if is here because the status and user id conditions,
          // if not met will make i.step_details as null
          if (i.step_details && i.step_details.goal_details) {
            const { goal_id } = i.step_details.goal_details;
            // const index = result[type].findIndex(c => c.goal_id === goal_id)
            const index = result.all.findIndex((c) => c.uuid === goal_id);
            if (index == -1) {
              const obj = {
                uuid: goal_id,
                user_id: i.step_details.goal_details.user_id,
                name: i.step_details.goal_details.goal_name,
                description: i.step_details.goal_details.description,
                from_date: i.step_details.goal_details.from_date,
                to_date: i.step_details.goal_details.to_date,
                status: i.step_details.goal_details.status,
                createdAt: i.step_details.goal_details.createdAt,
                step_details: [
                  {
                    entry_id: i.uuid,
                    uuid: i.step_details.goal_step_id,
                    name: i.step_details.step_name,
                    status: type,
                    meta_how_often: i.step_details.meta_how_often,
                    meta_reminder_minutes: i.step_details.meta_reminder_minutes,
                    meta_do_this_for_type: i.step_details.meta_do_this_for_type,
                    meta_do_this_for_value: i.step_details.meta_do_this_for_value,
                    meta_has_reminder: i.step_details.meta_has_reminder,
                    meta_days: i.step_details.meta_days,
                    meta_times: i.step_details.meta_times,
                    date_time: i.date_time,
                  },
                ],
              };
              // result[type].push(obj);
              result.all.push(obj);
            } else {
              // replace type here
              result.all[index].step_details.push({
                entry_id: i.uuid,
                uuid: i.step_details.goal_step_id,
                name: i.step_details.step_name,
                status: type,
                meta_how_often: i.step_details.meta_how_often,
                meta_reminder_minutes: i.step_details.meta_reminder_minutes,
                meta_do_this_for_type: i.step_details.meta_do_this_for_type,
                meta_do_this_for_value: i.step_details.meta_do_this_for_value,
                meta_has_reminder: i.step_details.meta_has_reminder,
                meta_days: i.step_details.meta_days,
                meta_times: i.step_details.meta_times,
                date_time: i.date_time,
              });
            }
          } // -- if ends
        }
      }

      // return ctx.res.ok({
      //   data: {
      //     active: result.active,
      //     completed: result.completed
      //   }
      // })
      // ctx.audit_trail = {
      //   user: ctx.request.body.userId || ctx.req.decoded.uuid,
      //   data_owner: ctx.request.body.userId || ctx.req.decoded.uuid,
      // }
      // await appendToAuditTrail(ctx);
      return ctx.res.ok({
        result: result.all,
      });
    } catch (e) {
      console.log(e);
      return ctx.res.badRequest({
        msg: 'bad request!',
      });
    }
  },
  markStepCompleted: async (ctx) => {
    try {
      const user_id = ctx.request.body.userId || ctx.req.decoded.uuid;
      const { entry_id } = ctx.request.params;

      // check if the entry belongs to that user,
      // only then mark it as completed
      const entry_data = await dbService.findOne('RGoalStepDateTime', {
        where: {
          uuid: entry_id,
          status: 'active',
        },
        attributes: ['id', 'uuid', 'r_goal_id', 'r_goal_step_id'],
      });

      if (!entry_data) {
        return ctx.res.badRequest({
          msg: 'Entry not found or is not active',
        });
      }

      const goal_data = await dbService.findOne('RGoal', {
        where: {
          uuid: entry_data.r_goal_id,
          user_id,
        },
        attributes: ['id', 'uuid'],
      });
      if (!goal_data) {
        return ctx.res.badRequest({
          msg: 'This item does not belong to you',
        });
      }

      // if everything is ok, mark it as completed
      // check if that is the last item in the goal
      // if so, mark the goal as completed
      const activeCount = await dbService.count('RGoalStepDateTime', {
        where: {
          r_goal_id: goal_data.uuid,
        },
      });
      console.log(activeCount, 'activeCount', entry_data);

      const promiseArray = [];
      let message = 'Task completed';

      promiseArray.push(
        entry_data.update({
          status: 'completed',
        })
      );

      if (1) {
        // last one
        message += ' and goal completed';
        promiseArray.push(
          goal_data.update({
            status: 'completed',
          })
        );
      }
      await Promise.all(promiseArray);

      return ctx.res.ok({
        message,
        result: {
          target_count: activeCount || activeCount - 1,
        },
      });
    } catch (e) {
      console.log(e);
      return ctx.res.badRequest({
        msg: 'bad request!',
      });
    }
  },
  archiveOrActivateGoal: async (ctx) => {
    try {
      console.log(ctx.request.body, 'body');

      console.log(ctx.request.body, 'body');
      let new_status = 'archived';
      if (ctx.request.body.status && ctx.request.body.status === 'active') {
        new_status = 'active';
      }

      // const user_id = ctx.request.body.userId || ctx.req.decoded.uuid;

      const goal = await dbService.findOne('RGoal', {
        where: {
          uuid: ctx.request.params.goal_id,
        },
        attributes: ['id', 'uuid', 'user_id', 'status'],
      });

      if (!goal) {
        return ctx.res.badRequest({
          msg: 'Goal not found',
        });
      }
  
      // if (goal.user_id !== user_id) {
      //   return ctx.res.badRequest({
      //     msg: 'Goal does not belong to you.'
      //   })
      // }
  
      await goal.update({
        status: new_status,
      });
  
      return ctx.res.ok({
        msg: 'Updated successfully',
      });
    } catch (e) {
      console.log(e);
      return ctx.res.badRequest({
        msg: 'bad request!',
      });
    }
  },
  getReminderListForJob: async (ctx) => {
    try {
      if (!ctx.request.query.date) {
        return ctx.res.badRequest({
          msg: 'No date time sent',
        });
      }

      const entries = await dbService.findAll('RGoalStepDateTime', {
        where: {
          reminder_date_time: {
            [Op.lte]: ctx.request.query.date,
            [Op.gt]: moment(ctx.request.query.date).startOf('day').toDate(), // if the 5 min window missed some tasks
          },
          reminder_send: false,
          status: 'active',
        },
        attributes: ['id', 'uuid', 'date_time', 'status'],
        include: [
          {
            model: 'RGoalStep',
            attributes: [['id', 'goal_step_id'], 'uuid', ['name', 'step_name'], ['meta_reminder_minutes', 'mins']],
            as: 'step_details',
            include: [
              {
                model: 'RGoal',
                attributes: [['id', 'goal_id'], 'uuid', ['name', 'goal_name'], 'status', 'user_id'],
                as: 'goal_details',
                where: {
                  status: 'active',
                },
                include: [
                  {
                    model: 'user',
                    attributes: [['email', 'user_email'], 'firstName', 'lastName'],
                    as: 'goals_user',
                  },
                ],
              },
            ],
          },
        ],
      });

      const entriesJ = JSON.parse(JSON.stringify(entries));
      if (!entriesJ.length) {
        return ctx.res.ok({
          data: [],
        });
      }

      const mins_map = {
        15: '15 mins',
        30: '30 mins',
        45: '45 mins',
        60: '1 hr',
        75: '1 hr 15 mins',
        90: '1 hr 30 mins',
        120: '2 hrs',
        150: '2 hrs 30 mins',
      };

      const entries_mails = entriesJ
        .filter((en) => en.step_details && en.step_details.goal_details && en.step_details.goal_details.goals_user)
        .map((e) => {
          const new_e = {
            entry_id: e.uuid,
            email_id: e.step_details.goal_details.goals_user.user_email,
            name: `${e.step_details.goal_details.goals_user.firstName} ${e.step_details.goal_details.goals_user.lastName}`,
            // text: `Please do <i>${e.step_details.step_name}</i>, for your goal <b>${e.step_details.goal_details.goal_name}</b>.`
            text: '', // left for legacy purpose
            goal_name: e.step_details.goal_details.goal_name,
            duration: mins_map[String(e.step_details.mins)],
          };
          return new_e;
        });

      return ctx.res.ok({
        result: entries_mails,
      });
    } catch (e) {
      console.log(e);
      return ctx.res.badRequest({
        msg: 'bad request!',
      });
    }
  },
  updateRGoalReminders: async (ctx) => {
    try {
      if (!ctx.request.body.ids) {
        return ctx.res.badRequest({
          msg: 'No entry ids found',
        });
      }

      await dbService.update(
        'RGoalStepDateTime',
        {
          reminder_send: true,
        },
        {
          where: {
            uuid: ctx.request.body.ids,
          },
        }
      );

      return ctx.res.ok({
        msg: 'Reminder status updated',
      });
    } catch (e) {
      console.log(e);
      return ctx.res.badRequest({
        msg: 'bad request!',
      });
    }
  },
  updateRGoal: async (ctx) => {
    // TODO: this needs a lot of trimming.
    // code is re
    try {
      const user_id = ctx.request.body.userId || ctx.req.decoded.uuid;

      // check if goal is present and belongs to the user
      const goal = await dbService.findOne('RGoal', {
        where: {
          uuid: ctx.request.params.goal_id,
          user_id,
          status: 'active',
        },
        attributes: ['id', 'uuid', 'name', 'description', 'from_date', 'to_date'],
        include: [
          {
            model: 'RGoalStep',
            as: 'step_details',
            attributes: [
              ['uuid', 'step_id'],
              'id',
              'name',
              'meta_how_often',
              'meta_reminder_minutes',
              'meta_do_this_for_type',
              'meta_do_this_for_value',
              'meta_has_reminder',
              'meta_days',
              'meta_times',
            ],
          },
        ],
      });

      if (!goal) {
        return ctx.res.badRequest({
          msg: 'Goal not found',
        });
      }

      // updating goal
      const newGoalData = {};
      const goalData = {
        uuid: goal.uuid,
        name: goal.name,
        description: goal.description,
        from_date: goal.from_date,
        to_date: goal.to_date,
        steps: goal.step_details,
      };

      let goal_data_changed = false;
      if (ctx.request.body.name && goal.name !== ctx.request.body.name) {
        newGoalData.name = ctx.request.body.name;
        goal_data_changed = true;
      }
      if (ctx.request.body.description && goal.description !== ctx.request.body.description) {
        newGoalData.description = ctx.request.body.description;
        goal_data_changed = true;
      }
      if (ctx.request.body.from_date && moment(goal.from_date).format('YYYY-MM-DD') !== ctx.request.body.from_date) {
        newGoalData.from_date = ctx.request.body.from_date;
        goal_data_changed = true;
      }
      if (ctx.request.body.to_date && moment(goal.to_date).format('YYYY-MM-DD') !== ctx.request.body.to_date) {
        newGoalData.to_date = ctx.request.body.to_date;
        goal_data_changed = true;
      }

      if (goal_data_changed) {
        console.log(':: change in existing data, so updating ... ');
        console.log(newGoalData);
        await goal.update(newGoalData);
      }

      // first get the new steps if any that needs to get created
      const new_steps = ctx.request.body.steps
        .filter((s) => !s.uuid)
        .map((m) => ({
          ...m,
          r_goal_id: ctx.request.params.goal_id,
        }));

      // console.log(new_steps);

      // inserting new steps
      if (new_steps.length) {
        const bulk_create_status = await dbService.bulkCreate('RGoalStep', new_steps, { returning: true });
        const bc_steps = JSON.parse(JSON.stringify(bulk_create_status));

        for (const s of bc_steps) {
          // now generate calendar entries for all the dates
          const dates = [];
          let diff = moment(goalData.to_date).diff(moment(goalData.from_date), 'days');

          if (s.meta_how_often === 'once_a_day') {
            // if a goal is from 23/04/2020 to 24/04/2020, diff only gives one day
            // but we need entries for 2 days
            for (let i = 0; i <= diff; i++) {
              const date = moment(goalData.from_date).add(i, 'day').format('YYYY-MM-DD');
              // dates.push(date);
              const obj = {
                r_goal_id: goalData.uuid,
                r_goal_step_id: s.uuid,
                status: 'active',
              };

              const time = moment(s.meta_times[0]).format('HH:mm');
              obj.date_time = new Date(`${date} ${time}`);

              if (s.meta_has_reminder === true) {
                // obj.reminder_date_time = moment(obj.date_time).subtract(3, 'hours').toDate();
                obj.reminder_date_time = moment(obj.date_time).subtract(s.meta_reminder_minutes, 'minutes').toDate();
                obj.reminder_send = false;
              }
              dates.push(obj);
            } // -for
          } else if (s.meta_how_often === 'other') {
            const days = ['mon', 'tues', 'wed', 'thur', 'fri', 'sat', 'sun'];
            // [0,1,2,3,4,5,6]: the + 1 is for making the 1st day as 1
            // moment.day() gives 1st day of week
            const day_nums = s.meta_days.map((d) => days.indexOf(d) + 1);

            // do this for 3 weeks?
            let last_date = moment(goalData.from_date)
              .add(s.meta_do_this_for_value, s.meta_do_this_for_type)
              .format('YYYY-MM-DD');

            if (s.meta_do_this_for_type == 'days') {
              last_date = moment(goalData.to_date).format('YYYY-MM-DD');
            }

            diff = moment(last_date).diff(moment(goalData.from_date), 'days');
            // console.log('-----', last_date,' --- ', day_nums)
            for (let i = 0; i < diff; i++) {
              const date = moment(goalData.from_date).add(i, 'day');
              if (day_nums.includes(date.day())) {
                for (const t of s.meta_times) {
                  const obj = {
                    r_goal_id: goalData.uuid,
                    r_goal_step_id: s.uuid,
                    status: 'active',
                  };
                  const time = moment(t).format('HH:mm');
                  obj.date_time = new Date(`${date.format('YYYY-MM-DD')} ${time}`);

                  if (s.meta_has_reminder === true) {
                    // obj.reminder_date_time = moment(obj.date_time).subtract(3, 'hours').toDate();
                    obj.reminder_date_time = moment(obj.date_time)
                      .subtract(s.meta_reminder_minutes, 'minutes')
                      .toDate();
                    obj.reminder_send = false;
                  }
                  dates.push(obj);
                }
              }
            }
          }
          // console.log('-- dates-->', dates)
          await dbService.bulkCreate('RGoalStepDateTime', dates);
        }
      }

      // now for the old steps
      const old_steps = ctx.request.body.steps.filter((s) => s.uuid);
      // console.log(':: old steps > ', old_steps);
      const orig_steps = JSON.parse(JSON.stringify(goalData.steps));
      // console.log(':: orig steps > ', orig_steps);

      const sids = orig_steps.map((s) => s.step_id);
      const nids = old_steps.map((s) => s.uuid);
      const to_delete = sids.filter((s) => !nids.includes(s));
      if (to_delete.length > 0) {
        await dbService.destroy('RGoalStepDateTime', {
          where: {
            r_goal_step_id: { [Op.in]: to_delete },
          },
        });
        await dbService.destroy('RGoalStep', {
          where: {
            uuid: { [Op.in]: to_delete },
            r_goal_id: goalData.uuid,
          },
        });
        // delete the old entries in datetime table
      }
      if (old_steps.length) {
        for (const s of old_steps) {
          const orig_step_data = orig_steps.find((st) => st.step_id == s.uuid);

          let step_changed = false;

          if (goal_data_changed) {
            // console.log('----------w')
            step_changed = true;
          }

          const new_step_data = {};
          if (orig_step_data.name != s.name) {
            // console.log('----------x')
            step_changed = true;
            new_step_data.name = s.name;
          }
          if (orig_step_data.meta_how_often != s.meta_how_often) {
            // console.log('----------y')
            step_changed = true;
            new_step_data.meta_how_often = s.meta_how_often;
          }
          if (String(orig_step_data.meta_has_reminder) != String(s.meta_has_reminder)) {
            // console.log('----------z')
            step_changed = true;
            new_step_data.meta_has_reminder = s.meta_has_reminder;
          }
          if (orig_step_data.meta_do_this_for_type != s.meta_do_this_for_type) {
            // console.log('----------a')
            step_changed = true;
            new_step_data.meta_do_this_for_type = s.meta_do_this_for_type;
          }
          if (orig_step_data.meta_do_this_for_value != s.meta_do_this_for_value) {
            // console.log('----------b')
            step_changed = true;
            new_step_data.meta_do_this_for_value = s.meta_do_this_for_value;
          }
          if (orig_step_data.meta_reminder_minutes != s.meta_reminder_minutes) {
            // console.log('----------b')
            step_changed = true;
            new_step_data.meta_reminder_minutes = s.meta_reminder_minutes;
          }

          const s_meta_days = s.meta_days ? s.meta_days.join(',') : '';
          // console.log(orig_step_data.meta_days,"orig_step_data.meta_days");
          const orig_meta_days = orig_step_data.meta_days ? orig_step_data.meta_days.join(',') : '';
          if (s_meta_days != orig_meta_days) {
            // console.log('----------c')
            step_changed = true;
            new_step_data.meta_days = s.meta_days;
          }

          // time saved in db is in UTC as sequelize does that by default
          const s_meta_times = s.meta_times ? s.meta_times.map((m) => moment(m).format()) : [];
          // const s_meta_times = s.meta_times ? s.meta_times : [];
          const orig_meta_times = orig_step_data.meta_times
            ? orig_step_data.meta_times.map((m) => moment(m).format())
            : [];
          if (s_meta_times.length != orig_meta_times.length) {
            // console.log('----------d')
            step_changed = true;
            new_step_data.meta_times = s.meta_times;
          }

          if (String(s_meta_times.join(',')) != String(orig_meta_times.join(','))) {
            // console.log('----------e')
            step_changed = true;
            new_step_data.meta_times = s.meta_times;
          }
          // for (const dt of s_meta_times) {
          //   if (!orig_meta_times.includes(dt)) {
          //     step_changed = true;
          //   }
          // }

          // console.log(s_meta_days, orig_meta_days, step_changed)
          // console.log(s_meta_times.join(','), orig_meta_times.join(','))
          // console.log(orig_step_data, new_step_data, step_changed)
          // console.log('----------')
          if (step_changed) {
            await dbService.update('RGoalStep', new_step_data, {
              where: {
                uuid: s.uuid,
                r_goal_id: goalData.uuid,
              },
            });
            // delete the old entries in datetime table
            await dbService.destroy('RGoalStepDateTime', {
              where: {
                r_goal_step_id: s.uuid,
              },
            });

            // now generate calendar entries for all the dates
            const dates = [];
            let diff = moment(goalData.to_date).diff(moment(goalData.from_date), 'days');

            if (s.meta_how_often === 'once_a_day') {
              for (let i = 0; i <= diff; i++) {
                const date = moment(goalData.from_date).add(i, 'day').format('YYYY-MM-DD');
                // dates.push(date);
                const obj = {
                  r_goal_id: goalData.uuid,
                  r_goal_step_id: s.uuid,
                  status: 'active',
                };

                const time = moment(s.meta_times[0]).format('HH:mm');
                obj.date_time = new Date(`${date} ${time}`);

                if (s.meta_has_reminder === true) {
                  // obj.reminder_date_time = moment(obj.date_time).subtract(3, 'hours').toDate();
                  obj.reminder_date_time = moment(obj.date_time).subtract(s.meta_reminder_minutes, 'minutes').toDate();
                  obj.reminder_send = false;
                }
                dates.push(obj);
              } // -for
            } else if (s.meta_how_often === 'other') {
              const days = ['mon', 'tues', 'wed', 'thur', 'fri', 'sat', 'sun'];
              // [0,1,2,3,4,5,6]: the + 1 is for making the 1st day as 1
              // moment.day() gives 1st day of week
              const day_nums = s.meta_days.map((d) => days.indexOf(d) + 1);

              // do this for 3 weeks?
              let last_date = moment(goalData.from_date)
                .add(s.meta_do_this_for_value, s.meta_do_this_for_type)
                .format('YYYY-MM-DD');

              if (s.meta_do_this_for_type == 'days') {
                last_date = moment(goalData.to_date).format('YYYY-MM-DD');
              }

              diff = moment(last_date).diff(moment(goalData.from_date), 'days');
              // console.log('-----', last_date,' --- ', day_nums)
              for (let i = 0; i <= diff; i++) {
                const date = moment(goalData.from_date).add(i, 'day');
                if (day_nums.includes(date.day())) {
                  for (const t of s.meta_times) {
                    const obj = {
                      r_goal_id: goalData.uuid,
                      r_goal_step_id: s.uuid,
                      status: 'active',
                    };
                    const time = moment(t).format('HH:mm');
                    obj.date_time = new Date(`${date.format('YYYY-MM-DD')} ${time}`);

                    if (s.meta_has_reminder === true) {
                      // obj.reminder_date_time = moment(obj.date_time).subtract(3, 'hours').toDate();
                      obj.reminder_date_time = moment(obj.date_time)
                        .subtract(s.meta_reminder_minutes, 'minutes')
                        .toDate();
                      obj.reminder_send = false;
                    }
                    dates.push(obj);
                  }
                }
              }
            }
            // console.log('-- dates-->', dates)
            await dbService.bulkCreate('RGoalStepDateTime', dates);
          }
        }
      }

      return ctx.res.ok({
        msg: 'Updated successfully',
      });
    } catch (e) {
      console.log(e);
      return ctx.res.badRequest({
        msg: 'bad request!',
      });
    }
  },
  checkRGoalTasksLeftForDate: async (ctx) => {
    try {
      if (!ctx.request.query.date) {
        return ctx.res.badRequest({
          msg: 'No date send',
        });
      }
      // check if there are items for the user
      // for that date
      // and check if all those items have their
      // status as completed
      const user_id = ctx.request.body.userId || ctx.req.decoded.uuid;

      const date = ctx.request.query.date ? ctx.request.query.date : moment().format('YYYY-MM-DD');
      // console.log(`------ :: searching with date -> ${date}`);

      const items = await dbService.findAll('RGoalStepDateTime', {
        where: {
          date_time: {
            [Op.gt]: moment(date).startOf('day'),
            [Op.lte]: moment(date).endOf('day'),
          },
        },
        attributes: ['id', 'uuid', 'date_time', 'status'],
        include: [
          {
            model: 'RGoalStep',
            attributes: [['id', 'goal_step_id'], 'uuid'],
            as: 'step_details',
            include: [
              {
                model: 'RGoal',
                attributes: [['id', 'goal_id'], 'uuid', 'status', ['name', 'goal_name']],
                as: 'goal_details',
                where: {
                  status: 'active',
                  user_id,
                },
              },
            ],
          },
        ],
      });

      const data = {
        item_count_for_day: 0,
        item_completed_in_day: 0,
        date: ctx.request.query.date,
      };

      if (!items) {
        return ctx.res.ok({
          msg: 'No tasks found for day',
          result: data,
        });
      }

      const itemsJSON = JSON.parse(JSON.stringify(items));
      const goal_names = itemsJSON
        .filter((i) => i.step_details && i.step_details.goal_details)
        .map((it) => it.step_details.goal_details.goal_name);

      data.item_count_for_day = items.length;
      data.item_completed_in_day = items.filter((i) => i.status === 'completed').length;

      // if the user has completed all tasks for the date
      // send him an email
      if (data.item_count_for_day && data.item_completed_in_day === data.item_count_for_day) {
        console.log(':: Tasks completed for day, sending email ...');
        const user_data = await dbService.findOne('user', {
          where: {
            uuid: user_id,
          },
          attributes: ['id', 'email', '"firstName"'],
        });
        console.log(':: user data -> ', user_data);
        if (user_data && user_data.email) {
          ctx.request.body = {
            email: user_data.email,
            name: user_data.firstName,
            date,
            goal_names,
          };
          await sendEmail(ctx);
        }
      }

      return ctx.res.ok({
        result: data,
      });
    } catch (e) {
      console.log(e);
      return ctx.res.badRequest({
        msg: 'bad request!',
      });
    }
  },
  checkRGoalEndingAtDate: async (ctx) => {
    try {
      // get all goals ending at date
      const date = ctx.request.query.date || moment().format('YYYY-MM-DD');

      const goals = await dbService.findAll('RGoal', {
        where: {
          to_date: {
            [Op.gt]: moment(date).startOf('day'),
            [Op.lte]: moment(date).endOf('day'),
          },
        },
        attributes: ['id', 'uuid', ['name', 'goal_name'], 'user_id'],
        include: [
          {
            model: 'user',
            attributes: [['uuid', 'user_id'], 'email', 'firstName'],
            as: 'goals_user',
          },
        ],
      });

      const payload = [];
      if (goals.length) {
        for (const goal of goals) {
          if (goal.goals_user && goal.goals_user.email) {
            const g = JSON.parse(JSON.stringify(goal));

            const mail = {
              email: g.goals_user.email,
              goal_name: g.goal_name,
              date,
              name: g.goals_user.firstName,
            };
            payload.push(mail);
          }
        }
      }

      return ctx.res.ok({
        result: payload,
      });
    } catch (e) {
      console.log(e);
      return ctx.res.badRequest({
        msg: 'bad request!',
      });
    }
  },
  getAllRGoals: async (ctx) => {
    try {
      const findQuery = {
        where: {
          [Op.and]: [
            {
              user_id: ctx.request.query.userId || ctx.req.decoded.uuid,
            },
          ],
        },
      };
      let sort = 'DESC';
      if (ctx.request.query.sort && ctx.request.query.sort == 'ASC') {
        sort = 'ASC';
      }

      if (ctx.request.query.status) {
        findQuery.where[Op.and].push({ status: ctx.request.query.status });
      } else {
        findQuery.where[Op.and].push({
          [Op.or]: [{ status: 'active' }, { status: 'archived' }],
        });
      }

      if (ctx.request.query.uuid) {
        findQuery.where[Op.and].push({ uuid: ctx.request.query.uuid });
      }
      if (ctx.request.query.entryDate) {
        findQuery.where[Op.and].push(
          Sequelize.where(
            Sequelize.fn('date', Sequelize.col('RGoal.createdAt')),
            '=',
            commonService.indiaTz(ctx.request.query.entryDate).format('YYYY-MM-DD')
          )
        );
      }

      if (ctx.request.query.fromDate) {
        findQuery.where[Op.and].push({
          from_date: { [Op.gte]: commonService.indiaTz(ctx.request.query.fromDate).startOf('day') },
        });
      }

      if (ctx.request.query.toDate) {
        findQuery.where[Op.and].push({
          to_date: { [Op.lte]: commonService.indiaTz(ctx.request.query.toDate).endOf('day') },
        });
      }

      const { count, rows } = await dbService.findAndCountAll('RGoal', {
        where: findQuery.where,
        order: [['createdAt', sort]],
        attributes: ['uuid', 'user_id', 'name', 'description', 'createdAt', 'from_date', 'to_date', 'status'],
        include: [
          {
            model: 'RGoalStep',
            as: 'step_details',
            attributes: [
              'uuid',
              'name',
              'meta_how_often',
              'meta_reminder_minutes',
              'meta_do_this_for_type',
              'meta_do_this_for_value',
              'meta_has_reminder',
              'meta_days',
              'meta_times',
            ],
          },
        ],
      });

      if (!rows.length) {
        return ctx.res.ok({
          result: [],
          count,
        });
      }

      const goalsJSON = JSON.parse(JSON.stringify(rows));
      const promises = [];
      for (const g of rows) {
        promises.push(
          dbService.findAll('RGoalStepDateTime', {
            where: {
              r_goal_id: g.uuid,
              date_time: {
                [Op.gt]: moment().startOf('day'),
              },
            },
            attributes: ['id', 'uuid', 'date_time', 'r_goal_id', 'r_goal_step_id'],
            limit: 1,
            order: [['date_time', 'ASC']],
          })
        );
      }

      const promiseResults = await Promise.all(promises);
      console.log(`\n\n\npromiseResults=======${promiseResults}=====promiseResults\n\n\\n`);

      for (const p of promiseResults) {
        console.log('---------------', p[0]);
        if (p.length && p[0].length) {
          const p0 = p[0];
          const gindex = goalsJSON.findIndex((gj) => gj.uuid == p0.r_goal_id);
          goalsJSON[gindex].next_step_on = p0.date_time;
        }
      }

      return ctx.res.ok({
        result: goalsJSON,
        count,
      });
    } catch (e) {
      console.log(e);
      return ctx.res.badRequest({
        msg: 'bad request!',
      });
    }
  },
};
