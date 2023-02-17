const commonService = require('../services/common-service');
const dbService = require('../services/db-service');
const { _, moment, uuidv4 } = require('../services/imports');
const config = require('../config/config');
const request = require('../middleware/axios-request');
const responseMessages = require('../middleware/response-messages');
const { Sequelize } = require('../config/sequelize');

const { Op } = Sequelize;

module.exports = {
  createNotificationSchedule: async (ctx) => {
    try {
      let emails= ctx.request.body.send_to.map(i=>i.email);
      const scheduleData = {
        ...ctx.request.body,
        viewEmail: [],
        emails
      };

      scheduleData.user_id = ctx.req.decoded?.uuid || ctx.request.body.user_id;

      const rgoal = await dbService.create('notification_schedule', scheduleData, {});
      if (!rgoal) {
        return ctx.res.badRequest({
          msg: 'Failed to create notification schedule',
        });
      }

      // now generate calendar entries for all the dates
      const diff = moment(scheduleData?.end_date).diff(moment(new Date().toISOString()), 'days');
      const dates = [];
      console.log(diff, 'diff');
      if (scheduleData) {
        if (scheduleData.schedule_type === 'daily') {
          for (let i = 0; i <= diff; i++) {
            const date = moment(new Date().toISOString()).add(i, 'day').format('YYYY-MM-DD');
            // dates.push(date);
            const obj = {
              ns_id: rgoal.uuid,
              status: 'pending',
              type: scheduleData.notification_type,
            };

            const time = moment(scheduleData.time).format('HH:mm');
            obj.time = new Date(`${date} ${time}`).toISOString();

            dates.push(obj);
          }
        } else if (scheduleData.schedule_type === 'weekly') {
          for (let i = 0; i <= diff; i++) {
            const date = moment(new Date().toISOString()).add(i, 'day');
            // console.log(scheduleData.week_day,'-----> ', date.format('ddd').toLowerCase()==scheduleData.week_day)
            if (date.format('ddd').toLowerCase() == scheduleData.week_day) {
              const obj = {
                ns_id: rgoal.uuid,
                status: 'pending',
                type: scheduleData.notification_type,
              };
              const time = moment(scheduleData.time).format('HH:mm');
              obj.time = new Date(`${date.format('YYYY-MM-DD')} ${time}`).toISOString();

              dates.push(obj);
            }
          }
        } else if (scheduleData.schedule_type === 'monthly') {
          for (let i = 0; i <= diff; i++) {
            // include last day too

            const date = moment(new Date().toISOString()).add(i, 'day');
            console.log('-----> ', scheduleData.day, date.date(), date.date().toString() == scheduleData.day);
            if (date.date().toString() == scheduleData.day) {
              const obj = {
                ns_id: rgoal.uuid,
                status: 'pending',
                type: scheduleData.notification_type,
              };
              const time = moment(scheduleData.time).format('HH:mm');
              obj.time = new Date(`${date.format('YYYY-MM-DD')} ${time}`).toISOString();

              dates.push(obj);
            }
          }
        } else if (scheduleData.schedule_type === 'yearly') {
          for (let i = 0; i <= diff; i++) {
            // include last day too

            const date = moment(new Date().toISOString()).add(i, 'day');
            console.log(
              '-----> ',
              date.date().toString(),
              scheduleData.day,
              date.format('MMM'),
              scheduleData.month,
              date.date().toString() == scheduleData.day,
              date.format('MMM').toLowerCase() == scheduleData.month
            );
            if (date.date().toString() == scheduleData.day && date.format('MMM').toLowerCase() == scheduleData.month) {
              const obj = {
                ns_id: rgoal.uuid,
                status: 'pending',
                type: scheduleData.notification_type,
              };
              const time = moment(scheduleData.time).format('HH:mm');
              obj.time = new Date(`${date.format('YYYY-MM-DD')} ${time}`).toISOString();

              dates.push(obj);
            }
          }
        } else if (scheduleData.schedule_type === 'direct') {
          const obj = {
            ns_id: rgoal.uuid,
            status: 'done',
            type: scheduleData.notification_type,
            time: new Date(scheduleData.time).toISOString(),
          };
          dates.push(obj);
        } else if (scheduleData.schedule_type === 'once') {
          const obj = {
            ns_id: rgoal.uuid,
            status: 'pending',
            type: scheduleData.notification_type,
            time: new Date(scheduleData.time).toISOString(),
          };
          dates.push(obj);
        }
      }

      console.log('-- dates-->', dates);
      await dbService.bulkCreate('notification', dates);

      return ctx.res.ok({
        message: 'notification created successfully',
      });
    } catch (e) {
      console.log(e);
      return ctx.res.badRequest({
        msg: 'bad request!',
      });
    }
  },
  updateNotificationSchedule: async (ctx) => {
    try {
      let emails= ctx.request.body.send_to.map(i=>i.email);
      const scheduleData = {
        ...ctx.request.body,
        emails
      };
      const { id } = ctx.params;
      console.log(scheduleData, 'scheduleData', id);
      // find the notification schedule
      const notificationSchedule = await dbService.findOne('notification_schedule', {
        where: {
          uuid: id,
          user_id: ctx.req.decoded?.uuid || ctx.request.body.user_id,
        },
      });
      if (!notificationSchedule) {
        return ctx.res.badRequest({
          msg: 'notification schedule not found',
        });
      }
      // delete all notifications for this schedule
      await dbService.destroy('notification', {
        where: {
          ns_id: id,
          status: 'pending',
        },
      });
      // update the notification schedule
      scheduleData.user_id = ctx.req.decoded?.uuid || ctx.request.body.user_id;
      const rgoal = await dbService.update(
        'notification_schedule',
        {
          ...scheduleData,
        },
        {
          where: {
            uuid: id,
            user_id: ctx.req.decoded?.uuid || ctx.request.body.user_id,
          },
        }
      );

      if (!rgoal) {
        return ctx.res.badRequest({
          msg: 'Failed to update notification schedule',
        });
      }

      // now generate calendar entries for all the dates
      const diff = moment(scheduleData?.end_date).diff(moment(new Date()), 'days');
      const dates = [];
      console.log(diff, 'diff');
      if (scheduleData) {
        if (scheduleData.schedule_type === 'daily') {
          for (let i = 0; i <= diff; i++) {
            const date = moment(new Date().toISOString()).add(i, 'day').format('YYYY-MM-DD');
            // dates.push(date);
            const obj = {
              ns_id: id,
              status: 'pending',
              type: scheduleData.notification_type,
            };

            const time = moment(scheduleData.time).format('HH:mm');
            obj.time = new Date(`${date} ${time}`).toISOString();

            dates.push(obj);
          }
        } else if (scheduleData.schedule_type === 'weekly') {
          for (let i = 0; i <= diff; i++) {
            const date = moment(new Date().toISOString()).add(i, 'day');
            // console.log(scheduleData.week_day,'-----> ', date.format('ddd').toLowerCase()==scheduleData.week_day)
            if (date.format('ddd').toLowerCase() == scheduleData.week_day) {
              const obj = {
                ns_id: id,
                status: 'pending',
                type: scheduleData.notification_type,
              };
              const time = moment(scheduleData.time).format('HH:mm');
              obj.time = new Date(`${date.format('YYYY-MM-DD')} ${time}`).toISOString();

              dates.push(obj);
            }
          }
        } else if (scheduleData.schedule_type === 'monthly') {
          for (let i = 0; i <= diff; i++) {
            // include last day too

            const date = moment(new Date().toISOString()).add(i, 'day');
            console.log('-----> ', scheduleData.day, date.date(), date.date().toString() == scheduleData.day);
            if (date.date().toString() == scheduleData.day) {
              const obj = {
                ns_id: id,
                status: 'pending',
                type: scheduleData.notification_type,
              };
              const time = moment(scheduleData.time).format('HH:mm');
              obj.time = new Date(`${date.format('YYYY-MM-DD')} ${time}`).toISOString();

              dates.push(obj);
            }
          }
        } else if (scheduleData.schedule_type === 'yearly') {
          for (let i = 0; i <= diff; i++) {
            // include last day too

            const date = moment(new Date().toISOString()).add(i, 'day');
            console.log(
              '-----> ',
              date.date().toString(),
              scheduleData.day,
              date.format('MMM'),
              scheduleData.month,
              date.date().toString() == scheduleData.day,
              date.format('MMM').toLowerCase() == scheduleData.month
            );
            if (date.date().toString() == scheduleData.day && date.format('MMM').toLowerCase() == scheduleData.month) {
              const obj = {
                ns_id: id,
                status: 'pending',
                type: scheduleData.notification_type,
              };
              const time = moment(scheduleData.time).format('HH:mm');
              obj.time = new Date(`${date.format('YYYY-MM-DD')} ${time}`).toISOString();

              dates.push(obj);
            }
          }
        } else if (scheduleData.schedule_type === 'direct') {
          const obj = {
            ns_id: id,
            status: 'done',
            type: scheduleData.notification_type,
            time: new Date(scheduleData.time).toISOString(),
          };
          dates.push(obj);
        } else if (scheduleData.schedule_type === 'once') {
          const obj = {
            ns_id: id,
            status: 'pending',
            type: scheduleData.notification_type,
            time: new Date(scheduleData.time).toISOString(),
          };
          dates.push(obj);
        }
      }

      console.log('-- dates-->', dates);
      await dbService.bulkCreate('notification', dates);

      return ctx.res.ok({
        message: 'notification updated successfully',
      });
    } catch (e) {
      console.log(e);
      return ctx.res.badRequest({
        msg: 'bad request!',
      });
    }
  },
  getNotificationSchedule: async (ctx) => {
    try {
      const { offset, limit } = commonService.paginationSortFilters(ctx);
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
      console.log(ctx.request.query.type, 'ctx.request.query');
      if (ctx.request.query.type == 'past') {
        findQuery.where[Op.and].push({
          [Op.or]: [
            {
              end_date: {
                [Op.lte]: new Date().toISOString(),
              },
            },
            {
              end_date: null,
            },
          ],
        });
      } else if (ctx.request.query.type == 'future') {
        findQuery.where[Op.and].push({
          end_date: {
            [Op.gt]: new Date().toISOString(),
          },
        });
      }

      if (ctx.request.query.entryDate) {
        findQuery.where[Op.and].push(
          Sequelize.where(
            Sequelize.fn('date', Sequelize.col('notification_schedule.createdAt')),
            '=',
            commonService.indiaTz(ctx.request.query.entryDate).format('YYYY-MM-DD')
          )
        );
      }

      if (ctx.request.query.fromDate) {
        findQuery.where[Op.and].push({
          createdAt: {
            [Op.gte]: commonService.indiaTz(ctx.request.query.fromDate).startOf('day'),
          },
        });
      }

      if (ctx.request.query.toDate) {
        findQuery.where[Op.and].push({
          createdAt: {
            [Op.lte]: commonService.indiaTz(ctx.request.query.toDate).endOf('day'),
          },
        });
      }

      if (ctx.request.query.search) {
        findQuery.where[Op.and].push({
          [Op.or]: [
            Sequelize.where(
              Sequelize.fn('LOWER', Sequelize.col('message')),
              'LIKE',
              `%${(ctx.request.query.search || '').toLowerCase()}%`
            ),
            Sequelize.where(
              Sequelize.fn('LOWER', Sequelize.col('subject')),
              'LIKE',
              `%${(ctx.request.query.search || '').toLowerCase()}%`
            ),
          ],
        });
      }
      let { count, rows } = await dbService.findAndCountAll('notification_schedule', {
        where: findQuery.where,
        order: [['createdAt', sort]],
        offset,
        limit,
      });

      if (!rows.length) {
        return ctx.res.ok({
          result: [],
          count,
        });
      }
      rows = JSON.parse(JSON.stringify(rows));
      rows.map((row) => {
        row.viewCount = 1;
      });

      return ctx.res.ok({
        result: rows,
        count,
      });
    } catch (e) {
      console.log(e);
      return ctx.res.badRequest({
        msg: 'bad request!',
      });
    }
  },
  getNotification: async (ctx) => {
    try {
      const { offset, limit } = commonService.paginationSortFilters(ctx);
      const user = await dbService.findOne('user', {
        where: {
          uuid: ctx.req.decoded.uuid || ctx.request.query.userId,
        },
      });
      console.log(user.email, ctx.request.query?.type, ctx.request.query?.type == 'send');
      console.log(
        ctx.request.query?.type == 'send' ? { user_id: user.uuid } : { emails: { [Op.contains]: [user.email] } },
        '----------------'
      );
      const findQuery = {
        where: {
          [Op.and]: [
            ctx.request.query?.type == 'send' ? { user_id: user.uuid } : { emails: { [Op.contains]: [user.email] } },
            {
              notification_type: { [Op.notIn]: ['email'] },
              // notification_type: { [Op.in]: ['both', 'in_app'] },
            },
          ],
        },
      };
      let sort = 'DESC';
      if (ctx.request.query.sort && ctx.request.query.sort == 'ASC') {
        sort = 'ASC';
      }

      const findQuery1 = {
        where: {
          [Op.and]: [
            {
              status: 'done',
            },
          ],
        },
      };
      if (ctx.request.query?.unread=="true") {
        findQuery1.where[Op.and].push({
          [Op.or]:[{
            [Op.not]: { viewEmail: { [Op.contains]: [user.email] } }, 
          },{
            viewEmail: null 
          }]
        })
      }else if (ctx.request.query?.unread=="false") {
        findQuery1.where[Op.and].push({
          viewEmail: { [Op.contains]: [user.email] } 
        })
      }
      if (ctx.request.query.entryDate) {
        findQuery1.where[Op.and].push(
          Sequelize.where(
            Sequelize.fn('date', Sequelize.col('notification.time')),
            '=',
            commonService.indiaTz(ctx.request.query.entryDate).format('YYYY-MM-DD')
          )
        );
      }

      if (ctx.request.query.fromDate) {
        findQuery1.where[Op.and].push({
          time: {
            [Op.gte]: commonService.indiaTz(ctx.request.query.fromDate).startOf('day'),
          },
        });
      }

      if (ctx.request.query.toDate) {
        findQuery1.where[Op.and].push({
          time: {
            [Op.lte]: commonService.indiaTz(ctx.request.query.toDate).endOf('day'),
          },
        });
      }
      if (ctx.request.query.search) {
        findQuery.where[Op.and].push({
          [Op.or]: [
            Sequelize.where(
              Sequelize.fn('LOWER', Sequelize.col('message')),
              'LIKE',
              `%${(ctx.request.query.search || '').toLowerCase()}%`
            ),
            Sequelize.where(
              Sequelize.fn('LOWER', Sequelize.col('subject')),
              'LIKE',
              `%${(ctx.request.query.search || '').toLowerCase()}%`
            ),
          ],
        });
      }
      const { count, rows } = await dbService.findAndCountAll('notification', {
        where: findQuery1.where,
        order: [['time', sort]],
        offset,
        limit,
        include: [
          {
            model: 'notification_schedule',
            where: findQuery.where,
            include: [
              {
                model: 'user',
                as: 'userInfo',
                include: [
                  {
                    model: 'user_role',
                    as: 'userRole',
                    include: [
                      {
                        model: 'roles',
                        as: 'roleInfo',
                        attributes: ['name'],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      });
      if (!rows.length) {
        return ctx.res.ok({
          result: {
            rows:[],
            count:0,
            unreadCount:0
          },
        });
      }
      // update view count

      const findQuery2 = {
        where: {
          [Op.and]: [
            {
              emails: { [Op.contains]: [user.email] },
            },
            {
              notification_type: { [Op.notIn]: ['email'] },
              // notification_type: { [Op.in]: ['both', 'in_app'] },
            },
          ],
        },
      };

      const findQuery3 = {
        where: {
          [Op.and]: [
            {
              status: 'done',
              [Op.or]:[{
                [Op.not]: { viewEmail: { [Op.contains]: [user.email] } }, 
              },{
                viewEmail: null 
              }]
            },
          ],
        },
      };
      let unreadCount = 0;
      if(ctx.request.query?.type != 'send'){
        const { count, rows } = await dbService.findAndCountAll('notification', {
          where: findQuery3.where,
          include: [
            {
              model: 'notification_schedule',
              where: findQuery2.where,
            },
          ],
        });
        unreadCount=count;
        console.log("rows",user.email,rows);
        // await rows.map(async (row) => {
        //   // add to set the view email
        //   console.log(row,"hii");
        //   await dbService.update(
        //     'notification',
        //     {
        //       viewEmail: Sequelize.fn('array_append', Sequelize.col('viewEmail'), user.email),
        //     },
        //     {
        //       where: {
        //         uuid: row.uuid,
        //       },
        //     }
        //   );
        // });
      }

      if (ctx.request.query.isDateWise) {
        // group by date wise
        const result = {};
        rows.map((row) => {
          const time = moment(row.time).format('YYYY-MM-DD');
          if (!result[time]) {
            result[time] = [];
          }
          result[time].push(row);
        });
        return ctx.res.ok({
          result: {
            rows,
            count,
            unreadCount
          },
        });
      }
      return ctx.res.ok({
        result: {
          rows,
          count,
          unreadCount
        },
      });
    } catch (e) {
      console.log(e);
      return ctx.res.badRequest({
        msg: 'bad request!',
      });
    }
  },
  markAsRead: async (ctx) => {
    try {
      const user = await dbService.findOne('user', {
        where: {
          uuid: ctx.req.decoded.uuid || ctx.request.query.userId,
        },
      });
      // update view count

      const findQuery3 = {
        where: {
          uuid: { [Op.in] : ctx.request.body.uuids },
          status: 'done',
          [Op.or]:[{
            [Op.not]: { viewEmail: { [Op.contains]: [user.email] } }, 
          },{
            viewEmail: null 
          }]
           
        },
      };
        let rows = await dbService.findAll('notification', {
          where: findQuery3.where,
          attributes: ['uuid']
        });
        rows = rows.map((row) => row.uuid);
        console.log("rows",user.email,rows);
      await dbService.update(
        'notification',
        {
          viewEmail: Sequelize.fn('array_append', Sequelize.col('viewEmail'), user.email),
        },
        {
          where: {
            uuid: { [Op.in] : rows }
          },
        }
      );
      return ctx.res.ok({
        result: null,
        msg: "success"
      });
    } catch (e) {
      console.log(e);
      return ctx.res.badRequest({
        msg: 'bad request!',
      });
    }
  },
  getAllNotification: async (ctx) => {
    try {
      const findQuery = {
        where: {
          [Op.and]: [
            {
              notification_type: { [Op.in]: ['both', 'email'] },
            },
          ],
        },
      };

      const findQuery1 = {
        where: {
          [Op.and]: [
            {
              status: 'pending',
              type: { [Op.in]: ['both', 'email'] },
            },
          ],
        },
      };

      if (ctx.request.query.toDate) {
        findQuery1.where[Op.and].push({
          time: {
            [Op.lte]: ctx.request.query.toDate,
          },
        });
      }

      const { rows, count } = await dbService.findAndCountAll('notification', {
        where: findQuery1.where,
        include: [
          {
            model: 'notification_schedule',
            where: findQuery.where,
          },
        ],
      });
      const ids = rows.map((item) => item.uuid);
      await dbService.update(
        'notification',
        {
          status: 'done',
        },
        {
          where: {
            time: {
              [Op.lte]: ctx.request.query.toDate,
            },
          },
        }
      );
      if (!rows.length) {
        return ctx.res.ok({
          result: [],
          count,
        });
      }

      return ctx.res.ok({
        result: rows,
        count,
      });
    } catch (e) {
      console.log(e);
      return ctx.res.badRequest({
        msg: 'bad request!',
      });
    }
  },
  getNotificationCount: async (ctx) => {
    const findQuery = {
      where: {
        [Op.and]: [
          {
            user_id: ctx.request.query.userId || ctx.req.decoded.uuid,
          },
        ],
      },
    };
    const findQuery1 = {
      where: {
        [Op.and]: [
          {
            user_id: ctx.request.query.userId || ctx.req.decoded.uuid,
          },
        ],
      },
    };

    findQuery.where[Op.and].push({
      [Op.or]: [
        {
          end_date: {
            [Op.lte]: new Date().toISOString(),
          },
        },
        {
          end_date: null,
        },
      ],
    });

    findQuery1.where[Op.and].push({
      end_date: {
        [Op.gt]: new Date().toISOString(),
      },
    });

    const pastNotificationCount = await dbService.count('notification_schedule', {
      where: findQuery.where,
    });
    const futureNotificationCount = await dbService.count('notification_schedule', {
      where: findQuery1.where,
    });

    const user = await dbService.findOne('user', {
      where: {
        uuid: ctx.req.decoded.uuid || ctx.request.query.userId,
      },
    });
    console.log(user.email);

    const findQuery2 = {
      where: {
        [Op.and]: [
          {
            emails: { [Op.contains]: [user.email] },
          },
          {
            notification_type: { [Op.notIn]: ['email'] },
            // notification_type: { [Op.in]: ['both', 'in_app'] },
          },
        ],
      },
    };

    const findQuery3 = {
      where: {
        [Op.and]: [
          {
            status: 'done',
          },
        ],
      },
    };

    const notificationCount = await dbService.count('notification', {
      where: findQuery3.where,
      include: [
        {
          model: 'notification_schedule',
          where: findQuery2.where,
        },
      ],
    });
    return ctx.res.ok({
      result: {
        pastNotificationCount,
        futureNotificationCount,
        notificationCount,
      },
      msg: 'success',
    });
  },
};
