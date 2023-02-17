const commonService = require('../services/common-service');
const dbService = require('../services/db-service');
const { uuidv4, moment } = require('../services/imports');
const responseMessages = require('../middleware/response-messages');
const { Sequelize } = require('../config/sequelize');
const config = require('../config/config');

const { Op } = Sequelize;

module.exports = {
  saveRecord: async (ctx) => {
    try {
      const savePayload = {
        name: ctx.request.body?.name,
        description: ctx.request.body?.description,
        duration_id: ctx.request.body?.duration,
        start_time: ctx.request.body?.start_time,
        end_time: ctx.request.body?.end_time,
        created_by: (ctx.req && ctx.req.decoded && ctx.req.decoded.uuid) || ctx.request.body?.userId,
        status: (ctx.req.decoded.role == config.roleNames.cl) ? 'approval_waiting' : (ctx.request.body.status || 'active'),
      };

      const findResp = await dbService.findOne('diagnosis_type', {
        where: {
          // created_by: savePayload.created_by,
          [Op.and]: [
            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('diagnosis_type.name')), `${savePayload.name.toLowerCase()}`),
          ]
        },
      });

      if (findResp) {
        return ctx.res.conflict({ msg: responseMessages[1190] });
      }

      const saveResp = await dbService.create('diagnosis_type', savePayload, {});
      if (ctx.request.body?.clinicians && ctx.request.body?.clinicians.length > 0) {
        const clinicians = ctx.request.body?.clinicians?.map((item) => ({
          uuid: uuidv4(),
          userId: item,
          diagnosis_type_id: saveResp.uuid,
        }));
        await dbService.bulkCreate('assign_diagnosis_type', clinicians);
      }
      return ctx.res.ok({ result: saveResp });
    } catch (error) {
      console.log('\n group save error...', error);
      return ctx.res.internalServerError({ error });
    }
  },
  getById: async (ctx) => {
    try {
      const findQuery = {
        where: {
          uuid: ctx.request.params.uuid
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
            model: 'clinic_slot_durations',
            as: 'slotDuration',
            required: true,
          },
          {
            model: 'user',
            as: 'approvedUser',
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
          {
            model: 'assign_diagnosis_type',
            as: 'Clinicians',
            required: false,
            include: [
              {
                model: 'user',
                as: 'userInfo',
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
            ]
          },
        ]
      };
      const findResp = await dbService.findOne('diagnosis_type', findQuery);

      if (!findResp) {
        return ctx.res.notFound({ msg: responseMessages[1191] });
      }

      return ctx.res.ok({ result: findResp });
    } catch (error) {
      console.log('\n group find error...', error);
      return ctx.res.internalServerError({ error });
    }
  },
  deleteById: async (ctx) => {
    try {
      const findResp = await dbService.findOne('diagnosis_type', {
        where: { uuid: ctx.request.params.uuid },
      });

      if (!findResp) {
        return ctx.res.notFound({ msg: responseMessages[1191] });
      }
      const deleteResp = await dbService.update('diagnosis_type', { status: 'Deleted' }, {
        where: {
          uuid: ctx.request.params.uuid,
        }
      });
      return ctx.res.ok({ result: deleteResp });
    } catch (error) {
      console.log('\n group find error...', error);
      return ctx.res.internalServerError({ error });
    }
  },
  updateRecord: async (ctx) => {
    try {
      const findDiagnosis = await dbService.findOne('diagnosis_type', { where: { uuid: ctx.request.body.uuid } });
      if (!findDiagnosis) {
        return ctx.res.notFound({ msg: responseMessages[1191] });
      }

      const findRespEx = await dbService.findOne('diagnosis_type', {
        where: {
          uuid: { [Op.not]: ctx.request.body.uuid },
          [Op.and]: [
            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('diagnosis_type.name')), `${ctx.request.body.name.toLowerCase()}`),
          ]
        },
      });

      if (findRespEx) {
        return ctx.res.conflict({ msg: responseMessages[1190] });
      }
      const updatePayload = {
        name: ctx.request.body.name,
        description: ctx.request.body.description,
        duration_id: ctx.request.body.duration,
        start_time: ctx.request.body.start_time,
        end_time: ctx.request.body.end_time,
        status: ctx.request.body.status,
      };

      const updateResp = await dbService.update('diagnosis_type', updatePayload, { where: { uuid: ctx.request.body.uuid }, individualHooks: true }, {});
      if (!updateResp) {
        return ctx.res.forbidden({ msg: responseMessages[1192] });
      }
      const existingAssignedUsers = await dbService.findAll('assign_diagnosis_type', {
        where: {
          diagnosis_type_id: ctx.request.body.uuid,
        },
      });
      const removeClinicians = existingAssignedUsers
        .filter((el) => !ctx.request.body.clinicians.some((f) => f == el.userId))
        .map((teamName) => teamName.uuid);

      const newClinicians = ctx.request.body.clinicians
        .filter((el) => !existingAssignedUsers.some((f) => f.userId == el))
        .map((teamName) => teamName);

      const clinicians = newClinicians.map((item) => ({
        uuid: uuidv4(),
        userId: item,
        diagnosis_type_id: ctx.request.body.uuid,
      }));
      await dbService.bulkCreate('assign_diagnosis_type', clinicians);
      await dbService.destroy('assign_diagnosis_type', {
        where: {
          uuid: {
            [Op.in]: removeClinicians
          },
          diagnosis_type_id: ctx.request.body.uuid
        }
      });
      return ctx.res.ok({ result: updateResp });
    } catch (error) {
      console.log('\n group update error...', error);
      return ctx.res.internalServerError({ error });
    }
  },
  approveRequest: async (ctx) => {
    try {
      const findDiagnosis = await dbService.findOne('diagnosis_type', { where: { uuid: ctx.request.body.uuid, status: { [Op.in]: ['approval_waiting', 'approval_rejected'] } } });
      if (!findDiagnosis) {
        return ctx.res.notFound({ msg: responseMessages[1191] });
      }

      const updatePayload = {
        approved_by: ctx.req.decoded.uuid,
        approved_date: new Date(),
        status: (ctx.request.body.status == 'accepted') ? 'active' : 'approval_rejected',
      };

      const updateResp = await dbService.update('diagnosis_type', updatePayload, { where: { uuid: ctx.request.body.uuid }, individualHooks: true }, {});
      if (!updateResp) {
        return ctx.res.forbidden({ msg: responseMessages[1192] });
      }
      return ctx.res.ok({ result: updateResp });
    } catch (error) {
      console.log('\n diagnosis type approveRequest error...', error);
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
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('diagnosis_type.name')), 'LIKE', `%${ctx.request.body.search.toLowerCase()}%`),
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('createdUser.firstName')), 'LIKE', `%${ctx.request.body.search.toLowerCase()}%`),
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('createdUser.lastName')), 'LIKE', `%${ctx.request.body.search.toLowerCase()}%`),
        );
      }

      if (ctx.request.body.duration) {
        whereQuery.duration_id = ctx.request.body.duration;
      }

      if (ctx.request.body.approved_by) {
        whereQuery.approved_by = ctx.request.body.approved_by;
      }

      if (ctx.request.body.author) {
        whereQuery.created_by = ctx.request.body.author;
      }

      if (ctx.request.body.status && ctx.request.body.status.length) {
        whereQuery.status = {
          [Op.in]: ctx.request.body.status
        };
      }

      if (ctx.request.body.createdFromDate && ctx.request.body.createdToDate) {
        andQuery.push(
          Sequelize.where(Sequelize.fn('date', Sequelize.col('diagnosis_type.createdAt')), '>=', moment(ctx.request.body.createdFromDate).format('YYYY-MM-DD')),
          Sequelize.where(Sequelize.fn('date', Sequelize.col('diagnosis_type.createdAt')), '<=', moment(ctx.request.body.createdToDate).format('YYYY-MM-DD'))
        );
      }

      if (ctx.request.body.approvedFromDate && ctx.request.body.approvedToDate) {
        andQuery.push(
          Sequelize.where(Sequelize.fn('date', Sequelize.col('diagnosis_type.approved_date')), '>=', moment(ctx.request.body.approvedFromDate).format('YYYY-MM-DD')),
          Sequelize.where(Sequelize.fn('date', Sequelize.col('diagnosis_type.approved_date')), '<=', moment(ctx.request.body.approvedToDate).format('YYYY-MM-DD'))
        );
      }

      if (ctx.req.decoded.role == config.roleNames.cl) {
        whereQuery.created_by = ctx.req.decoded.uuid;
      }

      const adminRoles = [config.roleNames.sa, config.roleNames.a];
      if (adminRoles.includes(ctx.req.decoded.role)) {
        // orQuery.push(
        //   {
        //     created_by: ctx.req.decoded.uuid
        //   },
        //   Sequelize.where(Sequelize.col('diagnosis_type.status'), 'approval_waiting'),
        // );
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
            model: 'clinic_slot_durations',
            as: 'slotDuration',
            required: false,
          },
          {
            model: 'user',
            as: 'approvedUser',
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
          // {
          //   model: 'assign_diagnosis_type',
          //   as: 'Clinicians',
          //   required: false,
          //   include: [
          //     {
          //       model: 'user',
          //       as: 'userInfo',
          //       required: true,
          //       attributes: ['uuid', 'firstName', 'lastName']
          //     },
          //   ]
          // },
        ]
      };

      const { count, rows } = await dbService.findAndCountAll('diagnosis_type', findQuery);
      return ctx.res.ok({ result: { count, rows } });
    } catch (error) {
      console.log('\n group find error...', error);
      return ctx.res.internalServerError({ error });
    }
  },
  getAllActiveList: async (ctx) => {
    try {
      const findQuery = {
        where: { status: 'active' },
        order: [['name', 'ASC']],
      };

      const { count, rows } = await dbService.findAndCountAll('diagnosis_type', findQuery);
      return ctx.res.ok({ result: { count, rows } });
    } catch (error) {
      console.log('\n getAllActiveList error...', error);
      return ctx.res.internalServerError({ error });
    }
  },
  getAllDurations: async (ctx) => {
    try {
      const findResp = await dbService.findAll('clinic_slot_durations', { order: [['duration', 'ASC']], });
      return ctx.res.ok({ result: findResp });
    } catch (error) {
      console.log('\n getAllDurations error...', error);
      return ctx.res.internalServerError({ error });
    }
  },
  getListByClinician: async (ctx) => {
    try {
      const { sortArr, offset, limit } = commonService.paginationSortFilters(ctx);
      // find all diagnosis_type id
      let diagnosisType = await dbService.findAll('assign_diagnosis_type', {
        where: {
          userId: (ctx.req && ctx.req.decoded && ctx.req.decoded.uuid) || ctx.request.query.userId,
        },
        attributes: ['diagnosis_type_id'],
      });
      diagnosisType = diagnosisType.map((item) => item.diagnosis_type_id);
      console.log(diagnosisType);
      let where = {
        uuid: {
          [Op.in]: diagnosisType,
        },
      };
      if (ctx.request.query.search) {
        where = {
          ...where,
          [Op.or]: [
            Sequelize.where(
              Sequelize.fn('LOWER', Sequelize.col('diagnosis_type.name')),
              'LIKE',
              `%${(ctx.request.query.search || '').toLowerCase()}%`
            ),
          ],
        };
      }
      if (ctx.request.query.status) {
        where = {
          ...where,
          status: ctx.request.query.status,
        };
      }
      const findQuery = {
        where,
        order: [sortArr],
        offset,
        limit,
        distinct: true,
      };

      const findResp = await dbService.findAll('diagnosis_type', findQuery);
      ctx.res.ok({ result: findResp });
      return;
    } catch (error) {
      console.log('\n group--- find error...', error);
      ctx.res.internalServerError({ error });
    }
  },
};
