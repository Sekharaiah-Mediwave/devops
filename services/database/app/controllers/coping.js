const dbService = require('../services/db-service');
const { uuidv4, _ } = require('../services/imports');
const { Sequelize } = require('../config/sequelize');
const responseMessages = require('../middleware/response-messages');

const { Op } = Sequelize;

module.exports = {
  async createCoping(ctx) {
    try {
      const savePayload = {
        uuid: uuidv4(),
        userId: ctx.request.body.userId || ctx.req.decoded.uuid,
        title: ctx.request.body.title,
        description: ctx.request.body.description,
        achieved: ctx.request.body.achieved,
        // archived: ctx.request.body.archived,
      };

      const saveResp = await dbService.create('coping', savePayload, {});

      if (!saveResp) {
        ctx.res.forbidden({ msg: responseMessages[1059] });
        return;
      }

      ctx.res.ok({ result: saveResp });
      return;
    } catch (error) {
      console.log('\n coping save error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  getCopingRecordByUuid: async (ctx) => {
    try {
      const findQuery = {
        where: { uuid: ctx.request.params.uuid, status: 'Active' },
      };

      if (ctx.request.query.uuid) {
        findQuery.where[Op.and].push({ uuid: ctx.request.query.uuid });
      }

      if (ctx.request.query.status) {
        findQuery.where[Op.and].push({ status: ctx.request.query.status });
      }

      const count = await dbService.findOne('coping', findQuery);

      if (!count) {
        ctx.res.notFound({ msg: responseMessages[1060] });
        return;
      }

      ctx.res.ok({ result: count });
      return;
    } catch (error) {
      console.log('\n coping find list error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  async getAllCopingRecord(ctx) {
    try {
      const findQuery = {
        order: [['createdAt', 'DESC']],
        where: {
          [Op.and]: [
            {
              userId: ctx.request.query.userId || ctx.req.decoded.uuid,
            },
            {
              status: 'Active',
            },
            {
              archived: false,
            },
          ],
        },
      };

      if (ctx.request.query.uuid) {
        findQuery.where[Op.and].push({ uuid: ctx.request.query.uuid });
      }

      if (ctx.request.query.status) {
        findQuery.where[Op.and].push({ status: ctx.request.query.status });
      }

      const { count, rows } = await dbService.findAndCountAll('coping', findQuery);

      if (!rows) {
        ctx.res.notFound({ msg: responseMessages[1060] });
        return;
      }

      ctx.res.ok({ result: rows, count });
      return;
    } catch (error) {
      console.log('\n coping find list error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  async getAllArchivedCoping(ctx) {
    try {
      const findQuery = {
        order: [['createdAt', 'DESC']],
        where: {
          [Op.and]: [
            {
              userId: ctx.request.query.userId || ctx.req.decoded.uuid,
            },
            {
              status: 'Active',
            },
            {
              archived: true,
            },
          ],
        },
      };

      if (ctx.request.query.uuid) {
        findQuery.where[Op.and].push({ uuid: ctx.request.query.uuid });
      }

      if (ctx.request.query.status) {
        findQuery.where[Op.and].push({ status: ctx.request.query.status });
      }

      const { count, rows } = await dbService.findAndCountAll('coping', findQuery);

      if (!rows) {
        ctx.res.notFound({ msg: responseMessages[1060] });
        return;
      }

      ctx.res.ok({ result: rows, count });
      return;
    } catch (error) {
      console.log('\n coping find list error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  async updateCopingRecord(ctx) {
    try {
      const updatePayload = {
        userId: ctx.request.body.userId || ctx.req.decoded.uuid,
        title: ctx.request.body.title,
        description: ctx.request.body.description,
        achieved: ctx.request.body.achieved,
      };

      const updateResp = await dbService.update('coping', updatePayload, {
        where: { uuid: ctx.request.body.uuid },
        individualHooks: true,
      });

      if (!updateResp) {
        ctx.res.forbidden({ msg: responseMessages[1061] });
        return;
      }

      ctx.res.ok({ result: updateResp });
      return;
    } catch (error) {
      console.log('\n coping update error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  async toggleArchived(ctx) {
    try {
      const updatePayload = {
        archived: ctx.request.body.archived == true,
      };
      const updateResp = await dbService.update('coping', updatePayload, {
        where: { uuid: ctx.request.body.uuids },
        individualHooks: true,
      });

      if (!updateResp) {
        ctx.res.forbidden({ msg: responseMessages[1061] });
        return;
      }

      ctx.res.ok({ result: updateResp });
      return;
    } catch (error) {
      console.log('\n coping update error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  async deleteCoping(ctx) {
    try {
      const updatePayload = {
        status: 'Inactive',
      };

      const updateResp = await dbService.update('coping', updatePayload, {
        where: { uuid: ctx.request.query.uuid },
      });

      if (!updateResp) {
        ctx.res.forbidden({ msg: responseMessages[1062] });
        return;
      }

      ctx.res.ok({ result: updateResp });
      return;
    } catch (error) {
      console.log('\n Coping delete error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  getFhirUnsavedList: async (ctx) => {
    try {
      const findQuery = {
        where: {
          fhirSynced: false,
        },
        include: [
          {
            model: 'user',
            as: 'userInfo',
            attributes: ['id', 'fhirId'],
          },
        ],
      };

      const findData = await dbService.findAll('coping', findQuery);

      ctx.res.ok({ result: findData });
      return;
    } catch (error) {
      console.log('\n coping find list error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  syncFhir: async (ctx) => {
    try {
      const updatePromise = _.filter(ctx.request.body.fhirSyncArray || [], (innerData) => !innerData.deleted).map(
        (innerData) =>
          dbService.update(
            'coping',
            { fhirSynced: true, fhirId: innerData.fhirId },
            { where: { id: innerData.id } },
            {}
          )
      );

      const idsToDelete = _.filter(ctx.request.body.fhirSyncArray || [], (innerData) => innerData.deleted).map(
        (innerData) => innerData.id
      );

      const updateResp = await Promise.all(updatePromise);
      const deletedResp = await dbService.destroy('coping', { where: { id: { [Op.in]: idsToDelete } } });

      ctx.res.ok({ result: { updateResp, deletedResp } });
      return;
    } catch (error) {
      console.log('\n coping fhir sync update error...', error);
      ctx.res.internalServerError({ error });
    }
  },
};
