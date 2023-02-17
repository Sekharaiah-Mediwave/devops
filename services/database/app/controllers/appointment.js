const commonService = require('../services/common-service');
const dbService = require('../services/db-service');
const { moment, uuidv4 } = require('../services/imports');
const responseMessages = require('../middleware/response-messages');
const { Sequelize } = require('../config/sequelize');
const config = require('../config/config');
const queue = require('../services/queue');
const request = require('../middleware/axios-request');

const { Op } = Sequelize;

module.exports = {
  saveRecord: async (ctx) => {
    try {
      const savePayload = {
        uuid: uuidv4(),
        diagnosis_type_id: ctx.request.body.diagnosis_type_id,
        appointment_type_id: ctx.request.body.appointment_type_id,
        clinic_location_id: ctx.request.body.clinic_location_id,
        clinic_name_id: ctx.request.body.clinic_name_id,
        // appointment_status_id: ctx.request.body.appointment_status_id,
        clinic_id: ctx.request.body.clinic_id,
        slot_id: ctx.request.body.slot_id,
        date: new Date(ctx.request.body.date),
        start_time: new Date(ctx.request.body.start_time),
        end_time: new Date(ctx.request.body.end_time),
        joining_details: ctx.request.body.joining_details,
        booked_to: ctx.request.body.booked_to,
        booked_from: (ctx.req && ctx.req.decoded && ctx.req.decoded.uuid),
        created_by: (ctx.req && ctx.req.decoded && ctx.req.decoded.uuid),
      };

      if ([config.roleNames.a, config.roleNames.sa].includes(ctx.req.decoded.role)) {
        if (ctx.request.body.booked_from) {
          savePayload.booked_from = ctx.request.body.booked_from;
        }
      }

      const saveResp = await dbService.create('appointment', savePayload, {});
      const slotStatusUpdate = await dbService.update('slot', { status: 'booked', availability: false }, { where: { uuid: ctx.request.body.slot_id } });

      const savedUser = await dbService.findOne('user', { where: { uuid: ctx.req.decoded.uuid } });

      const { toUser, fromUser } = ctx.request.body;

      const notify = {
        queueType: 'in-app',
        queueKeyName: config.queueChannel.notification,
        payload: {
          user_id: ctx.req.decoded?.uuid,
          subject: 'New Appointment',
          message: `you have a new appointment from ${(fromUser || savedUser).firstName} ${(fromUser || savedUser).lastName}`,
          notification_type: 'appointment_action',
          schedule_type: 'direct',
          send_to: [{
            email: toUser.email,
            firstName: toUser.firstName,
            lastName: toUser.lastName
          }],
          month: null,
          week_day: null,
          day: null,
          time: new Date().toISOString(),
          end_date: null
        },
      };
      console.log('notify', notify);
      await queue.AddToQueue({
        ...notify,
        url: `${config.notificationUrl}/notification`,
      });

      return ctx.res.ok({ result: saveResp });
    } catch (error) {
      console.log('\n appointment save error...', error);
      return ctx.res.internalServerError({ error });
    }
  },
  amendBooking: async (ctx) => {
    try {
      const savePayload = {
        uuid: uuidv4(),
        diagnosis_type: ctx.request.body?.diagnosis_type,
        urgency_type: ctx.request.body?.urgency_type,
        clinic_id: ctx.request.body.clinic_id,
        date: ctx.request.body.date,
        status: 'booked',
        patient_id: ctx.request.body.patient_id,
        start_time: ctx.request.body.start_time,
        end_time: ctx.request.body.end_time,
        created_by: (ctx.req && ctx.req.decoded && ctx.req.decoded.uuid) || ctx.request.body.userId,
      };

      const saveResp = await dbService.create('appointment', savePayload, {});
      // update slot status

      ctx.res.ok({ result: saveResp });
      return;
    } catch (error) {
      console.log('\n appointment save error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  getById: async (ctx) => {
    try {
      const findResp = await dbService.findOne('appointment', {
        where: { uuid: ctx.request.params.uuid },
        include: [
          {
            model: 'user',
            as: 'createdUser',
            attributes: ['uuid', 'firstName', 'lastName', 'email'],
          },
          {
            model: 'user',
            as: 'bookedFrom',
            required: false,
            attributes: ['uuid', 'firstName', 'lastName', 'email'],
            include: [{
              model: 'user_role',
              as: 'userRole',
              required: true,
              attributes: ['uuid'],
              include: [{
                model: 'roles',
                as: 'roleInfo',
                required: true,
                attributes: ['name'],
              }]
            }]
          },
          {
            model: 'user',
            as: 'bookedTo',
            required: false,
            attributes: ['uuid', 'firstName', 'lastName', 'email'],
            include: [{
              model: 'user_role',
              as: 'userRole',
              required: true,
              attributes: ['uuid'],
              include: [{
                model: 'roles',
                as: 'roleInfo',
                required: true,
                attributes: ['name'],
              }]
            }]
          },
          {
            model: 'user',
            as: 'cancelledUser',
            attributes: ['uuid', 'firstName', 'lastName'],
            required: false
          },
          {
            model: 'user',
            as: 'updatedUser',
            attributes: ['uuid', 'firstName', 'lastName'],
            required: false
          },
          {
            model: 'clinic',
            as: 'clinicDetails',
          },
          {
            model: 'slot',
            as: 'slot',
          },
          {
            model: 'appointment_status',
            as: 'appointmentStatus',
            required: false
          },
          {
            model: 'diagnosis_type',
            as: 'diagnosisType',
          },
          {
            model: 'clinic_location',
            as: 'clinicLocation',
          },
          {
            model: 'clinic_name',
            as: 'clinicName',
          },
          {
            model: 'appointment_type',
            as: 'appointmentType',
          },
        ],
      });

      if (!findResp) {
        ctx.res.notFound({ msg: responseMessages[1183] });
        return;
      }

      ctx.res.ok({ result: findResp });
      return;
    } catch (error) {
      console.log('\n appointment find error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  cancelAppointment: async (ctx) => {
    try {
      let orQuery = [{
        booked_from: ctx.req.decoded.uuid
      },
      {
        booked_to: ctx.req.decoded.uuid
      }];

      const findQuery = {
        where: {
          uuid: ctx.request.body.uuid,
        },
        include: [
          {
            model: 'user',
            as: 'bookedFrom',
            required: false,
            attributes: ['uuid', 'firstName', 'lastName', 'email'],
            include: [{
              model: 'user_role',
              as: 'userRole',
              required: true,
              attributes: ['uuid'],
              include: [{
                model: 'roles',
                as: 'roleInfo',
                required: true,
                attributes: ['name'],
              }]
            }]
          },
          {
            model: 'user',
            as: 'bookedTo',
            required: false,
            attributes: ['uuid', 'firstName', 'lastName', 'email'],
            include: [{
              model: 'user_role',
              as: 'userRole',
              required: true,
              attributes: ['uuid'],
              include: [{
                model: 'roles',
                as: 'roleInfo',
                required: true,
                attributes: ['name'],
              }]
            }]
          },
        ]
      };

      if ([config.roleNames.a, config.roleNames.sa].includes(ctx.req.decoded.role)) {
        orQuery = [];
      }

      if (orQuery.length) {
        findQuery.where[Op.or] = orQuery;
      }

      const findResp = await dbService.findOne('appointment', findQuery);

      if (!findResp) {
        return ctx.res.notFound({ msg: responseMessages[1206] });
      }

      if (findResp.status == 'cancelled') {
        return ctx.res.conflict({ msg: responseMessages[1207] });
      }

      const updatePayload = {
        status: 'cancelled',
        appointment_status_id: ctx.request.body.appointment_status_id,
        cancellation_reason: ctx.request.body.cancellation_reason,
        updated_by: ctx.req.decoded.uuid,
        cancelled_by: ctx.req.decoded.uuid,
      };

      const updateResp = await dbService.update('appointment', updatePayload, { where: { uuid: findResp.uuid, } });
      const slotStatusUpdate = await dbService.update('slot', { status: 'active', availability: true }, { where: { uuid: findResp.slot_id } });

      const cancelledUser = await dbService.findOne('user', { where: { uuid: ctx.req.decoded.uuid } });

      if (ctx.req.decoded.uuid != findResp.bookedFrom.uuid) {
        const notify = {
          queueType: 'in-app',
          queueKeyName: config.queueChannel.notification,
          payload: {
            user_id: ctx.req.decoded?.uuid,
            subject: 'Appointment Cancelled',
            message: `your appointment has been cancelled by ${cancelledUser.firstName} ${cancelledUser.lastName}`,
            notification_type: 'appointment_action',
            schedule_type: 'direct',
            send_to: [{
              email: findResp.bookedFrom.email,
              firstName: findResp.bookedFrom.firstName,
              lastName: findResp.bookedFrom.lastName
            }],
            month: null,
            week_day: null,
            day: null,
            time: new Date().toISOString(),
            end_date: null
          },
        };
        await queue.AddToQueue({ ...notify, url: `${config.notificationUrl}/notification`, });
        // const emailPayload = {
        //   email: ctx.request.body.email,
        //   cancelledUser,
        //   appointmentData: findResp
        // };
        // request.post('', `${config.emailUrl}/email/appointment/cancelled`, emailPayload, commonService.setHeaders(ctx.request.headers, ['authorization']));
      }
      if (ctx.req.decoded.uuid != findResp.bookedTo.uuid) {
        const notify = {
          queueType: 'in-app',
          queueKeyName: config.queueChannel.notification,
          payload: {
            user_id: ctx.req.decoded.uuid,
            subject: 'Appointment Cancelled',
            message: `your appointment has been cancelled by ${cancelledUser.firstName} ${cancelledUser.lastName}`,
            notification_type: 'appointment_action',
            schedule_type: 'direct',
            send_to: [{
              email: findResp.bookedTo.email,
              firstName: findResp.bookedTo.firstName,
              lastName: findResp.bookedTo.lastName
            }],
            month: null,
            week_day: null,
            day: null,
            time: new Date().toISOString(),
            end_date: null
          },
        };
        await queue.AddToQueue({ ...notify, url: `${config.notificationUrl}/notification`, });
      }

      return ctx.res.ok({ result: updateResp });
    } catch (error) {
      console.log('\n appointment find error...', error);
      return ctx.res.internalServerError({ error });
    }
  },
  updateAppointment: async (ctx) => {
    try {
      const updatePayload = {
        notes: ctx.request.body.notes,
        updated_by: (ctx.req && ctx.req.decoded && ctx.req.decoded.uuid),
        status: ctx.request.body.status
      };

      if (ctx.request.body.appointment_status_id) {
        updatePayload.appointment_status_id = ctx.request.body.appointment_status_id;
      }

      const updateResp = await dbService.update('appointment', updatePayload, { where: { uuid: ctx.request.body.uuid }, individualHooks: true }, {});
      if (!updateResp) {
        return ctx.res.forbidden({ msg: responseMessages[1175] });
      }

      return ctx.res.ok({ result: updateResp });
    } catch (error) {
      console.log('\n appointment update error...', error);
      return ctx.res.internalServerError({ error });
    }
  },
  updateMissedAppointment: async (ctx) => {
    try {
      const updatePayload = {
        status: 'missed'
      };

      const updateResp = await dbService.update('appointment', updatePayload, { where: { uuid: { [Op.in]: ctx.request.body.apptIds } }, individualHooks: true }, {});

      return ctx.res.ok({ result: updateResp });
    } catch (error) {
      console.log('\n updateMissedAppointment error...', error);
      return ctx.res.internalServerError({ error });
    }
  },
  getList: async (ctx) => {
    try {
      const whereQuery = {};
      const andQuery = [];
      let userIdOrQuery = [{
        booked_from: ctx.req.decoded.uuid
      },
      {
        booked_to: ctx.req.decoded.uuid
      }];

      if ([config.roleNames.a, config.roleNames.sa].includes(ctx.req.decoded.role)) {
        if (ctx.request.body.user_id) {
          userIdOrQuery = [{
            booked_from: ctx.request.body.user_id
          },
          {
            booked_to: ctx.request.body.user_id
          }];
        }
      }

      if ([config.roleNames.cl].includes(ctx.req.decoded.role)) {
        if (ctx.request.body.user_id) {
          userIdOrQuery = [{
            booked_from: ctx.request.body.user_id,
            booked_to: ctx.req.decoded.uuid
          },
          {
            booked_from: ctx.req.decoded.uuid,
            booked_to: ctx.request.body.user_id
          }];
        }
      }

      if ([config.roleNames.a, config.roleNames.sa].includes(ctx.req.decoded.role)) {
        if (ctx.request.body.all) {
          userIdOrQuery = [];
        }
      }

      if (ctx.request.body.amendList) {
        andQuery.push(
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('createdUser.userRole.roleInfo.name')), '!=', `${config.roleNames.p.toLowerCase()}`),
        );
      }

      const orQuery = userIdOrQuery;

      if (ctx.request.body.search) {
        orQuery.push(
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('diagnosisType.name')), 'LIKE', `%${ctx.request.body.search.toLowerCase()}%`),
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('appointmentType.name')), 'LIKE', `%${ctx.request.body.search.toLowerCase()}%`),
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

      if (ctx.request.body.patientSearch) {
        andQuery.push(
          {
            [Op.or]: [
              {
                [Op.and]: [
                  Sequelize.where(Sequelize.fn('CONCAT', Sequelize.fn('LOWER', Sequelize.col('bookedFrom.firstName')), ' ', Sequelize.fn('LOWER', Sequelize.col('bookedFrom.lastName'))), 'LIKE', `%${ctx.request.body.patientSearch.toLowerCase()}%`),
                  Sequelize.where(Sequelize.col('bookedFrom.userRole.roleInfo.name'), `${config.roleNames.p}`),
                ]
              },
              {
                [Op.and]: [
                  Sequelize.where(Sequelize.fn('CONCAT', Sequelize.fn('LOWER', Sequelize.col('bookedTo.firstName')), ' ', Sequelize.fn('LOWER', Sequelize.col('bookedTo.lastName'))), 'LIKE', `%${ctx.request.body.patientSearch.toLowerCase()}%`),
                  Sequelize.where(Sequelize.col('bookedTo.userRole.roleInfo.name'), `${config.roleNames.p}`),
                ]
              },
            ]
          },
        );
      }

      if (ctx.request.body.status && ctx.request.body.status.length) {
        whereQuery.status = {
          [Op.in]: ctx.request.body.status
        };
      }

      if (ctx.request.body.fromDate && ctx.request.body.toDate) {
        andQuery.push({
          [Op.or]: [

            {
              [Op.and]: [
                Sequelize.where(Sequelize.fn('date', Sequelize.col('appointment.start_time')), '>=', moment(new Date(ctx.request.body.fromDate)).format('YYYY-MM-DD')),
                Sequelize.where(Sequelize.fn('date', Sequelize.col('appointment.start_time')), '<=', moment(new Date(ctx.request.body.toDate)).format('YYYY-MM-DD')),
                Sequelize.where(Sequelize.fn('date', Sequelize.col('appointment.end_time')), '>=', moment(new Date(ctx.request.body.fromDate)).format('YYYY-MM-DD')),
                Sequelize.where(Sequelize.fn('date', Sequelize.col('appointment.end_time')), '<=', moment(new Date(ctx.request.body.toDate)).format('YYYY-MM-DD')),
              ]
            },
            {
              [Op.and]: [
                Sequelize.where(Sequelize.fn('date', Sequelize.col('appointment.start_time')), '<=', moment(new Date(ctx.request.body.fromDate)).format('YYYY-MM-DD')),
                Sequelize.where(Sequelize.fn('date', Sequelize.col('appointment.start_time')), '<=', moment(new Date(ctx.request.body.toDate)).format('YYYY-MM-DD')),
                Sequelize.where(Sequelize.fn('date', Sequelize.col('appointment.end_time')), '>=', moment(new Date(ctx.request.body.fromDate)).format('YYYY-MM-DD')),
                Sequelize.where(Sequelize.fn('date', Sequelize.col('appointment.end_time')), '<=', moment(new Date(ctx.request.body.toDate)).format('YYYY-MM-DD')),
              ]
            },
            {
              [Op.and]: [
                Sequelize.where(Sequelize.fn('date', Sequelize.col('appointment.start_time')), '<=', moment(new Date(ctx.request.body.fromDate)).format('YYYY-MM-DD')),
                Sequelize.where(Sequelize.fn('date', Sequelize.col('appointment.start_time')), '<=', moment(new Date(ctx.request.body.toDate)).format('YYYY-MM-DD')),
                Sequelize.where(Sequelize.fn('date', Sequelize.col('appointment.end_time')), '>=', moment(new Date(ctx.request.body.fromDate)).format('YYYY-MM-DD')),
                Sequelize.where(Sequelize.fn('date', Sequelize.col('appointment.end_time')), '>=', moment(new Date(ctx.request.body.toDate)).format('YYYY-MM-DD')),
              ]
            },
            {
              [Op.and]: [
                Sequelize.where(Sequelize.fn('date', Sequelize.col('appointment.start_time')), '>=', moment(new Date(ctx.request.body.fromDate)).format('YYYY-MM-DD')),
                Sequelize.where(Sequelize.fn('date', Sequelize.col('appointment.start_time')), '<=', moment(new Date(ctx.request.body.toDate)).format('YYYY-MM-DD')),
                Sequelize.where(Sequelize.fn('date', Sequelize.col('appointment.end_time')), '>=', moment(new Date(ctx.request.body.fromDate)).format('YYYY-MM-DD')),
                Sequelize.where(Sequelize.fn('date', Sequelize.col('appointment.end_time')), '>=', moment(new Date(ctx.request.body.toDate)).format('YYYY-MM-DD')),
              ]
            },
          ]
        });
      }

      switch (ctx.request.body.range) {
        case 'past':
          whereQuery.end_time = { [Op.lt]: new Date() };
          break;
        case 'present':
          whereQuery.start_time = { [Op.gt]: moment(new Date()).startOf('day').toDate() };
          whereQuery.end_time = { [Op.lt]: moment(new Date()).endOf('day').toDate() };
          break;
        case 'future':
          whereQuery.start_time = { [Op.gt]: new Date() };
          break;
      }

      if (ctx.request.body.diagnosis_type_id && ctx.request.body.diagnosis_type_id.length) {
        whereQuery.diagnosis_type_id = {
          [Op.in]: ctx.request.body.diagnosis_type_id
        };
      }

      if (ctx.request.body.appointment_type_id && ctx.request.body.appointment_type_id.length) {
        whereQuery.appointment_type_id = {
          [Op.in]: ctx.request.body.appointment_type_id
        };
      }

      if (ctx.request.body.clinic_id && ctx.request.body.clinic_id.length) {
        whereQuery.clinic_id = {
          [Op.in]: ctx.request.body.clinic_id
        };
      }

      if (ctx.request.body.clinic_location_id && ctx.request.body.clinic_location_id.length) {
        whereQuery.clinic_location_id = {
          [Op.in]: ctx.request.body.clinic_location_id
        };
      }

      if (ctx.request.body.clinic_name_id && ctx.request.body.clinic_name_id.length) {
        whereQuery.clinic_name_id = {
          [Op.in]: ctx.request.body.clinic_name_id
        };
      }

      if (ctx.request.body.exclude) {
        if (ctx.request.body.exclude.clinic && ctx.request.body.exclude.clinic.length) {
          whereQuery.uuid = {
            [Op.notIn]: ctx.request.body.exclude.clinic
          };
        }
      }

      if (andQuery.length) {
        whereQuery[Op.and] = andQuery;
      }

      if (orQuery.length) {
        whereQuery[Op.or] = orQuery;
      }

      const findQuery = {
        distinct: true,
        where: whereQuery,
        offset: ctx.request.body.offset,
        limit: ctx.request.body.limit,
        order: [ctx.request.body.order],
        include: [
          {
            model: 'slot',
            as: 'slot',
            attributes: ['uuid', 'start_time', 'end_time', 'status']
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
            as: 'appointmentType',
            attributes: ['uuid', 'name']
          },
          {
            model: 'appointment_status',
            as: 'appointmentStatus',
            attributes: ['uuid', 'name'],
            required: false
          },
          // {
          //   model: 'user',
          //   as: 'cancelledUser',
          //   attributes: ['uuid', 'firstName', 'lastName'],
          //   required: false
          // },
          {
            model: 'user',
            as: 'createdUser',
            attributes: ['uuid', 'firstName', 'lastName'],
            required: false,
            include: [{
              model: 'user_role',
              as: 'userRole',
              required: true,
              attributes: ['uuid'],
              include: [{
                model: 'roles',
                as: 'roleInfo',
                required: true,
                attributes: ['name'],
              }]
            }]
          },
          {
            model: 'user',
            as: 'bookedFrom',
            required: false,
            attributes: ['uuid', 'firstName', 'lastName', 'email'],
            include: [{
              model: 'user_role',
              as: 'userRole',
              required: true,
              attributes: ['uuid'],
              include: [{
                model: 'roles',
                as: 'roleInfo',
                required: true,
                attributes: ['name'],
              }]
            }]
          },
          {
            model: 'user',
            as: 'bookedTo',
            required: false,
            attributes: ['uuid', 'firstName', 'lastName', 'email'],
            include: [{
              model: 'user_role',
              as: 'userRole',
              required: true,
              attributes: ['uuid'],
              include: [{
                model: 'roles',
                as: 'roleInfo',
                required: true,
                attributes: ['name'],
              }]
            }]
          },
        ],
      };

      console.log('findQuery', findQuery);
      const { count, rows } = await dbService.findAndCountAll('appointment', findQuery);
      return ctx.res.ok({ result: { count, rows } });
    } catch (error) {
      console.log('\n appointment find list error...', error);
      return ctx.res.internalServerError({ error });
    }
  },
  getAllList: async (ctx) => {
    try {
      const whereQuery = {};
      const andQuery = [];
      let userIdOrQuery = [];

      if (!ctx.request.body.fromCron) {
        userIdOrQuery = [{
          booked_from: ctx.req.decoded.uuid
        },
        {
          booked_to: ctx.req.decoded.uuid
        }];
        if ([config.roleNames.a, config.roleNames.sa].includes(ctx.req.decoded.role)) {
          if (ctx.request.body.user_id) {
            userIdOrQuery = [{
              booked_from: ctx.request.body.user_id
            },
            {
              booked_to: ctx.request.body.user_id
            }];
          }
        }

        if ([config.roleNames.cl].includes(ctx.req.decoded.role)) {
          if (ctx.request.body.user_id) {
            userIdOrQuery = [{
              booked_from: ctx.request.body.user_id,
              booked_to: ctx.req.decoded.uuid
            },
            {
              booked_from: ctx.req.decoded.uuid,
              booked_to: ctx.request.body.user_id
            }];
          }
        }

        if ([config.roleNames.a, config.roleNames.sa].includes(ctx.req.decoded.role)) {
          if (ctx.request.body.all) {
            userIdOrQuery = [];
          }
        }
      }

      const orQuery = userIdOrQuery;

      if (ctx.request.body.status && ctx.request.body.status.length) {
        whereQuery.status = {
          [Op.in]: ctx.request.body.status
        };
      }

      if (ctx.request.body.fromDate && ctx.request.body.toDate) {
        andQuery.push({
          [Op.or]: [
            {
              [Op.and]: [
                Sequelize.where(Sequelize.fn('date', Sequelize.col('appointment.start_time')), '>=', moment(new Date(ctx.request.body.fromDate)).format('YYYY-MM-DD')),
                Sequelize.where(Sequelize.fn('date', Sequelize.col('appointment.start_time')), '<=', moment(new Date(ctx.request.body.toDate)).format('YYYY-MM-DD')),
                Sequelize.where(Sequelize.fn('date', Sequelize.col('appointment.end_time')), '>=', moment(new Date(ctx.request.body.fromDate)).format('YYYY-MM-DD')),
                Sequelize.where(Sequelize.fn('date', Sequelize.col('appointment.end_time')), '<=', moment(new Date(ctx.request.body.toDate)).format('YYYY-MM-DD')),
              ]
            },
            {
              [Op.and]: [
                Sequelize.where(Sequelize.fn('date', Sequelize.col('appointment.start_time')), '<=', moment(new Date(ctx.request.body.fromDate)).format('YYYY-MM-DD')),
                Sequelize.where(Sequelize.fn('date', Sequelize.col('appointment.start_time')), '<=', moment(new Date(ctx.request.body.toDate)).format('YYYY-MM-DD')),
                Sequelize.where(Sequelize.fn('date', Sequelize.col('appointment.end_time')), '>=', moment(new Date(ctx.request.body.fromDate)).format('YYYY-MM-DD')),
                Sequelize.where(Sequelize.fn('date', Sequelize.col('appointment.end_time')), '<=', moment(new Date(ctx.request.body.toDate)).format('YYYY-MM-DD')),
              ]
            },
            {
              [Op.and]: [
                Sequelize.where(Sequelize.fn('date', Sequelize.col('appointment.start_time')), '<=', moment(new Date(ctx.request.body.fromDate)).format('YYYY-MM-DD')),
                Sequelize.where(Sequelize.fn('date', Sequelize.col('appointment.start_time')), '<=', moment(new Date(ctx.request.body.toDate)).format('YYYY-MM-DD')),
                Sequelize.where(Sequelize.fn('date', Sequelize.col('appointment.end_time')), '>=', moment(new Date(ctx.request.body.fromDate)).format('YYYY-MM-DD')),
                Sequelize.where(Sequelize.fn('date', Sequelize.col('appointment.end_time')), '>=', moment(new Date(ctx.request.body.toDate)).format('YYYY-MM-DD')),
              ]
            },
            {
              [Op.and]: [
                Sequelize.where(Sequelize.fn('date', Sequelize.col('appointment.start_time')), '>=', moment(new Date(ctx.request.body.fromDate)).format('YYYY-MM-DD')),
                Sequelize.where(Sequelize.fn('date', Sequelize.col('appointment.start_time')), '<=', moment(new Date(ctx.request.body.toDate)).format('YYYY-MM-DD')),
                Sequelize.where(Sequelize.fn('date', Sequelize.col('appointment.end_time')), '>=', moment(new Date(ctx.request.body.fromDate)).format('YYYY-MM-DD')),
                Sequelize.where(Sequelize.fn('date', Sequelize.col('appointment.end_time')), '>=', moment(new Date(ctx.request.body.toDate)).format('YYYY-MM-DD')),
              ]
            },
          ]
        });
      }

      switch (ctx.request.body.range) {
        case 'past':
          whereQuery.end_time = { [Op.lt]: new Date() };
          break;
        case 'present':
          // whereQuery.start_time = { [Op.lte]: new Date() };
          // whereQuery.end_time = { [Op.gte]: new Date() };
          andQuery.push(
            Sequelize.where(Sequelize.fn('date', Sequelize.col('appointment.start_time')), '<=', moment().format('YYYY-MM-DD')),
            Sequelize.where(Sequelize.fn('date', Sequelize.col('appointment.end_time')), '>=', moment().format('YYYY-MM-DD')),
          );
          break;
        case 'future':
          whereQuery.start_time = { [Op.gt]: new Date() };
          break;
      }

      if (ctx.request.body.exclude) {
        if (ctx.request.body.exclude.clinic && ctx.request.body.exclude.clinic.length) {
          whereQuery.uuid = {
            [Op.notIn]: ctx.request.body.exclude.clinic
          };
        }
      }

      if (andQuery.length) {
        whereQuery[Op.and] = andQuery;
      }

      if (orQuery.length) {
        whereQuery[Op.or] = orQuery;
      }

      const findQuery = {
        distinct: true,
        where: whereQuery,
        order: [ctx.request.body.order],
        include: [
          {
            model: 'slot',
            as: 'slot',
            attributes: ['uuid', 'start_time', 'end_time']
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
            as: 'appointmentType',
            attributes: ['uuid', 'name']
          },
          {
            model: 'appointment_status',
            as: 'appointmentStatus',
            attributes: ['uuid', 'name'],
            required: false
          },
          {
            model: 'user',
            as: 'createdUser',
            attributes: ['uuid', 'firstName', 'lastName'],
            required: false,
            include: [{
              model: 'user_role',
              as: 'userRole',
              required: true,
              attributes: ['uuid'],
              include: [{
                model: 'roles',
                as: 'roleInfo',
                required: true,
                attributes: ['name'],
              }]
            }]
          },
          {
            model: 'user',
            as: 'bookedFrom',
            required: false,
            attributes: ['uuid', 'firstName', 'lastName', 'email'],
            include: [{
              model: 'user_role',
              as: 'userRole',
              required: true,
              attributes: ['uuid'],
              include: [{
                model: 'roles',
                as: 'roleInfo',
                required: true,
                attributes: ['name'],
              }]
            }]
          },
          {
            model: 'user',
            as: 'bookedTo',
            required: false,
            attributes: ['uuid', 'firstName', 'lastName', 'email'],
            include: [{
              model: 'user_role',
              as: 'userRole',
              required: true,
              attributes: ['uuid'],
              include: [{
                model: 'roles',
                as: 'roleInfo',
                required: true,
                attributes: ['name'],
              }]
            }]
          },
        ],
      };

      const { count, rows } = await dbService.findAndCountAll('appointment', findQuery);
      return ctx.res.ok({ result: { count, rows } });
    } catch (error) {
      console.log('\n appointment find all list error...', error);
      return ctx.res.internalServerError({ error });
    }
  },
  checkSlotBooked: async (ctx) => {
    try {
      const whereQuery = {
        status: {
          [Op.notIn]: ['cancelled', 'Deleted']
        }
      };
      const orQuery = [{
        start_time: {
          [Op.lte]: new Date(ctx.request.query.startDate)
        },
        end_time: {
          [Op.gte]: new Date(ctx.request.query.startDate)
        },
      },
      {
        start_time: {
          [Op.lte]: new Date(ctx.request.query.endDate)
        },
        end_time: {
          [Op.gte]: new Date(ctx.request.query.endDate)
        },
      },];
      const andQuery = [];

      if (ctx.request.query.clinic_id) {
        whereQuery.clinic_id = ctx.request.query.clinic_id;
      }

      if (ctx.request.query.appointment_type_id) {
        whereQuery.appointment_type_id = ctx.request.query.appointment_type_id;
      }

      if (ctx.request.query.clinic_name_id) {
        whereQuery.clinic_name_id = ctx.request.query.clinic_name_id;
      }

      if (ctx.request.query.diagnosis_type_id) {
        whereQuery.diagnosis_type_id = ctx.request.query.diagnosis_type_id;
      }

      if (ctx.request.query.clinic_location_id) {
        whereQuery.clinic_location_id = ctx.request.query.clinic_location_id;
      }

      if (orQuery.length) {
        whereQuery[Op.or] = orQuery;
      }

      if (andQuery.length) {
        whereQuery[Op.and] = andQuery;
      }

      const findQuery = {
        where: whereQuery,
      };

      const findResp = await dbService.findOne('appointment', findQuery);
      if (findResp) {
        return ctx.res.ok({ result: { slotExists: false } });
      }
      return ctx.res.ok({ result: { slotExists: true } });
    } catch (error) {
      console.log('\n appointment check slot error...', error);
      return ctx.res.internalServerError({ error });
    }
  },
};
