const { _ } = require('../services/imports');

module.exports = {
  up: async (queryInterface, SequelizeTypes) => {
    const tableDefinition = await queryInterface.describeTable('diagnosis_type');
    if (!tableDefinition.approved_by) {
      await queryInterface.addColumn('diagnosis_type', 'approved_by', {
        type: SequelizeTypes.UUID,
        references: {
          model: {
            tableName: 'user',
          },
          key: 'uuid',
        },
        allowNull: true,
        onDelete: 'CASCADE',
      });
    }
    if (!tableDefinition.duration_id) {
      await queryInterface.addColumn('diagnosis_type', 'duration_id', {
        type: SequelizeTypes.UUID,
        references: {
          model: {
            tableName: 'clinic_slot_durations',
          },
          key: 'uuid',
        },
        allowNull: true,
        onDelete: 'CASCADE',
      });
    }
    if (!tableDefinition.approved_date) {
      await queryInterface.addColumn('diagnosis_type', 'approved_date', {
        type: SequelizeTypes.DATE,
        defaultValue: null,
      });
    }
    if (tableDefinition.duration) {
      const durationList = await queryInterface.sequelize.query('SELECT dt.*, csd.uuid as duration_id  FROM "diagnosis_type" dt  LEFT outer join clinic_slot_durations csd on CAST(csd.duration as INTEGER) = dt.duration WHERE dt.duration notnull ;', {
        type: queryInterface.sequelize.QueryTypes.SELECT,
      });
      const firstDuration = await queryInterface.sequelize.query('select uuid from clinic_slot_durations csd order by id asc limit 1;', {
        type: queryInterface.sequelize.QueryTypes.SELECT,
      });
      if (durationList && durationList.length && firstDuration && firstDuration.length) {
        const durationUpdateList = durationList.map((durationData) => ({
          ...durationData,
          duration_id: (durationData.duration_id ? durationData.duration_id : firstDuration[0].uuid)
        }));
        // eslint-disable-next-line global-require
        const { models } = require('../config/sequelize');
        await models.diagnosis_type.bulkCreate(durationUpdateList, { updateOnDuplicate: ['duration_id'] });
        await queryInterface.removeColumn('diagnosis_type', 'duration');
      }
    }
  },

  down: async (queryInterface, SequelizeTypes) => {
    const tableDefinition = await queryInterface.describeTable('diagnosis_type');
    if (!tableDefinition.duration) {
      await queryInterface.addColumn('diagnosis_type', 'duration', {
        type: SequelizeTypes.INTEGER,
      });
    }
    if (tableDefinition.duration_id) {
      const diagnosisTypeList = await queryInterface.sequelize.query('select dt.*, csd.duration as duration from diagnosis_type dt inner join clinic_slot_durations csd on dt.duration_id = csd.uuid;', {
        type: queryInterface.sequelize.QueryTypes.SELECT,
      });
      if (diagnosisTypeList && diagnosisTypeList.length) {
        const groupedObj = _.mapValues(_.groupBy(diagnosisTypeList, 'duration'), (dlist) => dlist.map((dtype) => _.omit(dtype, 'duration')));
        const splitArr = Object.keys(groupedObj).map((objKey) => ({ duration: objKey, groupArr: groupedObj[objKey] }));

        // eslint-disable-next-line no-restricted-syntax
        for (const iterator of splitArr) {
          // eslint-disable-next-line no-await-in-loop
          await queryInterface.bulkUpdate('diagnosis_type', { duration: iterator.duration, }, { duration_id: iterator.groupArr[0].duration_id, });
        }
        await queryInterface.removeColumn('diagnosis_type', 'duration_id');
      }
    }
    await queryInterface.removeColumn('diagnosis_type', 'approved_by');
    await queryInterface.removeColumn('diagnosis_type', 'approved_date');
  }
};
