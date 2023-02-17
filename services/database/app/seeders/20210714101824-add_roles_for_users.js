const { uuidv4 } = require('../services/imports');
const { models, Sequelize } = require('../config/sequelize');
const config = require('../config/config');

const { Op } = Sequelize;

module.exports = {
  up: async (queryInterface) => {
    const userList = await queryInterface.sequelize.query('SELECT uuid FROM "user" ', {
      type: queryInterface.sequelize.QueryTypes.SELECT,
    });
    if (userList && userList.length) {
      const roleData = await queryInterface.sequelize.query(
        `SELECT uuid FROM "roles" WHERE name='${config.roleNames.p}' `,
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );
      const userRolesArr = userList.map((userData) => [
        {
          uuid: uuidv4(),
          userId: userData.uuid,
          roleId: roleData[0].uuid,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      let existRecords = await models.user_role.findAll({
        where: { userId: { [Op.in]: userRolesArr.flat(2).map((recordData) => recordData.userId) } },
        attributes: ['id', 'userId'],
      });
      existRecords = existRecords.map((tableData) => tableData.toJSON());

      const filteredArr = userRolesArr.flat(2).filter((el) => !existRecords.some((f) => f.userId == el.userId));
      if (filteredArr && filteredArr.length) {
        return queryInterface.bulkInsert('user_role', filteredArr.flat(2), {});
      }
    }
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('user_role', {});
  },
};
