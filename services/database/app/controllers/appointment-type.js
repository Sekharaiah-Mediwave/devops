const dbService = require('../services/db-service');
const responseMessages = require('../middleware/response-messages');
const { Sequelize } = require('../config/sequelize');

const { Op } = Sequelize;

module.exports = {
  saveRecord: async (ctx) => {
    try {
      const savePayload = {
        name: ctx.request.body?.name,
        code: ctx.request.body?.code,
        description: ctx.request.body?.description,
        created_by: (ctx.req && ctx.req.decoded && ctx.req.decoded.uuid) || ctx.request.body?.userId,
      };

      const findResp = await dbService.findOne('appointment_type', {
        where: {
          // created_by: savePayload.created_by,
          [Op.or]: [
            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('appointment_type.name')), `${savePayload.name.toLowerCase()}`),
            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('appointment_type.code')), `${savePayload.code.toLowerCase()}`),
          ],
        },
      });

      if (findResp) {
        return ctx.res.conflict({ msg: responseMessages[1194] });
      }

      const saveResp = await dbService.create('appointment_type', savePayload, {});
      return ctx.res.ok({ result: saveResp });
    } catch (error) {
      console.log('\n type save error...', error);
      return ctx.res.internalServerError({ error });
    }
  },
  getById: async (ctx) => {
    try {
      const findQuery = {
        where: {
          uuid: ctx.request.query.uuid
        },
        include: [
          {
            model: 'user',
            as: 'createdUser',
            required: true,
            attributes: ['uuid', 'firstName', 'lastName', 'email'],
            include: [
              {
                model: 'user_role',
                as: 'userRole',
                required: true,
                include: [
                  {
                    model: 'roles',
                    as: 'roleInfo',
                    required: true,
                    attributes: ['name'],
                  },
                ]
              },
            ]
          },
          {
            model: 'user',
            as: 'updatedUser',
            required: false,
            attributes: ['uuid', 'firstName', 'lastName', 'email'],
            include: [
              {
                model: 'user_role',
                as: 'userRole',
                required: true,
                include: [
                  {
                    model: 'roles',
                    as: 'roleInfo',
                    required: true,
                    attributes: ['name'],
                  },
                ]
              },
            ]
          },
        ]
      };
      const findResp = await dbService.findOne('appointment_type', findQuery);

      if (!findResp) {
        return ctx.res.notFound({ msg: responseMessages[1195] });
      }

      return ctx.res.ok({ result: findResp });
    } catch (error) {
      console.log('\n type find error...', error);
      return ctx.res.internalServerError({ error });
    }
  },
  deleteById: async (ctx) => {
    try {
      const findResp = await dbService.findOne('appointment_type', {
        where: { uuid: ctx.request.query.uuid },
      });

      if (!findResp) {
        return ctx.res.notFound({ msg: responseMessages[1195] });
      }
      const deleteResp = await dbService.update('appointment_type', { status: 'Deleted' }, {
        where: {
          uuid: ctx.request.query.uuid,
        }
      });
      return ctx.res.ok({ result: deleteResp });
    } catch (error) {
      console.log('\n type delete error...', error);
      return ctx.res.internalServerError({ error });
    }
  },
  updateRecord: async (ctx) => {
    try {
      const findDiagnosis = await dbService.findOne('appointment_type', { where: { uuid: ctx.request.body.uuid } });
      if (!findDiagnosis) {
        return ctx.res.notFound({ msg: responseMessages[1195] });
      }

      const findRespEx = await dbService.findOne('appointment_type', {
        where: {
          uuid: { [Op.not]: ctx.request.body.uuid },
          [Op.or]: [
            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('appointment_type.name')), `${ctx.request.body.name.toLowerCase()}`),
            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('appointment_type.code')), `${ctx.request.body.code.toLowerCase()}`),
          ]
        },
      });

      if (findRespEx) {
        return ctx.res.conflict({ msg: responseMessages[1194] });
      }
      const updatePayload = {
        name: ctx.request.body.name,
        code: ctx.request.body.code,
        description: ctx.request.body.description,
      };

      const updateResp = await dbService.update('appointment_type', updatePayload, { where: { uuid: ctx.request.body.uuid }, individualHooks: true }, {});
      if (!updateResp) {
        return ctx.res.forbidden({ msg: responseMessages[1192] });
      }
      return ctx.res.ok({ result: updateResp });
    } catch (error) {
      console.log('\n group update error...', error);
      return ctx.res.internalServerError({ error });
    }
  },
  getList: async (ctx) => {
    try {
      const whereQuery = {};
      const andQuery = [];
      const orQuery = [];

      if (ctx.request.body.search) {
        orQuery.push(
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('appointment_type.name')), 'LIKE', `%${ctx.request.body.search.toLowerCase()}%`),
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('appointment_type.code')), 'LIKE', `%${ctx.request.body.search.toLowerCase()}%`),
        );
      }

      if (ctx.request.body.status && ctx.request.body.status.length) {
        whereQuery.status = {
          [Op.in]: ctx.request.body.status
        };
      }

      if (andQuery.length) {
        whereQuery[Op.and] = andQuery;
      }

      if (orQuery.length) {
        whereQuery[Op.or] = orQuery;
      }

      const findQuery = {
        where: whereQuery,
        offset: ctx.request.body.offset,
        limit: ctx.request.body.limit,
        order: [ctx.request.body.order],
        include: [
          {
            model: 'user',
            as: 'createdUser',
            required: true,
            attributes: ['uuid', 'firstName', 'lastName'],
            include: [
              {
                model: 'user_role',
                as: 'userRole',
                required: true,
                include: [
                  {
                    model: 'roles',
                    as: 'roleInfo',
                    required: true,
                    attributes: ['name'],
                  },
                ]
              },
            ]
          },
          {
            model: 'user',
            as: 'updatedUser',
            required: false,
            attributes: ['uuid', 'firstName', 'lastName'],
            include: [
              {
                model: 'user_role',
                as: 'userRole',
                required: true,
                include: [
                  {
                    model: 'roles',
                    as: 'roleInfo',
                    required: true,
                    attributes: ['name'],
                  },
                ]
              },
            ]
          },

        ]
      };

      const { count, rows } = await dbService.findAndCountAll('appointment_type', findQuery);
      return ctx.res.ok({ result: { count, rows } });
    } catch (error) {
      console.log('\n type find error...', error);
      return ctx.res.internalServerError({ error });
    }
  },
  getAllTypes: async (ctx) => {
    try {
      const findResp = await dbService.findAll('appointment_type', { order: [['name', 'ASC']] });
      return ctx.res.ok({ result: findResp });
    } catch (error) {
      console.log('\n getAllDurations error...', error);
      return ctx.res.internalServerError({ error });
    }
  },
};
