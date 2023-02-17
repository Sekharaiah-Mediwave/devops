// const commonService = require('../services/common-service');
const dbService = require('../services/db-service');
const { moment, uuidv4, _ } = require('../services/imports');
const responseMessages = require('../middleware/response-messages');
const { Sequelize, sequelize } = require('../config/sequelize');
const commonService = require('../services/common-service');

const { Op } = Sequelize;

module.exports = {
  saveRecord: async (ctx) => {
    const transaction = await sequelize.transaction();
    try {
      const { diagnosisType, /* clinicLocation, appointmentType */ } = ctx.request.body;

      let datesToSave = (ctx.request.body.selectedDates || []).map((slotDate) => ({
        uuid: uuidv4(),
        start_time: moment(slotDate).startOf('day').toDate(),
        end_time: moment(slotDate).endOf('day').toDate(),
      }));

      let slotsToSave = datesToSave.map((slotDateData) => (ctx.request.body.selectedSlots || []).map((slotTime) => {
        const slotStartTime = moment(`${moment(new Date(slotDateData.start_time)).format('YYYY-MM-DD')} ${moment(new Date(slotTime)).format('HH:mm:ss')}`).toDate();
        const slotEndTime = moment(new Date(slotStartTime)).add(diagnosisType.slotDuration.duration, 'minutes').set({ seconds: 0 }).toDate();
        return {
          uuid: uuidv4(),
          clinic_time_id: slotDateData.uuid,
          start_time: slotStartTime,
          end_time: slotEndTime,
        };
      })).flat();

      const savePayload = {
        diagnosis_type_id: ctx.request.body.diagnosis_type_id,
        appointment_type_id: ctx.request.body.appointment_type_id,
        clinic_location_id: ctx.request.body.clinic_location_id,
        clinic_name_id: ctx.request.body.clinic_name_id,
        status: ctx.request.body.status,
        clinic_joining_details: ctx.request.body.clinic_joining_details,
        created_by: (ctx.req && ctx.req.decoded && ctx.req.decoded.uuid) || ctx.request.body.userId,
        start_time: moment(_.min((slotsToSave || []).map((innerData) => new Date(innerData.start_time)))).toDate(),
        end_time: moment(_.max((slotsToSave || []).map((innerData) => new Date(innerData.end_time)))).toDate()
      };

      const saveResp = await dbService.create('clinic', savePayload, { transaction });

      datesToSave = datesToSave.map((innerData) => ({ ...innerData, clinic_id: saveResp.uuid }));
      slotsToSave = slotsToSave.map((innerData) => ({ ...innerData, clinic_id: saveResp.uuid }));

      const clinicTimeResp = await dbService.bulkCreate('clinic_time', datesToSave, { transaction });

      const slotCreateResp = await dbService.bulkCreate('slot', slotsToSave, { transaction });

      await transaction.commit();

      return ctx.res.ok({ result: { saveResp, clinicTimeResp, slotCreateResp } });
    } catch (error) {
      console.log('\n clinic save error...', error);
      await transaction.rollback();
      return ctx.res.internalServerError({ error });
    }
  },
  getById: async (ctx) => {
    try {
      const countSubQuery = {
        booked: '',
        completed: `and ("a"."start_time" <= '${moment().toISOString()}')`,
        missed: `and ("a"."start_time" <= '${moment().toISOString()}')`,
        totalSlots: ''
      };

      const clinicAttributes = [
        'id',
        'uuid',
        'clinic_joining_details',
        'diagnosis_type_id',
        'appointment_type_id',
        'clinic_location_id',
        'clinic_name_id',
        'start_time',
        'end_time',
        'createdAt',
        'created_by',
        'status',
        [Sequelize.cast(Sequelize.literal(`(SELECT count(*) FROM appointment a WHERE (("a"."status"='active') and ("a"."clinic_id"= "clinic"."uuid") ${countSubQuery.booked}))`), 'integer'), 'bookedAppointmentCount'],
        [Sequelize.cast(Sequelize.literal(`(SELECT count(*) FROM appointment a WHERE (("a"."status"='missed') and ("a"."clinic_id"= "clinic"."uuid") ${countSubQuery.missed}))`), 'integer'), 'notAttendedCount'],
        [Sequelize.cast(Sequelize.literal(`(SELECT count(*) FROM appointment a WHERE (("a"."status"='completed') and ("a"."clinic_id"= "clinic"."uuid") ${countSubQuery.completed}))`), 'integer'), 'completedCount'],
        [Sequelize.cast(Sequelize.literal(`(SELECT count(*) FROM slot s WHERE (("s"."status"!='Deleted') and ("s"."clinic_id"= "clinic"."uuid") ${countSubQuery.totalSlots}))`), 'integer'), 'totalSlotsCount'],
      ];

      const findResp = await dbService.findOne('clinic', {
        where: { uuid: ctx.request.params.uuid },
        attributes: clinicAttributes,
        include: [
          {
            model: 'clinic_time',
            as: 'clinicTime',
          },
          {
            model: 'slot',
            as: 'slot',
          },
          {
            model: 'diagnosis_type',
            as: 'diagnosisType',
          },
          {
            model: 'clinic_location',
            as: 'clinicLocation',
            attributes: ['location', 'uuid']
          },
          {
            model: 'clinic_name',
            as: 'clinicName',
            attributes: ['name', 'uuid']
          },
          {
            model: 'appointment_type',
            as: 'AppointmentType',
          },
          {
            model: 'user',
            as: 'createdUser',
            attributes: ['uuid', 'firstName', 'lastName']
          },
        ],
      });

      if (!findResp) {
        return ctx.res.notFound({ msg: responseMessages[1178] });
      }

      return ctx.res.ok({ result: findResp });
    } catch (error) {
      console.log('\n clinic find error...', error);
      return ctx.res.internalServerError({ error });
    }
  },
  getTimesByClinic: async (ctx) => {
    try {
      const findResp = await dbService.findAll('clinic_time', {
        where: { clinic_id: ctx.request.query.clinicId },
      });

      return ctx.res.ok({ result: findResp });
    } catch (error) {
      console.log('\n getTimesByClinic error...', error);
      return ctx.res.internalServerError({ error });
    }
  },
  getTimeById: async (ctx) => {
    try {
      const findResp = await dbService.findOne('clinic_time', {
        where: { uuid: ctx.request.query.uuid },
        include: [
          {
            model: 'clinic',
            as: 'clinic',
          },
        ]
      });

      if (!findResp) {
        return ctx.res.notFound({ msg: responseMessages[1199] });
      }

      return ctx.res.ok({ result: findResp });
    } catch (error) {
      console.log('\n getTimeById error...', error);
      return ctx.res.internalServerError({ error });
    }
  },
  getSlotsByClinic: async (ctx) => {
    try {
      const findResp = await dbService.findAll('slot', {
        where: { clinic_id: ctx.request.query.clinicId },
      });

      return ctx.res.ok({ result: findResp });
    } catch (error) {
      console.log('\n getSlotsByClinic error...', error);
      return ctx.res.internalServerError({ error });
    }
  },
  getSlotsByClinicTime: async (ctx) => {
    try {
      const findResp = await dbService.findAll('slot', {
        where: { clinic_time_id: ctx.request.query.clinicTimeId, availability: true },
        order: [['start_time', 'ASC']]
      });

      return ctx.res.ok({ result: findResp });
    } catch (error) {
      console.log('\n getSlotsByClinicTime error...', error);
      return ctx.res.internalServerError({ error });
    }
  },
  getSlotById: async (ctx) => {
    try {
      const findResp = await dbService.findOne('slot', {
        where: { uuid: ctx.request.query.uuid },
        include: [
          {
            model: 'clinic',
            as: 'clinic',
          },
          {
            model: 'clinic_time',
            as: 'clinicTime',
          },
        ]
      });

      if (!findResp) {
        return ctx.res.notFound({ msg: responseMessages[1199] });
      }

      return ctx.res.ok({ result: findResp });
    } catch (error) {
      console.log('\n getSlotById error...', error);
      return ctx.res.internalServerError({ error });
    }
  },
  deleteById: async (ctx) => {
    try {
      const findResp = await dbService.findOne('clinic', {
        where: { uuid: ctx.request.params.uuid },
      });

      if (!findResp) {
        return ctx.res.notFound({ msg: responseMessages[1178] });
      }
      const deleteResp = await dbService.update('clinic', { status: 'Deleted' }, { where: { uuid: ctx.request.params.uuid, } });
      return ctx.res.ok({ result: deleteResp });
    } catch (error) {
      console.log('\n clinic find error...', error);
      return ctx.res.internalServerError({ error });
    }
  },
  updateRecord: async (ctx) => {
    const transaction = await sequelize.transaction();
    try {
      const { diagnosisType, /* clinicLocation, appointmentType */ } = ctx.request.body;

      let datesToSave = (ctx.request.body.selectedDates || []).map((slotDate) => ({
        uuid: uuidv4(),
        start_time: moment(slotDate).startOf('day').toDate(),
        end_time: moment(slotDate).endOf('day').toDate(),
      }));

      let slotsToSave = datesToSave.map((slotDateData) => (ctx.request.body.selectedSlots || []).map((slotTime) => {
        const slotStartTime = moment(`${moment(new Date(slotDateData.start_time)).format('YYYY-MM-DD')} ${moment(new Date(slotTime)).format('HH:mm:ss')}`).toDate();
        const slotEndTime = moment(new Date(slotStartTime)).add(diagnosisType.slotDuration.duration, 'minutes').set({ seconds: 0 }).toDate();
        return {
          uuid: uuidv4(),
          clinic_time_id: slotDateData.uuid,
          start_time: slotStartTime,
          end_time: slotEndTime,
        };
      })).flat();

      const updatePayload = {
        diagnosis_type_id: ctx.request.body.diagnosis_type_id,
        appointment_type_id: ctx.request.body.appointment_type_id,
        clinic_location_id: ctx.request.body.clinic_location_id,
        clinic_name_id: ctx.request.body.clinic_name_id,
        status: ctx.request.body.status,
        clinic_joining_details: ctx.request.body.clinic_joining_details,
        updated_by: (ctx.req && ctx.req.decoded && ctx.req.decoded.uuid) || ctx.request.body.userId,
        start_time: moment(_.min((slotsToSave || []).map((innerData) => new Date(innerData.start_time)))).toDate(),
        end_time: moment(_.max((slotsToSave || []).map((innerData) => new Date(innerData.end_time)))).toDate()
      };

      const updateResp = await dbService.update('clinic', updatePayload, { where: { uuid: ctx.request.body.uuid }, transaction });

      datesToSave = datesToSave.map((innerData) => ({ ...innerData, clinic_id: ctx.request.body.uuid }));
      slotsToSave = slotsToSave.map((innerData) => ({ ...innerData, clinic_id: ctx.request.body.uuid }));

      // delete all clinic_time and slot
      await dbService.destroy('clinic_time', { where: { clinic_id: ctx.request.body.uuid, } });
      await dbService.destroy('slot', { where: { clinic_id: ctx.request.body.uuid, } });

      const clinicTimeResp = await dbService.bulkCreate('clinic_time', datesToSave, { transaction });

      const slotCreateResp = await dbService.bulkCreate('slot', slotsToSave, { transaction });

      await transaction.commit();

      return ctx.res.ok({ result: { updateResp, clinicTimeResp, slotCreateResp } });
    } catch (error) {
      console.log('\n clinic update error...', error);
      await transaction.rollback();
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
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('diagnosisType.name')), 'LIKE', `%${ctx.request.body.search.toLowerCase()}%`),
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('AppointmentType.name')), 'LIKE', `%${ctx.request.body.search.toLowerCase()}%`),
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('clinicLocation.location')), 'LIKE', `%${ctx.request.body.search.toLowerCase()}%`),
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('clinicName.name')), 'LIKE', `%${ctx.request.body.search.toLowerCase()}%`),
        );
      }

      if (ctx.request.body.locationSearch) {
        andQuery.push(
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('clinicLocation.location')), 'LIKE', `%${ctx.request.body.locationSearch.toLowerCase()}%`),
        );
      }

      if (ctx.request.body.clinicNameSearch) {
        andQuery.push(
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('clinicName.name')), 'LIKE', `%${ctx.request.body.clinicNameSearch.toLowerCase()}%`),
        );
      }

      let clinicianWhereQuery = {};
      if (ctx.request.body.clinicianSearch) {
        clinicianWhereQuery = {
          [Op.and]: [
            Sequelize.where(Sequelize.fn('CONCAT', Sequelize.fn('LOWER', Sequelize.col('createdUser.firstName')), ' ', Sequelize.fn('LOWER', Sequelize.col('createdUser.lastName'))), 'LIKE', `%${ctx.request.body.clinicianSearch.toLowerCase()}%`),
          ]
        };
      }

      if (ctx.request.body.status && ctx.request.body.status.length) {
        whereQuery.status = {
          [Op.in]: ctx.request.body.status
        };
      }

      if (!ctx.request.body.all) {
        whereQuery.created_by = ctx.req.decoded.uuid;
      }

      const countSubQuery = {
        booked: `and ("a"."start_time" > '${moment().toISOString()}')`,
        completed: `and ("a"."start_time" <= '${moment().toISOString()}')`,
        missed: `and ("a"."start_time" <= '${moment().toISOString()}')`,
        totalSlots: `and ("s"."start_time" > '${moment().toISOString()}')`
      };

      switch (ctx.request.body.range) {
        case 'past':
          whereQuery.end_time = { [Op.lt]: new Date() };
          countSubQuery.totalSlots = `and ("s"."end_time" < '${moment().toISOString()}')`;
          countSubQuery.missed = `and ("a"."end_time" <= '${moment().toISOString()}')`;
          countSubQuery.completed = `and ("a"."end_time" <= '${moment().toISOString()}')`;
          countSubQuery.booked = `and ("a"."end_time" <= '${moment().toISOString()}')`;
          break;
        case 'present':
          andQuery.push(
            Sequelize.where(Sequelize.fn('date', Sequelize.col('clinic.start_time')), '<=', moment().format('YYYY-MM-DD')),
            Sequelize.where(Sequelize.fn('date', Sequelize.col('clinic.end_time')), '>=', moment().format('YYYY-MM-DD')),
          );
          countSubQuery.totalSlots = `and ("s"."start_time" >= '${moment().startOf('day').toISOString()}') and ("s"."end_time" <= '${moment().endOf('day').toISOString()}')`;
          countSubQuery.booked = `and ("a"."start_time" >= '${moment().startOf('day').toISOString()}') and ("a"."end_time" <= '${moment().endOf('day').toISOString()}')`;
          break;
        case 'future':
          whereQuery.start_time = { [Op.gt]: new Date() };
          countSubQuery.totalSlots = `and ("s"."start_time" > '${moment().toISOString()}')`;
          countSubQuery.missed = `and ("a"."start_time" <= '${moment().toISOString()}')`;
          countSubQuery.completed = `and ("a"."start_time" <= '${moment().toISOString()}')`;
          countSubQuery.booked = `and ("a"."start_time" > '${moment().toISOString()}')`;
          break;
      }

      if (ctx.request.body.diagnosis_type_id) {
        whereQuery.diagnosis_type_id = ctx.request.body.diagnosis_type_id;
      }

      if (ctx.request.body.appointment_type_id) {
        whereQuery.appointment_type_id = ctx.request.body.appointment_type_id;
      }

      if (ctx.request.body.clinic_location_id) {
        whereQuery.clinic_location_id = ctx.request.body.clinic_location_id;
      }

      if (ctx.request.body.exclude) {
        if (ctx.request.body.exclude.clinic && ctx.request.body.exclude.clinic.length) {
          whereQuery.uuid = {
            [Op.notIn]: ctx.request.body.exclude.clinic
          };
        }
      }

      if (ctx.request.body.clinic_name_id) {
        whereQuery.clinic_name_id = ctx.request.body.clinic_name_id;
      }

      if (andQuery.length) {
        whereQuery[Op.and] = andQuery;
      }

      if (orQuery.length) {
        whereQuery[Op.or] = orQuery;
      }

      const clinicAttributes = [
        'id',
        'uuid',
        'clinic_joining_details',
        'diagnosis_type_id',
        'appointment_type_id',
        'clinic_location_id',
        'clinic_name_id',
        'start_time',
        'end_time',
        'createdAt',
        'created_by',
        'status',
        [Sequelize.cast(Sequelize.literal(`(SELECT count(*) FROM appointment a WHERE (("a"."status"='active') and ("a"."clinic_id"= "clinic"."uuid") ${countSubQuery.booked}))`), 'integer'), 'bookedAppointmentCount'],
        [Sequelize.cast(Sequelize.literal(`(SELECT count(*) FROM appointment a WHERE (("a"."status"='missed') and ("a"."clinic_id"= "clinic"."uuid") ${countSubQuery.missed}))`), 'integer'), 'notAttendedCount'],
        [Sequelize.cast(Sequelize.literal(`(SELECT count(*) FROM appointment a WHERE (("a"."status"='completed') and ("a"."clinic_id"= "clinic"."uuid") ${countSubQuery.completed}))`), 'integer'), 'completedCount'],
        [Sequelize.cast(Sequelize.literal(`(SELECT count(*) FROM slot s WHERE (("s"."status"!='Deleted') and ("s"."clinic_id"= "clinic"."uuid") ${countSubQuery.totalSlots}))`), 'integer'), 'totalSlotsCount'],
      ];

      const findQuery = {
        distinct: true,
        // subQuery: false,
        where: whereQuery,
        offset: ctx.request.body.offset,
        limit: ctx.request.body.limit,
        order: [ctx.request.body.order],
        attributes: clinicAttributes,
        include: [
          {
            model: 'clinic_time',
            as: 'clinicTime',
            attributes: []
          },
          {
            model: 'slot',
            as: 'slot',
            attributes: []
          },
          {
            model: 'diagnosis_type',
            as: 'diagnosisType',
            attributes: ['uuid', 'name']
          },
          {
            model: 'clinic_location',
            as: 'clinicLocation',
            attributes: ['location', 'uuid']
          },
          {
            model: 'clinic_name',
            as: 'clinicName',
            attributes: ['name', 'uuid']
          },
          {
            model: 'appointment_type',
            as: 'AppointmentType',
            attributes: ['uuid', 'name']
          },
          // {
          //   model: 'appointment',
          //   as: 'appointments',
          //   attributes: []
          // },
          {
            model: 'user',
            as: 'createdUser',
            attributes: ['uuid', 'firstName', 'lastName'],
            where: clinicianWhereQuery
          },
        ],
      };

      const { count, rows } = await dbService.findAndCountAll('clinic', findQuery);
      ctx.res.ok({ result: { count, rows } });
      return;
    } catch (error) {
      console.log('\n clinic find error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  getListDashboardCount: async (ctx) => {
    try {
      const whereQuery = {};
      const andQuery = [];
      const orQuery = [];

      if (ctx.request.body.search) {
        orQuery.push(
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('diagnosisType.name')), 'LIKE', `%${ctx.request.body.search.toLowerCase()}%`),
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('AppointmentType.name')), 'LIKE', `%${ctx.request.body.search.toLowerCase()}%`),
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('clinicLocation.location')), 'LIKE', `%${ctx.request.body.search.toLowerCase()}%`),
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('clinicName.name')), 'LIKE', `%${ctx.request.body.search.toLowerCase()}%`),
        );
      }

      if (ctx.request.body.locationSearch) {
        andQuery.push(
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('clinicLocation.location')), 'LIKE', `%${ctx.request.body.locationSearch.toLowerCase()}%`),
        );
      }

      if (ctx.request.body.clinicNameSearch) {
        andQuery.push(
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('clinicName.name')), 'LIKE', `%${ctx.request.body.clinicNameSearch.toLowerCase()}%`),
        );
      }

      let clinicianWhereQuery = {};
      if (ctx.request.body.clinicianSearch) {
        clinicianWhereQuery = {
          [Op.and]: [
            Sequelize.where(Sequelize.fn('CONCAT', Sequelize.fn('LOWER', Sequelize.col('createdUser.firstName')), ' ', Sequelize.fn('LOWER', Sequelize.col('createdUser.lastName'))), 'LIKE', `%${ctx.request.body.clinicianSearch.toLowerCase()}%`),
          ]
        };
      }

      if (ctx.request.body.status && ctx.request.body.status.length) {
        whereQuery.status = {
          [Op.in]: ctx.request.body.status
        };
      }

      if (!ctx.request.body.all) {
        whereQuery.created_by = ctx.req.decoded.uuid;
      }

      const countSubQuery = {
        booked: `and ("a"."start_time" > '${moment().toISOString()}')`,
        completed: `and ("a"."start_time" <= '${moment().toISOString()}')`,
        missed: `and ("a"."start_time" <= '${moment().toISOString()}')`,
        totalSlots: `and ("s"."start_time" > '${moment().toISOString()}')`
      };

      switch (ctx.request.body.range) {
        case 'past':
          whereQuery.end_time = { [Op.lt]: new Date() };
          countSubQuery.totalSlots = `and ("s"."end_time" < '${moment().toISOString()}')`;
          countSubQuery.missed = `and ("a"."end_time" <= '${moment().toISOString()}')`;
          countSubQuery.completed = `and ("a"."end_time" <= '${moment().toISOString()}')`;
          countSubQuery.booked = `and ("a"."end_time" <= '${moment().toISOString()}')`;
          break;
        case 'present':
          andQuery.push(
            Sequelize.where(Sequelize.fn('date', Sequelize.col('clinic.start_time')), '<=', moment().format('YYYY-MM-DD')),
            Sequelize.where(Sequelize.fn('date', Sequelize.col('clinic.end_time')), '>=', moment().format('YYYY-MM-DD')),
          );
          countSubQuery.totalSlots = `and ("s"."start_time" >= '${moment().startOf('day').toISOString()}') and ("s"."end_time" <= '${moment().endOf('day').toISOString()}')`;
          countSubQuery.booked = `and ("a"."start_time" >= '${moment().startOf('day').toISOString()}') and ("a"."end_time" <= '${moment().endOf('day').toISOString()}')`;
          break;
        case 'future':
          // whereQuery.start_time = { [Op.gt]: new Date() };
          countSubQuery.totalSlots = `and ("s"."start_time" > '${moment().toISOString()}')`;
          countSubQuery.missed = `and ("a"."start_time" <= '${moment().toISOString()}')`;
          countSubQuery.completed = `and ("a"."start_time" <= '${moment().toISOString()}')`;
          countSubQuery.booked = `and ("a"."start_time" > '${moment().toISOString()}')`;
          break;
      }

      if (ctx.request.body.diagnosis_type_id) {
        whereQuery.diagnosis_type_id = ctx.request.body.diagnosis_type_id;
      }

      if (ctx.request.body.appointment_type_id) {
        whereQuery.appointment_type_id = ctx.request.body.appointment_type_id;
      }

      if (ctx.request.body.clinic_location_id) {
        whereQuery.clinic_location_id = ctx.request.body.clinic_location_id;
      }

      if (ctx.request.body.exclude) {
        if (ctx.request.body.exclude.clinic && ctx.request.body.exclude.clinic.length) {
          whereQuery.uuid = {
            [Op.notIn]: ctx.request.body.exclude.clinic
          };
        }
      }

      if (ctx.request.body.clinic_name_id) {
        whereQuery.clinic_name_id = ctx.request.body.clinic_name_id;
      }

      if (andQuery.length) {
        whereQuery[Op.and] = andQuery;
      }

      if (orQuery.length) {
        whereQuery[Op.or] = orQuery;
      }

      const clinicAttributes = [
        // [Sequelize.cast(Sequelize.literal('(SELECT count(*) FROM appointment a WHERE (("a"."status"=\'active\') and ("a"."clinic_id"= "clinic"."uuid")))'), 'integer'), 'bookedAppointmentCount'],
        // [Sequelize.cast(Sequelize.literal('(SELECT count(*) FROM appointment a WHERE (("a"."status"=\'missed\') and ("a"."clinic_id"= "clinic"."uuid")))'), 'integer'), 'notAttendedCount'],
        // [Sequelize.cast(Sequelize.literal('(SELECT count(*) FROM appointment a WHERE (("a"."status"=\'completed\') and ("a"."clinic_id"= "clinic"."uuid")))'), 'integer'), 'completedCount'],
        // [Sequelize.cast(Sequelize.literal('(SELECT count(*) FROM slot s WHERE (("s"."status"=\'active\')  and ("s"."clinic_id"= "clinic"."uuid")))'), 'integer'), 'totalSlotsCount'],
        [Sequelize.cast(Sequelize.literal(`(SELECT count(*) FROM appointment a WHERE (("a"."status"!='Deleted') and ("a"."status"!='completed') and ("a"."clinic_id"= "clinic"."uuid") ${countSubQuery.booked}))`), 'integer'), 'bookedAppointmentCount'],
        [Sequelize.cast(Sequelize.literal(`(SELECT count(*) FROM appointment a WHERE (("a"."status"='missed') and ("a"."clinic_id"= "clinic"."uuid") ${countSubQuery.missed}))`), 'integer'), 'notAttendedCount'],
        [Sequelize.cast(Sequelize.literal(`(SELECT count(*) FROM appointment a WHERE (("a"."status"='completed') and ("a"."clinic_id"= "clinic"."uuid") ${countSubQuery.completed}))`), 'integer'), 'completedCount'],
        [Sequelize.cast(Sequelize.literal(`(SELECT count(*) FROM slot s WHERE (("s"."status"!='Deleted') and ("s"."clinic_id"= "clinic"."uuid") ${countSubQuery.totalSlots}))`), 'integer'), 'totalSlotsCount'],
      ];

      const findQuery = {
        distinct: true,
        where: whereQuery,
        attributes: clinicAttributes,
        include: [
          {
            model: 'clinic_time',
            as: 'clinicTime',
            attributes: []
          },
          {
            model: 'slot',
            as: 'slot',
            attributes: []
          },
          {
            model: 'diagnosis_type',
            as: 'diagnosisType',
            attributes: []
          },
          {
            model: 'clinic_location',
            as: 'clinicLocation',
            attributes: []
          },
          {
            model: 'clinic_name',
            as: 'clinicName',
            attributes: []
          },
          {
            model: 'appointment_type',
            as: 'AppointmentType',
            attributes: []
          },
          {
            model: 'user',
            as: 'createdUser',
            attributes: [],
            where: clinicianWhereQuery
          },
        ],
      };

      const rows = await (await dbService.findAll('clinic', findQuery)).map((innerData) => innerData.toJSON());

      const bookedAppointmentCount = commonService.countArr(rows, 'bookedAppointmentCount');
      const completedCount = commonService.countArr(rows, 'completedCount');
      const notAttendedCount = commonService.countArr(rows, 'notAttendedCount');
      const totalSlotsCount = commonService.countArr(rows, 'totalSlotsCount');

      return ctx.res.ok({
        result: {
          bookedAppointmentCount,
          completedCount,
          notAttendedCount,
          totalSlotsCount,
        }
      });
    } catch (error) {
      console.log('\n clinic find error...', error);
      return ctx.res.internalServerError({ error });
    }
  },
};
