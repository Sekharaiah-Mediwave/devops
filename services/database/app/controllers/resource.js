const commonService = require('../services/common-service');
const dbService = require('../services/db-service');
const { uuidv4, moment, _ } = require('../services/imports');
const { Sequelize } = require('../config/sequelize');

const { Op } = Sequelize;
const responseMessages = require('../middleware/response-messages');
const config = require('../config/config');

module.exports = {
  getRecommendedResource: async (ctx) => {
    try {
      const recommendedResource = await dbService.findOne('recommended_resource', {
        where: {
          userId: ctx.req.decoded.uuid,
        },
      });
      if (!recommendedResource) {
        ctx.res.notFound({ msg: responseMessages[1163] });
        return;
      }
      // console.log(recommendedResource,"recommendedResource");
      return ctx.res.ok({ result: recommendedResource });
    } catch (error) {
      return ctx.res.internalServerError({ error });
    }
  },
  createRecommendedResource: async (ctx) => {
    try {
      const record = await dbService.findOne('recommended_resource', {
        where: {
          userId: ctx.request.body.userUuid,
        },
      });
      if (!record) {
        const payload = {
          userId: ctx.request.body.userUuid,
          resource_ids: ctx.request.body.resourceIds,
        };
        await dbService.create('recommended_resource', payload);
      } else {
        if (record.resource_ids && record.resource_ids.length) {
          record.resource_ids = _.union(record.resource_ids, ctx.request.body.resourceIds);
        }

        await record.save();
      }

      ctx.res.ok({
        msg: 'Added resource to recommended',
      });
      return;
    } catch (error) {
      ctx.res.internalServerError({ error });
    }
  },
};
