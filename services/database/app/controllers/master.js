const dbService = require('../services/db-service');
const { masterTables, Sequelize } = require('../config/sequelize');
const { uuidv4 } = require('../services/imports');
const responseMessages = require('../middleware/response-messages');

const { Op } = Sequelize;

const attributes = ['uuid', 'name', 'description', 'id'];
const checkTableNameValid = (tableName) => !!masterTables[tableName];

module.exports = {
  saveData: async (ctx) => {
    try {
      if (!checkTableNameValid(ctx.request.body.tableName)) {
        ctx.res.unprocessableEntity({ msg: responseMessages[1093] });
        return;
      }

      const dataToSave = { ...ctx.request.body.dataToSave, uuid: uuidv4() };
      console.log('\n dataToSave...', dataToSave);
      const saveResp = await dbService.create(ctx.request.body.tableName, dataToSave);
      if (!saveResp) {
        ctx.res.internalServerError({ msg: responseMessages[1090] });
        return;
      }

      ctx.res.ok({ result: saveResp });
      return;
    } catch (error) {
      console.log('\n master table save error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  updateData: async (ctx) => {
    try {
      if (!checkTableNameValid(ctx.request.body.tableName)) {
        ctx.res.unprocessableEntity({ msg: responseMessages[1093] });
        return;
      }

      const findData = await dbService.findOne(ctx.request.body.tableName, {
        where: { uuid: ctx.request.body.uuid },
        attributes,
      });
      if (!findData) {
        ctx.res.notFound({ msg: responseMessages[1092] });
        return;
      }

      const dataToUpdate = { ...ctx.request.body.dataToUpdate };

      const updateResp = await dbService.update(ctx.request.body.tableName, dataToUpdate, {
        where: { uuid: ctx.request.body.uuid },
      });
      if (!updateResp) {
        ctx.res.internalServerError({ msg: responseMessages[1091] });
        return;
      }

      ctx.res.ok({ result: updateResp });
      return;
    } catch (error) {
      console.log('\n master table find by id error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  getListsFromTable: async (ctx) => {
    try {
      if (!checkTableNameValid(ctx.request.query.tableName)) {
        ctx.res.unprocessableEntity({ msg: responseMessages[1093] });
        return;
      }

      let pageNo = 1;
      const pageSize = ctx.request.query.pageSize ? ctx.request.query.pageSize : 10;
      let sortArr = ['createdAt', 'DESC'];
      let fieldSplitArr = [];

      if (ctx.request.query.pageNo) {
        const temp = parseInt(ctx.request.query.pageNo);
        if (temp && !isNaN(temp)) {
          pageNo = (temp - 1);
        }
      }

      const offset = (pageNo - 1) * pageSize;

      if (ctx.request.query.sortField) {
        fieldSplitArr = ctx.request.query.sortField.split('.');
        if (fieldSplitArr.length == 1) {
          sortArr[0] = ctx.request.query.sortField;
        } else {
          for (let idx = 0; idx < fieldSplitArr.length; idx++) {
            const element = fieldSplitArr[idx];
            fieldSplitArr[idx] = element.replace(/\[\/?.+?\]/gi, '');
          }
          sortArr = fieldSplitArr;
        }
      }

      if (ctx.request.query.sortOrder) {
        if (fieldSplitArr.length == 1 || fieldSplitArr.length == 0) {
          sortArr[1] = ctx.request.query.sortOrder;
        } else {
          sortArr.push(ctx.request.query.sortOrder);
        }
      }

      const findQuery = {
        offset,
        limit: pageSize,
        order: [sortArr],
        attributes,
      };

      if (ctx.request.query.search) {
        findQuery.where = {
          [Op.or]: [
            Sequelize.where(
              Sequelize.fn('LOWER', Sequelize.col('name')),
              'LIKE',
              `%${(ctx.request.query.search || '').toLowerCase()}%`
            ),
            Sequelize.where(
              Sequelize.fn('LOWER', Sequelize.col('description')),
              'LIKE',
              `%${(ctx.request.query.search || '').toLowerCase()}%`
            ),
          ],
        };
      }

      const { count, rows } = await dbService.findAndCountAll(ctx.request.query.tableName, findQuery);

      ctx.res.ok({ result: rows, count });
      return;
    } catch (error) {
      console.log('\n master table find list error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  getById: async (ctx) => {
    try {
      if (!checkTableNameValid(ctx.request.query.tableName)) {
        ctx.res.unprocessableEntity({ msg: responseMessages[1093] });
        return;
      }

      const findData = await dbService.findOne(ctx.request.query.tableName, {
        where: { uuid: ctx.request.query.uuid },
        attributes,
      });
      if (!findData) {
        ctx.res.notFound({ msg: responseMessages[1092] });
        return;
      }

      ctx.res.ok({ result: findData });
      return;
    } catch (error) {
      console.log('\n master table find by id error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  deleteData: async (ctx) => {
    try {
      if (!checkTableNameValid(ctx.request.query.tableName)) {
        ctx.res.unprocessableEntity({ msg: responseMessages[1093] });
        return;
      }

      const findData = await dbService.findOne(ctx.request.query.tableName, {
        where: { uuid: ctx.request.query.uuid },
        attributes,
      });
      if (!findData) {
        ctx.res.notFound({ msg: responseMessages[1092] });
        return;
      }

      const deleteResp = await dbService.destroy(ctx.request.query.tableName, {
        where: { uuid: ctx.request.query.uuid },
      });
      if (!deleteResp) {
        ctx.res.internalServerError({ msg: responseMessages[1092] });
        return;
      }

      ctx.res.ok({ result: deleteResp });
      return;
    } catch (error) {
      console.log('\n master table find by id error...', error);
      ctx.res.internalServerError({ error });
    }
  },
};
