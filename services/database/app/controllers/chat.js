const commonService = require('../services/common-service');
const dbService = require('../services/db-service');
const { uuidv4 } = require('../services/imports');
const { Sequelize } = require('../config/sequelize');

const { Op } = Sequelize;
const responseMessages = require('../middleware/response-messages');
const config = require('../config/config');

module.exports = {
  getRooms: async (ctx) => {
    try {
      const { offset, limit, sortArr } = commonService.paginationSortFilters(ctx);
      const { roomType } = ctx.request.body;
      const filter = {};
      let filterRole = {};
      if (ctx.request.body?.roleType) {
        filterRole = { name: ctx.request.body?.roleType };
      }
      if (roomType) {
        filter.room_type = roomType;
      }
      console.log(ctx.request.body, filterRole);
      const getRoom = await dbService.findAll('chat_room', {
        include: [
          {
            model: 'chat_room_participants',
            where: {
              userId: ctx.request.body.userId,
            },
          },
        ],
        where: filter,
      });
      // distinct roomIds
      let rooms = getRoom.map((room) => room.uuid);
      if (rooms.length == 0) {
        return ctx.res.ok({ result: [] });
      }
      if (filterRole?.name) {
        console.log(filterRole, 'filterRole.length');

        const chatRoom1 = await dbService.findAll('chat_room', {
          where: {
            uuid: { [Op.in]: rooms },
            '$chat_room_participants.user.userRole.roleInfo.name$': filterRole.name,
            '$chat_room_participants.userId$': { [Op.ne]: ctx.request.body.userId },
          },
          include: [
            {
              model: 'chat_room_participants',
              include: [
                {
                  model: 'user',
                  attributes: ['uuid', 'firstName', 'lastName', 'email'],
                  include: [
                    {
                      model: 'user_role',
                      as: 'userRole',
                      include: [
                        {
                          model: 'roles',
                          as: 'roleInfo',
                          where: filterRole,
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        });
        rooms = chatRoom1.map((room) => room.uuid);
        if (rooms.length == 0) {
          return ctx.res.ok({ result: [] });
        }
      }
      let chatRoom = await dbService.findAll('chat_room', {
        where: {
          uuid: { [Op.in]: rooms },
        },
        include: [
          {
            model: 'chat_room_participants',
            include: [
              {
                model: 'user',
                attributes: ['uuid', 'firstName', 'lastName', 'email'],
                // include: [
                //   {
                //     model: 'user_role', as: 'userRole',
                //     include: [{
                //       model: 'roles', as: 'roleInfo',
                //     }],
                //   },
                // ]
              },
            ],
          },
          {
            model: 'chat_room_messages',
            as: 'lastMessage',
            order: [['createdAt', 'DESC']],
            limit: 1,
          },
          {
            model: 'chat_room_messages',
            as: 'messageCount',
            where: {
              author: { [Op.ne]: ctx.request.body.userId },
              seen: false,
            },
            required: false,
          },
        ],

        // order: [['chat_room_messages','createdAt', "DESC"]],
      });
      const count = chatRoom.length;
      chatRoom = JSON.parse(JSON.stringify(chatRoom));
      chatRoom.sort((a, b) => (a?.lastMessage[0]?.createdAt < b?.lastMessage[0]?.createdAt ? 1 : -1));
      chatRoom = chatRoom.map((room) => {
        room.messageCount = room.messageCount.length;
        return room;
      });
      console.log(chatRoom[0].messageCount, 'room.messageCount.length');
      console.log(chatRoom, '-');
      // add paging on chatRoom
      chatRoom = chatRoom.slice(offset, offset + limit);
      return ctx.res.ok({ result: chatRoom, count });
    } catch (error) {
      return ctx.res.internalServerError({ error });
    }
  },
  createRoom: async (ctx) => {
    try {
      let room = null;
      console.log(ctx.request.body);

      const getRoom = await dbService.findAll('chat_room', {
        include: [
          {
            model: 'chat_room_participants',
            where: {
              userId: ctx.request.body.senderId,
            },
          },
        ],
      });
      // distinct roomIds
      const rooms = getRoom.map((room) => room.uuid);
      if (rooms.length > 0) {
        const chatRoom = await dbService.findAll('chat_room', {
          where: {
            uuid: { [Op.in]: rooms },
            '$chat_room_participants.userId$': ctx.request.body.receiverId,
          },
          include: [
            {
              model: 'chat_room_participants',
            },
          ],
        });
        if (chatRoom.length > 0) {
          room = chatRoom[0].uuid;
        }
      }
      if (!room) {
        const createRoom = await dbService.create('chat_room', {
          uuid: uuidv4(),
          room_type: ctx.request.body.roomType,
          careTeamName: '',
          created_by: ctx.request.body.senderId,
        });
        const savePayload = [
          {
            uuid: uuidv4(),
            room: createRoom.uuid,
            userId: ctx.request.body.senderId,
          },
          {
            id: 0,
            uuid: uuidv4(),
            room: createRoom.uuid,
            userId: ctx.request.body.receiverId,
          },
        ];
        const createRoomParticipant = await dbService.bulkCreate('chat_room_participants', savePayload);
        room = createRoom.uuid;
      }
      const chatRoom = await dbService.findOne('chat_room', {
        where: {
          uuid: room,
        },
        include: [
          {
            model: 'chat_room_participants',
            include: [
              {
                model: 'user',
                attributes: ['uuid', 'firstName', 'lastName', 'email'],
              },
            ],
          },
        ],
      });
      return ctx.res.ok({ result: chatRoom });
    } catch (error) {
      return ctx.res.internalServerError({ error });
    }
  },
  addMessage: async (ctx) => {
    try {
      if (
        ctx.request.body?.message == null ||
        ctx.request.body?.message == '' ||
        ctx.request.body?.subject == null ||
        ctx.request.body?.subject == '' ||
        ctx.request.body?.room == null ||
        ctx.request.body?.room == '' ||
        ctx.request.body?.userId == null ||
        ctx.request.body?.userId == ''
      ) {
        return ctx.res.badRequest({ message: responseMessages[1056] });
      }
      console.log(ctx.request.body);
      const message = await dbService.create('chat_room_messages', {
        uuid: uuidv4(),
        room: ctx.request.body.room,
        message: ctx.request.body.message,
        subject: ctx.request.body.subject,
        author: ctx.request.body.userId,
        attachments: ctx.request.body.attachments ? ctx.request.body.attachments : null,
        reply_to: ctx.request.body.reply_to ? ctx.request.body.reply_to : null,
      });
      return ctx.res.ok({ result: message });
    } catch (error) {
      return ctx.res.internalServerError({ error });
    }
  },
  addImportantMessage: async (ctx) => {
    try {
      if (
        ctx.request.body?.room == null ||
        ctx.request.body?.room == '' ||
        ctx.request.body?.userId == null ||
        ctx.request.body?.userId == ''
      ) {
        return ctx.res.badRequest({ message: responseMessages[1056] });
      }
      console.log(ctx.request.body);
      if (ctx.request.body?.action == 'add') {
        const getMessage = await dbService.findOne('important_message', {
          where: {
            room: ctx.request.body?.room,
            messageId: ctx.request.body?.messageId ,
            userId: ctx.request.body?.userId,
          },
        });
        if (!getMessage) {
          await dbService.create('important_message', {
            room: ctx.request.body?.room,
            messageId: ctx.request.body?.messageId,
            userId: ctx.request.body?.userId,
          });
        }
      } else {
        await dbService.destroy('important_message', {
          where: {
            room: ctx.request.body?.room,
            messageId: ctx.request.body?.messageId,
            userId: ctx.request.body?.userId,
          },
        });
      }

      return ctx.res.ok({
        result: null,
        msg: 'success',
      });
    } catch (error) {
      return ctx.res.internalServerError({ error });
    }
  },
  getImportantMessage: async (ctx) => {
    try {
      if (ctx.request.query?.userId == null || ctx.request.query?.userId == '') {
        return ctx.res.badRequest({ message: responseMessages[1056] });
      }
      let where = {
        userId: ctx.request.query?.userId,
      };
      if (ctx.request.query?.type == "room") {
        where = {
          userId: ctx.request.query?.userId,
          messageId: null,
        };
      }else if (ctx.request.query?.type == "message"){
        where = {
          userId: ctx.request.query?.userId,
          messageId: {
            [Op.ne]: null,
          },
        };
      }
      console.log(ctx.request.query.userId);
      const getMessage = await dbService.findAndCountAll('important_message', {
        where: where,
        distinct: true,
        include: [
          {
            model: 'chat_room',
            include: [
              {
                model: 'chat_room_participants',
                include: [
                  {
                    model: 'user',
                    attributes: ['uuid', 'firstName', 'lastName', 'email'],
                  },
                ],
              },
            ],
          },
          {
            model: 'chat_room_messages',
            as: 'importantMessage',
          },
        ],
      });

      return ctx.res.ok({
        result: getMessage,
        msg: 'success',
      });
    } catch (error) {
      return ctx.res.internalServerError({ error });
    }
  },
  messageHistory: async (ctx) => {
    try {
      const { offset, limit, sortArr } = commonService.paginationSortFilters(ctx);

      if (ctx.request.body?.room == null || ctx.request.body?.room == '') {
        return ctx.res.badRequest({ message: responseMessages[1156] });
      }

      const readMessage = await dbService.update(
        'chat_room_messages',
        {
          seen: true,
        },
        {
          where: {
            author: { [Op.ne]: ctx.request.body?.userId },
            room: ctx.request.body?.room,
          },
        }
      );
      console.log(ctx.request.body);
      let { count, rows } = await dbService.findAndCountAll('chat_room_messages', {
        where: {
          room: ctx.request.body?.room,
        },
        offset,
        limit,
        order: [sortArr],
        include: [
          {
            model: 'chat_room_messages',
            as: 'replyMessage',
          },
          {
            model: 'user',
          },
        ],
      });

      const getMessage = await dbService.findAll('important_message', {
        where: {
          userId: ctx.request.body?.userId,
        },
      });
      const mids = getMessage.map((item) => item.messageId.toString());
      console.log(typeof mids[0], 'mids', ctx.request.body?.userId);
      rows = JSON.parse(JSON.stringify(rows));
      rows.map((item) => {
        if (mids.indexOf(item.uuid) != -1) {
          item.isImportant = true;
        } else {
          item.isImportant = false;
        }
      });
      // console.log(count, rows, "---");
      return ctx.res.ok({ result: rows.reverse(), count });
    } catch (error) {
      return ctx.res.internalServerError({ error });
    }
  },
  searchMessage: async (ctx) => {
    try {
      const { offset, limit, sortArr } = commonService.paginationSortFilters(ctx);

      console.log(ctx.request.query);
      const getRoom = await dbService.findAll('chat_room', {
        include: [
          {
            model: 'chat_room_participants',
            where: {
              userId: ctx.request.query.userId,
            },
          },
        ],
      });
      const rooms = getRoom.map((room) => room.uuid);
      if (rooms.length == 0) {
        return ctx.res.ok({ result: [] });
      }
      console.log('getRoom', rooms);
      const messages = await dbService.findAndCountAll('chat_room_messages', {
        where: {
          room: { [Op.in]: rooms },
          message: { [Op.regexp]: `${ctx.request.query.search}` },
        },
        offset,
        limit,
        order: [sortArr],
        include: [
          {
            model: 'chat_room',
            include: [
              {
                model: 'chat_room_participants',
                include: [
                  {
                    model: 'user',
                    attributes: ['uuid', 'firstName', 'lastName', 'email'],
                  },
                ],
              },
            ],
          },
        ],
      });
      // console.log(count, rows, "---");
      return ctx.res.ok({ result: messages });
    } catch (error) {
      return ctx.res.internalServerError({ error });
    }
  },
  deleteMessage: async (ctx) => {
    try {
      console.log(ctx.request.query);
      if (
        ctx.request.query?.messageId == null ||
        ctx.request.query?.messageId == '' ||
        ctx.req.decoded?.uuid == null ||
        ctx.req.decoded?.uuid == ''
      ) {
        return ctx.res.badRequest({ message: responseMessages[1056] });
      }
      console.log(ctx.request.query);
        const getMessage = await dbService.findOne('chat_room_messages', {
          where: {
            uuid: ctx.request.query?.messageId,
            author: ctx.req.decoded?.uuid,
          },
        });
        console.log(getMessage, 'getMessage');
        if (getMessage) {          
          await dbService.destroy('chat_room_messages', {
            where: {
              uuid: ctx.request.query?.messageId,
              author: ctx.req.decoded?.uuid,
            },
          });
        }else{
          return ctx.res.badRequest({ message: responseMessages[1185] });
        }

      return ctx.res.ok({
        result: null,
        msg: 'success',
      });
    } catch (error) {
      return ctx.res.internalServerError({ error });
    }
  },
  deleteRoom: async (ctx) => {
    try {
      if (
        ctx.request.query?.room == null ||
        ctx.request.query?.room == '' ||
        ctx.req.decoded?.uuid == null ||
        ctx.req.decoded?.uuid == ''
      ) {
        return ctx.res.badRequest({ message: responseMessages[1056] });
      }
      console.log(ctx.request.query);
        const getRoom = await dbService.findOne('chat_room_participants', {
          where: {
            room: ctx.request.query?.room,
            userId: ctx.req.decoded?.uuid,
          },
        });
        if (getRoom) {          
          await dbService.destroy('chat_room', {
            where: {
              uuid: ctx.request.query?.room,
            },
          });
        }else{
          return ctx.res.badRequest({ message: responseMessages[1186] });
        }

      return ctx.res.ok({
        result: null,
        msg: 'success',
      });
    } catch (error) {
      return ctx.res.internalServerError({ error });
    }
  },
};
