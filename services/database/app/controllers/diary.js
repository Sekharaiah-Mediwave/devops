const commonService = require('../services/common-service');
const dbService = require('../services/db-service');
const { _, moment, uuidv4 } = require('../services/imports');
const responseMessages = require('../middleware/response-messages');
const { Sequelize } = require('../config/sequelize');

const { Op } = Sequelize;

const saveDiaryRecord = async (savePayload) => await dbService.create('diary', savePayload, {});

function removeDuplicates(dataValue) {
  return dataValue.filter((a, b) => dataValue.indexOf(a) === b);
}

module.exports = {
  saveDiaryRecord,
  saveRecord: async (ctx) => {
    try {
      const savePayload = {
        uuid: uuidv4(),
        userId: ctx.request.body.userId || (ctx.req && ctx.req.decoded && ctx.req.decoded.uuid),
        entryDate: moment(ctx.request.body.entryDate).format('YYYY-MM-DD'),
        status: ctx.request.body.status,
        notes: ctx.request.body.notes,
        createdFrom: ctx.request.body.createdFrom,
        trackerId: ctx.request.body.trackerId || null,
      };

      const findResp = await dbService.findOne('diary', {
        where: {
          status: { [Op.ne]: 'Inactive' },
          userId: savePayload.userId,
          createdFrom: savePayload.createdFrom != undefined ? savePayload.createdFrom : null,
          entryDate: {
            [Op.gte]: moment(savePayload.entryDate, 'YYYY-MM-DD').startOf('day').format(),
            [Op.lte]: moment(savePayload.entryDate, 'YYYY-MM-DD').endOf('day').format(),
          },
        },
      });

      if (findResp) {
        ctx.res.conflict({ msg: responseMessages[1065] });
        return;
      }

      const saveResp = await saveDiaryRecord(savePayload);

      if (!saveResp) {
        ctx.res.forbidden({ msg: responseMessages[1068] });
        return;
      }

      ctx.res.ok({ result: saveResp });
      return;
    } catch (error) {
      console.log('\n diary save error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  getById: async (ctx) => {
    try {
      const findResp = await dbService.findOne('diary', {
        where: { uuid: ctx.request.params.uuid, status: 'Active' },
        include: [
          /* join must be mandatory to show tracker diaries */
          {
            required: false,
            model: 'smoke',
            as: 'smoke',
            where: {
              status: { [Op.ne]: 'Inactive' },
            },
          },
          {
            required: false,
            model: 'problem_records',
            as: 'problem_records',
            where: {
              status: { [Op.ne]: 'Inactive' },
            },
          },
          {
            required: false,
            model: 'mood',
            as: 'mood',
            where: {
              status: { [Op.ne]: 'Inactive' },
            },
          },
          {
            required: false,
            model: 'sleep',
            as: 'sleep',
            where: {
              status: { [Op.ne]: 'Inactive' },
            },
          },
          {
            required: false,
            model: 'alcohol',
            as: 'alcohol',
            where: {
              status: { [Op.ne]: 'Inactive' },
            },
          },
          {
            required: false,
            model: 'pain_condition_records',
            as: 'pain_condition_records',
            where: {
              status: { [Op.ne]: 'Inactive' },
            },
          },
        ],
      });

      if (!findResp) {
        ctx.res.notFound({ msg: responseMessages[1069] });
        return;
      }

      ctx.res.ok({ result: findResp });
      return;
    } catch (error) {
      console.log('\n Diary find error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  updateRecord: async (ctx) => {
    try {
      const updatePayload = {
        userId: ctx.request.body.userId || ctx.req.decoded.uuid,
        entryDate: ctx.request.body.entryDate,
        status: ctx.request.body.status,
        weight: ctx.request.body.weight,
        height: ctx.request.body.height,
      };

      const findResp = await dbService.findOne('diary', {
        where: {
          entryDate: updatePayload.entryDate,
          status: { [Op.ne]: 'Inactive' },
          uuid: { [Op.not]: ctx.request.body.uuid },
        },
      });

      if (findResp) {
        ctx.res.conflict({ msg: responseMessages[1065] });
        return;
      }

      const updateResp = await dbService.update(
        'diary',
        updatePayload,
        { where: { uuid: ctx.request.body.uuid }, individualHooks: true },
        {}
      );

      if (!updateResp) {
        ctx.res.forbidden({ msg: responseMessages[1066] });
        return;
      }

      ctx.res.ok({ result: updateResp });
      return;
    } catch (error) {
      console.log('\n Diary update error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  deleteTrackerRecord: async (trackerFindQuery = {}) => {
    try {
      if (Object.keys(trackerFindQuery).length == 0) {
        return { status: 0, msg: 'Tracker Id is required to delete' };
      }

      const updatePayload = { status: 'Inactive' };

      const updateResp = await dbService.update('diary', updatePayload, trackerFindQuery, {});

      if (!updateResp) {
        return { status: 0, msg: 'Diary not deleted' };
      }

      return { status: 1, msg: 'Success' };
    } catch (error) {
      console.log('\n Diary delete error...', error);
      return { status: 0, msg: 'Diary not deleted' };
    }
  },
  deleteRecord: async (ctx) => {
    try {
      const updatePayload = {
        status: 'Inactive',
      };

      const updateResp = await dbService.update(
        'diary',
        updatePayload,
        { where: { uuid: ctx.request.query.uuid }, individualHooks: true },
        {}
      );

      if (!updateResp) {
        ctx.res.forbidden({ msg: responseMessages[1067] });
        return;
      }

      ctx.res.ok({ result: updateResp });
      return;
    } catch (error) {
      console.log('\n Diary delete error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  getList: async (ctx) => {
    try {
      const findQuery = {
        order: [['entryDate', 'DESC']],
        include: [
          /* join must be mandatory to show tracker diaries */
          {
            required: false,
            model: 'smoke',
            as: 'smoke',
            where: {
              status: { [Op.ne]: 'Inactive' },
            },
          },
          {
            required: false,
            model: 'problem_records',
            as: 'problem_records',
            where: {
              status: { [Op.ne]: 'Inactive' },
            },
          },
          {
            required: false,
            model: 'mood',
            as: 'mood',
            where: {
              status: { [Op.ne]: 'Inactive' },
            },
          },
          {
            required: false,
            model: 'sleep',
            as: 'sleep',
            where: {
              status: { [Op.ne]: 'Inactive' },
            },
          },
          {
            required: false,
            model: 'alcohol',
            as: 'alcohol',
            where: {
              status: { [Op.ne]: 'Inactive' },
            },
          },
          {
            required: false,
            model: 'pain_condition_records',
            as: 'pain_condition_records',
            where: {
              status: { [Op.ne]: 'Inactive' },
            },
          },
        ],
        where: {
          [Op.and]: [
            {
              userId: ctx.request.query.userId || ctx.req.decoded.uuid,
            },
            {
              status: 'Active',
            },
            Sequelize.where(
              Sequelize.fn('date', Sequelize.col('diary.entryDate')),
              '>=',
              commonService.indiaTz(ctx.request.query.fromDate).format('YYYY-MM-DD')
            ),
            Sequelize.where(
              Sequelize.fn('date', Sequelize.col('diary.entryDate')),
              '<=',
              commonService.indiaTz(ctx.request.query.toDate).format('YYYY-MM-DD')
            ),
          ],
        },
      };
      let findResp = await dbService.findAll('diary', findQuery);

      findResp = findResp.map((findPatientData) => findPatientData.toJSON());
      const grouped = _.groupBy(findResp, (date) => (date = moment(date.entryDate).format('YYYY-MM-DD')));
      ctx.res.ok({ result: !_.isEmpty(grouped) ? [grouped] : [] });
      return;
    } catch (error) {
      console.log('\n Diary graph overview error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  getDateList: async (ctx) => {
    try {
      const findQuery = {
        // include: [ /* join must be mandatory to show tracker diaries */
        //   {
        //     required: false,
        //     model: 'smoke',
        //     as: 'smoke',
        //     where: {
        //       status: { [Op.ne]: 'Inactive' }
        //     }
        //   },
        //   {
        //     required: false,
        //     model: 'problem_records',
        //     as: 'problem_records',
        //     where: {
        //       status: { [Op.ne]: 'Inactive' }
        //     }
        //   },
        //   {
        //     required: false,
        //     model: 'mood',
        //     as: 'mood',
        //     where: {
        //       status: { [Op.ne]: 'Inactive' }
        //     }
        //   },
        //   {
        //     required: false,
        //     model: 'sleep',
        //     as: 'sleep',
        //     where: {
        //       status: { [Op.ne]: 'Inactive' }
        //     }
        //   },
        //   {
        //     required: false,
        //     model: 'alcohol',
        //     as: 'alcohol',
        //     where: {
        //       status: { [Op.ne]: 'Inactive' }
        //     }
        //   },
        //   {
        //     required: false,
        //     model: 'pain_condition_records',
        //     as: 'pain_condition_records',
        //     where: {
        //       status: { [Op.ne]: 'Inactive' }
        //     }
        //   },
        // ],
        attributes: ['entryDate'],

        where: {
          [Op.and]: [
            {
              userId: ctx.request.query.userId || ctx.req.decoded.uuid,
            },
            {
              status: 'Active',
            },
            Sequelize.where(
              Sequelize.fn('date', Sequelize.col('diary.entryDate')),
              '>=',
              commonService.indiaTz(ctx.request.query.fromDate).format('YYYY-MM-DD')
            ),
            Sequelize.where(
              Sequelize.fn('date', Sequelize.col('diary.entryDate')),
              '<=',
              commonService.indiaTz(ctx.request.query.toDate).format('YYYY-MM-DD')
            ),
          ],
        },
      };

      let findResp = await dbService.findAll('diary', findQuery);

      findResp = findResp.map((findPatientData) => findPatientData.toJSON());
      const dataValue = [];
      if (findResp && findResp.length) {
        findResp.forEach((item) => {
          if (item.entryDate) {
            dataValue.push(moment(item.entryDate).format('YYYY-MM-DD'));
          }
        });
      }

      ctx.res.ok({ result: removeDuplicates(dataValue) });
      return;
    } catch (error) {
      console.log('\n Diary graph overview error...', error);
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
          /* join must be mandatory to show tracker diaries */
          {
            model: 'user',
            as: 'userInfo',
            attributes: ['id', 'fhirId'],
          },
          {
            required: false,
            model: 'smoke',
            as: 'smoke',
            attributes: { exclude: ['id', 'userId', 'fhirId', 'createdAt', 'updatedAt', 'fhirSynced'] },
          },
          {
            required: false,
            model: 'problem_records',
            as: 'problem_records',
            attributes: { exclude: ['id', 'userId', 'fhirId', 'problemId', 'createdAt', 'updatedAt', 'fhirSynced'] },
          },
          {
            required: false,
            model: 'mood',
            as: 'mood',
            attributes: { exclude: ['id', 'userId', 'fhirId', 'createdAt', 'updatedAt', 'fhirSynced'] },
          },
          {
            required: false,
            model: 'sleep',
            as: 'sleep',
            attributes: { exclude: ['id', 'userId', 'fhirId', 'createdAt', 'updatedAt', 'fhirSynced'] },
          },
          {
            required: false,
            model: 'alcohol',
            as: 'alcohol',
            attributes: { exclude: ['id', 'userId', 'fhirId', 'createdAt', 'updatedAt', 'fhirSynced'] },
          },
          {
            required: false,
            model: 'pain_condition_records',
            as: 'pain_condition_records',
            attributes: { exclude: ['id', 'userId', 'fhirId', 'createdAt', 'updatedAt', 'fhirSynced', 'painId'] },
          },
        ],
      };

      const findData = await dbService.findAll('diary', findQuery);

      ctx.res.ok({ result: findData });
      return;
    } catch (error) {
      console.log('\n diary find list error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  syncFhir: async (ctx) => {
    try {
      const updatePromise = _.filter(ctx.request.body.fhirSyncArray || [], (innerData) => !innerData.deleted).map(
        (innerData) =>
          dbService.update('diary', { fhirSynced: true, fhirId: innerData.fhirId }, { where: { id: innerData.id } }, {})
      );

      const idsToDelete = _.filter(ctx.request.body.fhirSyncArray || [], (innerData) => innerData.deleted).map(
        (innerData) => innerData.id
      );

      const updateResp = await Promise.all(updatePromise);
      const deletedResp = await dbService.destroy('diary', { where: { id: { [Op.in]: idsToDelete } } });

      ctx.res.ok({ result: { updateResp, deletedResp } });
      return;
    } catch (error) {
      console.log('\n diary fhir sync update error...', error);
      ctx.res.internalServerError({ error });
    }
  },
};
