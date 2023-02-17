const commonService = require('../services/common-service');
const dbService = require('../services/db-service');
const { Sequelize } = require('../config/sequelize');
const queue = require('../services/queue');

const { Op } = Sequelize;
const responseMessages = require('../middleware/response-messages');
const config = require('../config/config');

const communityCircleUsersList = (ctx, relationshipArr = []) => {
  const { sortArr } = commonService.paginationSortFilters(ctx);
  const findQuery = {
    // offset,
    // limit,
    order: [sortArr],
    where: {
      status: 'accepted',
      [Op.and]: [
        {
          [Op.or]: [
            {
              fromId: ctx.request.query.userId || ctx.req.decoded.uuid,
            },
            {
              toId: ctx.request.query.userId || ctx.req.decoded.uuid,
            },
          ],
        },
        {
          [Op.or]: relationshipArr.map((relationName) => ({ relationship: relationName })),
        },
      ],
    },
    attributes: ['uuid', 'relationship', 'email', 'status', 'createdAt', 'fromId', 'toId', 'relationship'],
    include: [
      {
        model: 'user',
        as: 'connectFrom',
        required: false,
        attributes: ['firstName', 'lastName', 'email', 'nhsNumber', 'dob'],
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
          {
            model: 'user_profile',
            as: 'userProfile',
            required: false,
            attributes: ['profilePic'],
          },
        ],
      },
      {
        model: 'user',
        as: 'connectTo',
        required: false,
        attributes: ['firstName', 'lastName', 'email', 'nhsNumber', 'dob'],
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
          {
            model: 'user_profile',
            as: 'userProfile',
            required: false,
          },
        ],
      },
      {
        model: 'share',
        as: 'shareInfo',
        required: false,
      },
    ],
  };

  if (ctx.request.query.search) {
    findQuery.where[Op.and].push({
      [Op.or]: [
        Sequelize.where(
          Sequelize.fn('LOWER', Sequelize.col('connectFrom.email')),
          'LIKE',
          `%${(ctx.request.query.search || '').toLowerCase()}%`
        ),
        Sequelize.where(
          Sequelize.fn('LOWER', Sequelize.col('connectTo.email')),
          'LIKE',
          `%${(ctx.request.query.search || '').toLowerCase()}%`
        ),
        Sequelize.where(
          Sequelize.fn('LOWER', Sequelize.col('connectFrom.firstName')),
          'LIKE',
          `%${(ctx.request.query.search || '').toLowerCase()}%`
        ),
        Sequelize.where(
          Sequelize.fn('LOWER', Sequelize.col('connectTo.firstName')),
          'LIKE',
          `%${(ctx.request.query.search || '').toLowerCase()}%`
        ),
        Sequelize.where(
          Sequelize.fn('LOWER', Sequelize.col('connectFrom.lastName')),
          'LIKE',
          `%${(ctx.request.query.search || '').toLowerCase()}%`
        ),
        Sequelize.where(
          Sequelize.fn('LOWER', Sequelize.col('connectTo.lastName')),
          'LIKE',
          `%${(ctx.request.query.search || '').toLowerCase()}%`
        ),
      ],
    });
  }
  return findQuery;
};

module.exports = {
  checkUserAvailable: async (ctx) => {
    try {
      const findQuery = {
        email: ctx.request.body.email,
      };
      const user = await dbService.findOne('user', {
        where: findQuery,
        attributes: ['uuid'],
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
      });
      return ctx.res.ok({
        result: user,
      });
    } catch (error) {
      return ctx.res.internalServerError({ error });
    }
  },
  createUserInvite: async (ctx) => {
    try {
      if (ctx.req.decoded) {
        if (ctx.request.body.email === ctx.req.decoded.email) {
          return ctx.res.badRequest({
            msg: responseMessages[1010],
          });
        }
        if (ctx.req.decoded.role === config.roleNames.cl && ctx.request.body.relationship !== 'patient') {
          return ctx.res.badRequest({
            msg: responseMessages[1011],
          });
        }
        if (ctx.req.decoded.role === config.roleNames.p && ctx.request.body.relationship === 'patient') {
          return ctx.res.badRequest({
            msg: responseMessages[1012],
          });
        }
        if (ctx.req.decoded.role === config.roleNames.sa && ctx.request.body.relationship === 'patient') {
          return ctx.res.badRequest({
            msg: responseMessages[1187],
          });
        }
      }
      ctx.request.body.fromId = ctx.req.decoded?.uuid || ctx.request.body.fromId;
      console.log(ctx.request.body.fromId, 'ctx.request.body.fromId');
      ctx.request.body.inviteCode = commonService.generateRandomNumber();
      const circletoExist = await dbService.findOne('invite', {
        where: {
          fromId: ctx.request.body.fromId,
          email: ctx.request.body.email,
          [Op.or]: [
            {
              status: 'pending',
            },
            {
              status: 'accepted',
            },
          ],
        },
        attributes: ['id'],
      });
      if (circletoExist) {
        return ctx.res.badRequest({
          msg: responseMessages[1155],
        });
      }
      const user = await dbService.create('invite', ctx.request.body);
      return ctx.res.ok({
        result: { inviteCode: user.inviteCode, uuid: user.uuid },
      });
    } catch (error) {
      return ctx.res.internalServerError({ error });
    }
  },
  createCircle: async (ctx) => {
    try {
      if (ctx.req.decoded.role === "Super Admin"){
        return ctx.res.conflict({ msg: responseMessages[1018] });
      }
      if (ctx.request.body.email === ctx.req.decoded.email) {
        return ctx.res.badRequest({
          msg: responseMessages[1010],
        });
      }
      if (ctx.req.decoded.role === config.roleNames.cl && ctx.request.body.relationship !== 'patient') {
        return ctx.res.badRequest({
          msg: responseMessages[1011],
        });
      }
      if (ctx.req.decoded.role === config.roleNames.p && ctx.request.body.relationship === 'patient') {
        return ctx.res.badRequest({
          msg: responseMessages[1012],
        });
      }
      ctx.request.body.fromId = ctx.req.decoded.uuid;
      const circleExist = await dbService.findOne('circle', {
        where: {
          fromId: ctx.request.body.fromId,
          toId: ctx.request.body.toId,
          [Op.or]: [
            {
              status: 'pending',
            },
            {
              status: 'accepted',
            },
          ],
        },
        attributes: ['id'],
      });
      const circletoExist = await dbService.findOne('circle', {
        where: {
          fromId: ctx.request.body.toId,
          toId: ctx.request.body.fromId,
          [Op.or]: [
            {
              status: 'pending',
            },
            {
              status: 'accepted',
            },
          ],
        },
        attributes: ['id'],
      });
      const circleinviteExist = await dbService.findOne('invite', {
        where: {
          fromId: ctx.request.body.fromId,
          toId: ctx.request.body.toId,
          status: 'completed',
        },
        attributes: ['id'],
      });

      const circleinvitetoExist = await dbService.findOne('invite', {
        where: {
          fromId: ctx.request.body.toId,
          toId: ctx.request.body.fromId,
          status: 'completed',
        },
        attributes: ['id'],
      });
      // (circleinviteExist || circleinvitetoExist)? 1155 :
      if (circleExist || circletoExist || circleinviteExist || circleinvitetoExist) {
        return ctx.res.badRequest({
          msg: responseMessages[1003],
        });
      }
      const inviteCode = commonService.generateRandomNumber();
      const circlePayload = {
        firstName: ctx.request.body.firstName,
        lastName: ctx.request.body.lastName,
        email: ctx.request.body.email,
        relationship: ctx.request.body.relationship,
        fromId: ctx.request.body.fromId,
        toId: ctx.request.body.toId,
        inviteCode,
        status: 'pending',
      };
      const circleCreated = await dbService.create('circle', circlePayload);
      const sharePayload = {
        fromId: circlePayload.relationship === 'patient' ? circlePayload.toId : circlePayload.fromId,
        toId: circlePayload.relationship === 'patient' ? circlePayload.fromId : circlePayload.toId,
        circleId: circleCreated.uuid,
        modules: ctx.request.body.modules,
      };
      // find user
      const user = await dbService.findOne('user', {
        where: {
          uuid: circlePayload.fromId,
        },
        attributes: ['id', 'uuid', 'firstName', 'lastName', 'email'],
      });
      await dbService.create('share', sharePayload);
      let notify = {
        queueType: 'in-app',
        queueKeyName: config.queueChannel.notification,
        payload: {
          "user_id": ctx.req.decoded?.uuid,
          "subject":"Circle Connect",
          "message":"you have a new circle connect request from "+user?.firstName+" "+user?.lastName,
          "notification_type":"circle_action",
          "schedule_type":"direct",
          "send_to":[{
             "email": ctx.request.body.email,
             "firstName": ctx.request.body.firstName,
             "lastName": ctx.request.body.lastName
             }],
          "month":null,
          "week_day":null,
          "day":null,
          "time":new Date().toISOString(),
          "end_date":null
      },
      };
      console.log('\n notify...', notify);
      await queue.AddToQueue({
        ...notify,
        url: `${config.notificationUrl}/notification`,
      });
      
      return ctx.res.ok({ result: { inviteCode } });
    } catch (error) {
      console.log('\n circle create error...', error);
      return ctx.res.internalServerError({ error });
    }
  },
  listUserCircle: async (ctx) => {
    try {
      const requestUserId = ctx.req.decoded.uuid;
      let where = {};
      if(ctx.request?.query?.status){
        where = {
          status: ctx.request?.query?.status,
        }
      }
      const userCircles = await dbService.findAll('circle', {
        where: {
          [Op.or]: [
            {
              fromId: requestUserId,
            },
            {
              toId: requestUserId,
            },
          ],
          ...where
        },
        attributes: ['uuid', 'relationship', 'email', 'status', 'createdAt', 'fromId', 'toId'],
        include: [
          {
            model: 'user',
            as: 'connectFrom',
            required: false,
            attributes: ['uuid', 'firstName', 'lastName', 'email', 'createdAt'],
            where: {
              status: "Active"
            }
          },
          {
            model: 'user',
            as: 'connectTo',
            required: false,
            attributes: ['uuid', 'firstName', 'lastName', 'email', 'createdAt'],
            where: {
              status: "Active"
            }
          },
          {
            model: 'share',
            as: 'shareInfo',
            required: false,
            // attributes: ["firstName", "lastName", "email"]
          },
        ],
      });
      return ctx.res.ok({ result: userCircles });
    } catch (error) {
      return ctx.res.internalServerError({ error });
    }
  },
  listUserCircleForNotification: async (ctx) => {
    try {
      const requestUserId = ctx.req.decoded.uuid;
      const dateCheck = [];
      if (ctx.request.query.fromDate) {
        dateCheck.push({
          createdAt: {
            [Op.gte]: commonService.indiaTz(ctx.request.query.fromDate).startOf('day'),
          },
        });
        dateCheck.push({
          createdAt: {
            [Op.lte]: commonService.indiaTz(ctx.request.query.toDate).endOf('day'),
          },
        });
      }
      if (ctx.request.query.search) {
        dateCheck.push({
          email: {
            [Op.like]: `%${ctx.request.query?.search}%`,
          },
        });
      }

      const userCircles = await dbService.findAll('circle', {
        where: {
          [Op.or]: [
            {
              fromId: requestUserId,
            },
            {
              toId: requestUserId,
            },
          ],
        },
        attributes: ['uuid', 'relationship', 'email', 'status', 'createdAt', 'fromId', 'toId'],
        include: [
          {
            model: 'user',
            as: 'connectFrom',
            required: false,
            attributes: ['uuid', 'firstName', 'lastName', 'email', 'createdAt'],
          },
          {
            model: 'user',
            as: 'connectTo',
            required: false,
            attributes: ['uuid', 'firstName', 'lastName', 'email', 'createdAt'],
          },
          {
            model: 'share',
            as: 'shareInfo',
            required: false,
            // attributes: ["firstName", "lastName", "email"]
          },
        ],
      });
      const uids = [];
      userCircles.map((item) => {
        item.connectFrom.uuid == requestUserId ? uids.push(item.connectTo.uuid) : uids.push(item.connectFrom.uuid);
      });
      console.log(uids);
      const users = await dbService.findAll('user', {
        where: {
          [Op.and]: [
            {
              uuid: {
                [Op.in]: uids,
              },
              status: "Active"
            },
            ...dateCheck,
          ],
        },
        attributes: ['uuid', 'firstName', 'lastName', 'email', 'status', 'username', 'createdAt'],
      });
      return ctx.res.ok({ result: users });
    } catch (error) {
      return ctx.res.internalServerError({ error });
    }
  },
  getById: async (ctx) => {
    try {
      const circleData = await dbService.findOne('circle', {
        where: {
          uuid: ctx.request.query.uuid,
        },
        attributes: ['uuid', 'relationship', 'email', 'status', 'createdAt', 'fromId', 'toId'],
        include: [
          {
            model: 'user',
            as: 'connectFrom',
            required: false,
            attributes: ['firstName', 'lastName', 'email'],
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
              {
                model: 'user_profile',
                as: 'userProfile',
                required: false,
                attributes: ['profilePic'],
              },
            ],
          },
          {
            model: 'user',
            as: 'connectTo',
            required: false,
            attributes: ['firstName', 'lastName', 'email'],
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
              {
                model: 'user_profile',
                as: 'userProfile',
                required: false,
                attributes: ['profilePic'],
              },
            ],
          },
          {
            model: 'share',
            as: 'shareInfo',
            required: false,
          },
        ],
      });
      return ctx.res.ok({ result: circleData });
    } catch (error) {
      return ctx.res.internalServerError({ error });
    }
  },
  acceptCircleInvite: async (ctx) => {
    try {
      const requestUserId = ctx.req.decoded.uuid;
      const circleExist = await dbService.findOne('circle', {
        where: {
          uuid: ctx.request.body.circleId,
        },
        attributes: ['toId', 'fromId', 'status'],
      });
      if (!circleExist) {
        return ctx.res.badRequest({
          msg: responseMessages[1005],
        });
      }
      if (circleExist.toId !== requestUserId) {
        return ctx.res.badRequest({
          msg: responseMessages[1006],
        });
      }
      if (circleExist.status === 'accepted' || circleExist.status === 'rejected' || circleExist.status === 'canceled') {
        return ctx.res.badRequest({
          msg: responseMessages[1007],
        });
      }
      await dbService.update(
        'circle',
        { status: 'accepted' },
        { where: { uuid: ctx.request.body.circleId }, individualHooks: true }
      );
      //find user
      const user = await dbService.findOne('user', {
        where: {
          uuid: circleExist.fromId,
        },
        attributes: ['uuid', 'firstName', 'lastName', 'email'],
      });
      const currUser = await dbService.findOne('user', {
        where: {
          uuid: circleExist.toId,
        },
        attributes: ['uuid', 'firstName', 'lastName', 'email'],
      });
      let notify = {
        queueType: 'in-app',
        queueKeyName: config.queueChannel.notification,
        payload: {
          "user_id": ctx.req.decoded?.uuid,
          "subject":"Circle Connect Request Accepted",
          "message":currUser?.firstName+" "+currUser?.lastName+" has accepted your circle connect request",
          "notification_type":"circle_normal",
          "schedule_type":"direct",
          "send_to":[{
             "email": user.email,
             "firstName": user.firstName,
             "lastName": user.lastName
             }],
          "month":null,
          "week_day":null,
          "day":null,
          "time":new Date().toISOString(),
          "end_date":null
      },
      };
      console.log('\n notify...', notify);
      await queue.AddToQueue({
        ...notify,
        url: `${config.notificationUrl}/notification`,
      });
      return ctx.res.ok({
        msg: responseMessages[1008],
      });
    } catch (error) {
      return ctx.res.internalServerError({ error });
    }
  },
  rejectCircleInvite: async (ctx) => {
    try {
      const requestUserId = ctx.req.decoded.uuid;
      const circleExist = await dbService.findOne('circle', {
        where: {
          uuid: ctx.request.body.circleId,
        },
        attributes: ['toId', 'fromId', 'status'],
      });
      if (!circleExist) {
        return ctx.res.badRequest({
          msg: responseMessages[1005],
        });
      }
      if (circleExist.toId !== requestUserId) {
        return ctx.res.badRequest({
          msg: responseMessages[1006],
        });
      }
      if (circleExist.status === 'accepted' || circleExist.status === 'rejected' || circleExist.status === 'canceled') {
        return ctx.res.badRequest({
          msg: responseMessages[1007],
        });
      }
      await dbService.update(
        'circle',
        { status: 'rejected' },
        { where: { uuid: ctx.request.body.circleId }, individualHooks: true }
      );
      //find user
      const user = await dbService.findOne('user', {
        where: {
          uuid: circleExist.fromId,
        },
        attributes: ['uuid', 'firstName', 'lastName', 'email', 'status', 'username', 'createdAt'],
      });
      const currUser = await dbService.findOne('user', {
        where: {
          uuid: circleExist.toId,
        },
        attributes: ['uuid', 'firstName', 'lastName', 'email', 'status', 'username', 'createdAt'],
      });
      let notify = {
        queueType: 'in-app',
        queueKeyName: config.queueChannel.notification,
        payload: {
          "user_id": ctx.req.decoded?.uuid,
          "subject":"Circle Connect Request Rejected",
          "message":currUser?.firstName+" "+currUser?.lastName+" has reject your circle connect request",
          "notification_type":"circle_normal",
          "schedule_type":"direct",
          "send_to":[{
              "email": user.email,
              "firstName": user.firstName,
              "lastName": user.lastName
              }],
          "month":null,
          "week_day":null,
          "day":null,
          "time":new Date().toISOString(),
          "end_date":null
      },
      };
      console.log('\n notify...', notify);
      await queue.AddToQueue({
        ...notify,
        url: `${config.notificationUrl}/notification`,
      });
      return ctx.res.ok({
        msg: responseMessages[1008],
      });
    } catch (error) {
      return ctx.res.internalServerError({ error });
    }
  },
  cancelCircleInvite: async (ctx) => {
    try {
      const requestUserId = ctx.req.decoded.uuid;
      let tableName = '';
      let returnErrMsg = '';
      switch (ctx.request.body.type) {
        case 'circle':
          tableName = 'circle';
          returnErrMsg = responseMessages[1005];
          break;
        case 'invite':
          tableName = 'invite';
          returnErrMsg = responseMessages[1151];
          break;
        default:
          return ctx.res.badRequest({
            msg: responseMessages[1152],
          });
      }
      const circleExist = await dbService.findOne(tableName, {
        where: {
          uuid: ctx.request.body.circleId,
        },
        attributes: ['fromId', 'toId', 'status'],
      });
      if (!circleExist) {
        return ctx.res.badRequest({
          msg: returnErrMsg,
        });
      }
      if (circleExist.fromId !== requestUserId) {
        return ctx.res.badRequest({
          msg: responseMessages[1006],
        });
      }
      if (
        circleExist.status === 'accepted' ||
        circleExist.status === 'completed' ||
        circleExist.status === 'rejected' ||
        circleExist.status === 'canceled'
      ) {
        return ctx.res.badRequest({
          msg: responseMessages[1007],
        });
      }
      await dbService.update(
        tableName,
        { status: 'canceled' },
        { where: { uuid: ctx.request.body.circleId }, individualHooks: true }
      );
      return ctx.res.ok({
        msg: responseMessages[1008],
      });
    } catch (error) {
      console.log('\n cancelCircleInvite error...', error);
      return ctx.res.internalServerError({ error });
    }
  },
  getCommunityUsers: async (ctx) => {
    try {
      let findQuery = {};
      switch (Number(ctx.request.query.type)) {
        case 1:
          findQuery = communityCircleUsersList(ctx, ['carer']);
          break;
        case 2:
          findQuery = communityCircleUsersList(ctx, ['family']);
          break;
        case 3:
          findQuery = communityCircleUsersList(ctx, ['clinician', 'patient']);
          break;
        case 4:
          findQuery = communityCircleUsersList(ctx, ['clinician', 'patient']);
          break;
        case 5:
          findQuery = communityCircleUsersList(ctx, ['clinician', 'patient', 'carer', 'family']);
          break;
      }

      const { count, rows } = await dbService.findAndCountAll('circle', findQuery);

      if (!rows) {
        return ctx.res.notFound({ msg: 'List not found' });
      }

      return ctx.res.ok({ result: { count, result: rows } });
    } catch (error) {
      return ctx.res.internalServerError({ error });
    }
  },
  getRequestReceived: async (ctx) => {
    try {
      const requestUserId = ctx.req.decoded.uuid;
      const userCircles = await dbService.findAll('circle', {
        where: {
          toId: requestUserId,
          status: 'pending',
        },
        attributes: ['uuid', 'relationship', 'email', 'status', 'createdAt', 'fromId', 'toId'],
        include: [
          {
            model: 'user',
            as: 'connectFrom',
            required: false,
            attributes: ['firstName', 'lastName', 'email'],
            include: [
              {
                model: 'user_role',
                as: 'userRole',
                include: [
                  {
                    model: 'roles',
                    as: 'roleInfo',
                    attributes: ['name', 'uuid'],
                  },
                ],
              },
              {
                model: 'user_profile',
                as: 'userProfile',
                required: false,
                attributes: ['profilePic'],
              },
            ],
          },
        ],
      });
      return ctx.res.ok({
        result: userCircles,
      });
    } catch (error) {
      return ctx.res.internalServerError({ error });
    }
  },
  getRequestSent: async (ctx) => {
    try {
      const requestUserId = ctx.req.decoded.uuid;
      const userCirclesPromise = dbService.findAll('circle', {
        where: {
          fromId: requestUserId,
          status: 'pending',
        },
        attributes: ['uuid', 'relationship', 'email', 'status', 'createdAt', 'fromId', 'toId', 'firstName', 'lastName'],
        include: [
          {
            model: 'user',
            as: 'connectTo',
            required: false,
            attributes: ['uuid'],
            include: [
              {
                model: 'user_profile',
                as: 'userProfile',
                required: false,
                attributes: ['profilePic'],
              },
            ],
          },
        ],
      });
      const userInvitesPromise = dbService.findAll('invite', {
        where: {
          fromId: requestUserId,
          status: 'pending',
        },
        attributes: ['uuid', 'relationship', 'email', 'status', 'createdAt', 'fromId', 'toId', 'firstName', 'lastName'],
      });
      const userCirclesInvites = await Promise.all([userCirclesPromise, userInvitesPromise]).then((circleInvites) => {
        const circleUsers = circleInvites[0].map((circleData) => ({ ...circleData.toJSON(), type: 'circle' }));
        const invitedUsers = circleInvites[1].map((invitesData) => ({ ...invitesData.toJSON(), type: 'invite' }));
        return [...circleUsers, ...invitedUsers];
      });
      return ctx.res.ok({
        result: userCirclesInvites,
      });
    } catch (error) {
      console.log('\n getRequestSent error...', error);
      return ctx.res.internalServerError({ error });
    }
  },
  updateCircle: async (ctx) => {
    try {
      const circleData = await dbService.findOne('share', {
        where: { circleId: ctx.request.body.circleId, fromId: ctx.req.decoded.uuid },
      });
      if (!circleData) {
        return ctx.res.notFound({ msg: 'share not found' });
      }
      const updateResp = await dbService.update(
        'share',
        { modules: ctx.request.body.modules },
        { where: { circleId: ctx.request.body.circleId, fromId: ctx.req.decoded.uuid }, individualHooks: true },
        {}
      );
      ctx.res.ok({ msg: responseMessages[1058], result: updateResp[0] });
    } catch (error) {
      return ctx.res.internalServerError({ error });
    }
  },
  revokeCircleConnection: async (ctx) => {
    try {
      const requestUserId = ctx.req.decoded.uuid;
      const circle = await dbService.findOne('circle', {
        where: {
          [Op.or]: [
            {
              fromId: requestUserId,
            },
            {
              toId: requestUserId,
            },
          ],
          uuid: ctx.request.body.circleId,
          status: 'accepted',
        },
        attributes: ['id'],
      });
      if (!circle) {
        return ctx.res.badRequest({
          msg: responseMessages[1005],
        });
      }
      await dbService.update(
        'circle',
        { status: 'revoked', revokedBy: requestUserId },
        { where: { id: circle.id }, individualHooks: true }
      );
      return ctx.res.ok({
        msg: responseMessages[1009],
      });
    } catch (error) {
      return ctx.res.internalServerError({ error });
    }
  },
  getConnectedUserByUserId: async (ctx) => {
    try {
      const requestUserId = ctx.request.query.userId || ctx.req.decoded.uuid;
      const circleList = await dbService.findAll('circle', {
        where: {
          [Op.or]: [
            {
              fromId: requestUserId,
            },
            {
              toId: requestUserId,
            },
          ],
          status: 'accepted',
        },
        attributes: ['uuid', 'relationship', 'email', 'status', 'createdAt', 'fromId', 'toId', 'relationship'],
        include: [
          {
            model: 'user',
            as: 'connectFrom',
            required: false,
            attributes: ['firstName', 'lastName', 'email'],
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
          {
            model: 'user',
            as: 'connectTo',
            required: false,
            attributes: ['firstName', 'lastName', 'email'],
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
      });
      return ctx.res.ok({
        result: circleList,
      });
    } catch (error) {
      return ctx.res.internalServerError({ error });
    }
  },
  getCirclesFromIds: async (ctx) => {
    try {
      const orQuery = (ctx.request.body.fromToIds || []).map((circleData) => ({
        fromId: circleData.fromId,
        toId: circleData.toId,
      }));
      const circleList = await dbService.findAll('circle', { where: { [Op.or]: orQuery } });
      return ctx.res.ok({
        result: circleList,
      });
    } catch (error) {
      console.log('\n users deactivate error...', error);
      return ctx.res.internalServerError({ error });
    }
  },
};
