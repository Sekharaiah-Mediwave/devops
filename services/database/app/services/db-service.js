const commonService = require('./common-service');
const db = require('../config/sequelize');
const { uuidv4 } = require('./imports');

const getTable = (tableName) => (typeof tableName == 'string' ? db.models[tableName] : tableName);

const checkAddIncludeTable = (findQuery = {}) => {
  if (findQuery.include) {
    findQuery.include = findQuery.include.map((includeData) => {
      includeData.model = getTable(includeData.model);
      if (includeData.include) {
        includeData = checkAddIncludeTable(includeData);
      }
      return includeData;
    });
  }
  return findQuery;
};

module.exports = {
  findOneAndUpsert: async (tableName, query = {}, updateData = {}, options = {}) => {
    query = checkAddIncludeTable(query);
    try {
      const findRes = await getTable(tableName).findOne(query);
      if (findRes) {
        // update
        updateData.updatedAt = commonService.indiaTz('').toDate();
        const updateOptions = options.updateOptions ? options.updateOptions : options;
        const updateRes = await findRes.update(updateData, {
          ...updateOptions,
          individualHooks: true,
        });
        return Promise.resolve({
          findRes,
          updateRes,
        });
      }
      // insert
      updateData.createdAt = commonService.indiaTz('').toDate();
      updateData.updatedAt = commonService.indiaTz('').toDate();
      updateData.uuid = uuidv4();
      const insertOptions = options.insertOptions ? options.insertOptions : options;
      const insertRes = await getTable(tableName).create(updateData, insertOptions);
      return Promise.resolve({
        findRes,
        insertRes,
      });
    } catch (error) {
      return Promise.reject({
        statusCode: 500,
        msg: 'Database error',
        error,
      });
    }
  },
  update: async (tableName, updateData = {}, query = {}, options = {}) => {
    query = checkAddIncludeTable(query);
    updateData.updatedAt = commonService.indiaTz('').toDate();
    try {
      return await getTable(tableName).update(updateData, query, options);
    } catch (error) {
      return Promise.reject({
        statusCode: 500,
        msg: 'Database error',
        error,
      });
    }
  },

  create: async (tableName, dataToSave = {}, options = {}) => {
    dataToSave.createdAt = commonService.indiaTz('').toDate();
    dataToSave.updatedAt = commonService.indiaTz('').toDate();
    try {
      return await getTable(tableName).create(dataToSave, options);
    } catch (error) {
      return Promise.reject({
        statusCode: 500,
        msg: 'Database error',
        error,
      });
    }
  },
  findAndCountAll: async (tableName, query = {}) => {
    query = checkAddIncludeTable(query);
    try {
      return await getTable(tableName).findAndCountAll(query);
    } catch (error) {
      return Promise.reject({
        statusCode: 500,
        msg: 'Database error',
        error,
      });
    }
  },
  count: async (tableName, query = {}) => {
    query = checkAddIncludeTable(query);
    try {
      return await getTable(tableName).count(query);
    } catch (error) {
      return Promise.reject({
        statusCode: 500,
        msg: 'Database error',
        error,
      });
    }
  },
  findOne: async (tableName, query = {}) => {
    query = checkAddIncludeTable(query);
    try {
      return await getTable(tableName).findOne(query);
    } catch (error) {
      return Promise.reject({
        statusCode: 500,
        msg: 'Database error',
        error,
      });
    }
  },
  destroy: async (tableName, query = {}) => {
    query = checkAddIncludeTable(query);
    try {
      return await getTable(tableName).destroy(query);
    } catch (error) {
      return Promise.reject({
        statusCode: 500,
        msg: 'Database error',
        error,
      });
    }
  },
  findAll: async (tableName, query = {}) => {
    query = checkAddIncludeTable(query);
    try {
      return await getTable(tableName).findAll(query);
    } catch (error) {
      return Promise.reject({
        statusCode: 500,
        msg: 'Database error',
        error: error.toString(),
      });
    }
  },
  bulkCreate: async (tableName, records = [], options = {}) => {
    try {
      return await getTable(tableName).bulkCreate(records, options);
    } catch (error) {
      return Promise.reject({
        statusCode: 500,
        msg: 'Database error',
        error: error.toString(),
      });
    }
  },
  bulkDelete: async (tableName, query = {}) => {
    try {
      return await getTable(tableName).bulkDelete(query);
    } catch (error) {
      return Promise.reject({
        statusCode: 500,
        msg: 'Database error',
        error: error.toString(),
      });
    }
  },
  query: async (rawQuery) => {
    try {
      return await db.sequelize.query(rawQuery);
    } catch (error) {
      return Promise.reject({
        statusCode: 500,
        msg: 'Database error',
        error: error.toString(),
      });
    }
  },
};
