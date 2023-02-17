const commonService = require('../services/common-service');
const dbService = require('../services/db-service');
const { _, moment, uuidv4 } = require('../services/imports');
const responseMessages = require('../middleware/response-messages');
const { Sequelize } = require('../config/sequelize');

const { Op } = Sequelize;

function removeDuplicates(dataValue) {
  return dataValue.filter((a, b) => dataValue.indexOf(a) === b);
}

module.exports = {
  saveRecord: async (ctx) => {
    try {
      const savePayload = {
        uuid: uuidv4(),
        userId: (ctx.req && ctx.req.decoded && ctx.req.decoded.uuid) || ctx.request.body.userId,
        name: ctx.request.body.name,
        permission: ctx.request.body?.permission,
      };

      const findResp = await dbService.findOne('group', {
        where: {
          userId: savePayload.userId,
          name: savePayload.name
        },
      });

      if (findResp) {
        ctx.res.conflict({ msg: responseMessages[1165] });
        return;
      }

      const saveResp = await dbService.create('group', savePayload, {});

      const members = ctx.request.body.members.map((item)=>{
        return { 
          uuid: uuidv4(),
          userId: item,
          groupId: savePayload.uuid,
          
        }
      });
      await dbService.bulkCreate('group_member', members);

      ctx.res.ok({ result: saveResp });
      return;
    } catch (error) {
      console.log('\n group save error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  getById: async (ctx) => {
    try {
      const findResp = await dbService.findOne('group', {
        where: { uuid: ctx.request.params.uuid },
        include: [
          {
            model: 'group_member',
            as: 'groupMembers',
            include: [
              {
                model: 'user',
                as: 'userInfo',
                attributes: ['uuid', 'firstName', 'lastName', 'email'],
              },
            ],
          },
        ],
      });

      if (!findResp) {
        ctx.res.notFound({ msg: responseMessages[1166] });
        return;
      }

      ctx.res.ok({ result: findResp });
      return;
      
    } catch (error) {
      console.log('\n group find error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  deleteById: async (ctx) => {
    try {
      const findResp = await dbService.findOne('group', {
        where: { uuid: ctx.request.params.uuid },
      });

      if (!findResp) {
        ctx.res.notFound({ msg: responseMessages[1166] });
        return;
      }
      const deleteResp = await dbService.destroy('group',{
        where: {
          uuid: ctx.request.params.uuid,
      }
    })
      ctx.res.ok({ result: deleteResp });
      return;
    } catch (error) {
      console.log('\n group find error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  updateRecord: async (ctx) => {
    try {
      const findRespEx = await dbService.findOne('group', {
        where: {
          uuid: { [Op.not]:ctx.request.body.uuid },
          name: ctx.request.body.name
        },
      });

      if (findRespEx) {
        ctx.res.conflict({ msg: responseMessages[1165] });
        return;
      }
      const updatePayload = {
        name: ctx.request.body.name,
        permission: ctx.request.body?.permission,
      };

      const updateResp = await dbService.update(
        'group',
        updatePayload,
        { where: { uuid: ctx.request.body.uuid }, individualHooks: true },
        {}
      );
      if (!updateResp) {
        ctx.res.forbidden({ msg: responseMessages[1167] });
        return;
      }
      const findResp = await dbService.findAll('group_member', {
        where: {
          groupId: ctx.request.body.uuid,
        },
      });
      console.log(findResp);
      const removeMember = findResp
      .filter((el) => !ctx.request.body.members.some((f) => f == el.userId))
      .map((teamName) => teamName.uuid);
      const newMember = ctx.request.body.members
      .filter((el) => !findResp.some((f) => f.userId == el))
      .map((teamName) => teamName);
      console.log("removeMember",removeMember);
      console.log("newMember",newMember);
      const members = newMember.map((item)=>{
        return { 
          uuid: uuidv4(),
          userId: item,
          groupId: ctx.request.body.uuid,
          
        }
      });
      await dbService.bulkCreate('group_member', members);
      await dbService.destroy('group_member',{
        where: {
          uuid: {
            [Op.in]: removeMember
          },
          groupId: ctx.request.body.uuid
        }
      });
      ctx.res.ok({ result: updateResp });
      return;
    } catch (error) {
      console.log('\n group update error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  changeGroupStatus: async (ctx) => {
    try {
      const findRespEx = await dbService.findAll('group', {
        where: {
          uuid: { [Op.in]:ctx.request.body.uuids }
        },
      });
      if (findRespEx.length === 0) {
        ctx.res.notFound({ msg: responseMessages[1166] });
        return;
      }
      const updatePayload = {
        status: ctx.request.body.status,
      };

      const updateResp = await dbService.update(
        'group',
        updatePayload,
        { where: { uuid: { [Op.in]:ctx.request.body.uuids } }, individualHooks: true },
        {}
      );
      if (!updateResp) {
        ctx.res.forbidden({ msg: responseMessages[1167] });
        return;
      }      
      ctx.res.ok({ msg: "success" });
      return;
    } catch (error) {
      console.log('\n group update error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  changeGroupMemberStatus: async (ctx) => {
    try {
      const findRespEx = await dbService.findAll('group_member', {
        where: {
          uuid: { [Op.in]:ctx.request.body.uuids }
        },
      });

      if (findRespEx.length === 0) {
        ctx.res.notFound({ msg: responseMessages[1166] });
        return;
      }
      const updatePayload = {
        status: ctx.request.body.status,
      };

      const updateResp = await dbService.update(
        'group_member',
        updatePayload,
        { where: { uuid: { [Op.in]:ctx.request.body.uuids } }, individualHooks: true },
        {}
      );
      if (!updateResp) {
        ctx.res.forbidden({ msg: responseMessages[1167] });
        return;
      }      
      ctx.res.ok({ msg: "success" });
      return;
    } catch (error) {
      console.log('\n group update error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  getList: async (ctx) => {
    try {
      const { sortArr, offset, limit } = commonService.paginationSortFilters(ctx);
      let where = {};
      if (ctx.request.query.search) {
        where = {
          [Op.or]: [
            Sequelize.where(
              Sequelize.fn('LOWER', Sequelize.col('name')),
              'LIKE',
              `%${(ctx.request.query.search || '').toLowerCase()}%`
            ),
          ],
        };
      }
      const findQuery = {
        include: [
          {
            model: 'group_member',
            as: 'groupMembers',
            include: [
              {
                model: 'user',
                as: 'userInfo',
                attributes: ['uuid', 'firstName', 'lastName', 'email'],
              },
            ],
          },
        ],
        where: {
          userId: ctx.req.decoded.uuid || ctx.request.query.userId,
          ...where,
        },
        distinct:true,
        order: [sortArr],      
        offset,
        limit,     
      };
      let findResp = await dbService.findAndCountAll('group', findQuery);
      ctx.res.ok({ result: findResp });
      return;
    } catch (error) {
      console.log('\n group find error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  getMemberList: async (ctx) => {
    try {
      const { sortArr, offset, limit } = commonService.paginationSortFilters(ctx);
      let where = {};
      if (ctx.request.query.search) {
        let search= ctx.request.query.search.split(" ");
        search = search.filter((el) => el != "");
        const searchArr = [];
        search.map((el) => {
          searchArr.push(Sequelize.where(
            Sequelize.fn('LOWER', Sequelize.col('userInfo.firstName')),
            'LIKE',
            `%${(el || '').toLowerCase()}%`
          ));
          searchArr.push(Sequelize.where(
            Sequelize.fn('LOWER', Sequelize.col('userInfo.lastName')),
            'LIKE',
            `%${(el || '').toLowerCase()}%`
          ));
          // searchArr.push(Sequelize.where(
          //   Sequelize.fn('LOWER', Sequelize.col('userInfo.email')),
          //   'LIKE',
          //   `%${(el || '').toLowerCase()}%`
          // ));
        })
        where = {
          [Op.or]: searchArr
        };
      }
      const findQuery = {
        include: [
          {
            model: 'user',
            as: 'userInfo',
            attributes: ['uuid', 'firstName', 'lastName', 'email'],
          },
        ],
        where: {
          groupId: ctx.request.params.uuid,
          ...where,
        },
        order: [sortArr],
        distinct:true,
        offset,
        limit,
      };
      let findResp = await dbService.findAndCountAll('group_member', findQuery);
      ctx.res.ok({ result: findResp });
      return;
    } catch (error) {
      console.log('\n group find error...', error);
      ctx.res.internalServerError({ error });
    }
  },
};
