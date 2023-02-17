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
  dashboardCount: async (ctx) => {
    try {
      let findQuery = {};
      let todayAppontment = 0;
      let allAppontment = 0;
      if (ctx.req.decoded.role == 'Clinician') {
        todayAppontment = 0;
        allAppontment = 0;
        const bookedAppontment = 10;
        const unBookedAppontment = 30;
        ctx.res.ok({
          result: {
            unBookedAppontment,
            bookedAppontment,
            todayAppontment,
            allAppontment
          },
        });
      } else {
        findQuery = {
          group: ['location'],
          attributes: ['location', [Sequelize.fn('COUNT', Sequelize.col('location')), 'LocationCount']],
        };
        todayAppontment = 0;
        allAppontment = 0;
        const clinicLocation = await dbService.findAll('clinic_location', findQuery);
        const clinicName = await dbService.count('clinic_location', {});
        ctx.res.ok({
          result: {
            clinicLocation: clinicLocation.length,
            clinicName,
            todayAppontment,
            allAppontment
          },
        });
      }
      return;
    } catch (error) {
      console.log('\n group find error...', error);
      ctx.res.internalServerError({ error });
    }
  },
};
