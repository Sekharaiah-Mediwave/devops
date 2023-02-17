const config = require('../config/config');
const commonService = require('../services/common-service');
const appointmentValidator = require('../validators/appointment');
const request = require('../middleware/axios-request');
const responseMessages = require('../middleware/response-messages');
const { moment } = require('../services/imports');

const isOdd = (num) => { return num % 2; };

module.exports = {
  getList: async (ctx) => {
    try {
      const reqBody = ctx.request.query;
      if (reqBody.status) {
        reqBody.status = reqBody.status.split(',').map(statusData => statusData.trim());
      }
      if (reqBody.clinic_name_id) {
        reqBody.clinic_name_id = reqBody.clinic_name_id.split(',').map(innerData => innerData.trim());
      }
      if (reqBody.appointment_type_id) {
        reqBody.appointment_type_id = reqBody.appointment_type_id.split(',').map(innerData => innerData.trim());
      }
      if (reqBody.diagnosis_type_id) {
        reqBody.diagnosis_type_id = reqBody.diagnosis_type_id.split(',').map(innerData => innerData.trim());
      }
      if (reqBody.clinic_location_id) {
        reqBody.clinic_location_id = reqBody.clinic_location_id.split(',').map(innerData => innerData.trim());
      }
      if (reqBody.clinic_id) {
        reqBody.clinic_id = reqBody.clinic_id.split(',').map(innerData => innerData.trim());
      }

      const { error, validatedData } = await appointmentValidator.validateGetList(reqBody);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }

      let pageNo = 1;
      validatedData.limit = validatedData.itemsPerPage ? validatedData.itemsPerPage : 10;
      let sortArr = ['createdAt', 'DESC'];
      let fieldSplitArr = [];
      if (validatedData.pageNo) {
        const temp = parseInt(validatedData.pageNo);
        if (temp && !isNaN(temp)) {
          pageNo = (temp - 1);
        }
      }
      validatedData.offset = pageNo * validatedData.limit;
      if (validatedData.sortField) {
        fieldSplitArr = validatedData.sortField.split('.');
        if (fieldSplitArr.length == 1) {
          sortArr[0] = validatedData.sortField;
        } else {
          for (let idx = 0; idx < fieldSplitArr.length; idx++) {
            const element = fieldSplitArr[idx];
            fieldSplitArr[idx] = element.replace(/\[\/?.+?\]/ig, '');
          }
          sortArr = fieldSplitArr;
        }
      }

      if (validatedData.sortOrder) {
        if ((fieldSplitArr.length == 1) || (fieldSplitArr.length == 0)) {
          sortArr[1] = validatedData.sortOrder;
        } else {
          sortArr.push(validatedData.sortOrder);
        }
      }
      validatedData.order = sortArr;

      const postResp = await request.post('', `${ctx.req.hitUrl}`, validatedData, commonService.setHeaders(ctx.request.headers, ['authorization']));
      return ctx.res.success({
        ...postResp.data,
        statusCode: postResp.status,
      });
    } catch (error) {
      if (error.status) {
        if (error.status < 500) {
          return ctx.res.clientError({
            ...error.error,
            statusCode: error.status,
          });
        } else {
          return ctx.res.internalServerError({ ...error.error });
        }
      } else {
        return ctx.res.internalServerError({ error });
      }
    }
  },
  getAllList: async (ctx) => {
    try {
      const reqBody = ctx.request.query;
      if (reqBody.status) {
        reqBody.status = reqBody.status.split(',').map(statusData => statusData.trim());
      }

      const { error, validatedData } = await appointmentValidator.validateGetAllList(reqBody);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }


      let sortArr = ['createdAt', 'DESC'];
      let fieldSplitArr = [];

      if (validatedData.sortField) {
        fieldSplitArr = validatedData.sortField.split('.');
        if (fieldSplitArr.length == 1) {
          sortArr[0] = validatedData.sortField;
        } else {
          for (let idx = 0; idx < fieldSplitArr.length; idx++) {
            const element = fieldSplitArr[idx];
            fieldSplitArr[idx] = element.replace(/\[\/?.+?\]/ig, '');
          }
          sortArr = fieldSplitArr;
        }
      }

      if (validatedData.sortOrder) {
        if ((fieldSplitArr.length == 1) || (fieldSplitArr.length == 0)) {
          sortArr[1] = validatedData.sortOrder;
        } else {
          sortArr.push(validatedData.sortOrder);
        }
      }
      validatedData.order = sortArr;

      const postResp = await request.post('', `${ctx.req.hitUrl}`, validatedData, commonService.setHeaders(ctx.request.headers, ['authorization']));
      return ctx.res.success({
        ...postResp.data,
        statusCode: postResp.status,
      });
    } catch (error) {
      console.log('\n get all error...', error);
      if (error.status) {
        if (error.status < 500) {
          return ctx.res.clientError({
            ...error.error,
            statusCode: error.status,
          });
        } else {
          return ctx.res.internalServerError({ ...error.error });
        }
      } else {
        return ctx.res.internalServerError({ error });
      }
    }
  },
  checkSlotBooked: async (ctx) => {
    try {
      const { error } = await appointmentValidator.validateCheckSlotBooked(ctx.request.query);
      if (error) {
        return ctx.res.unprocessableEntity({ error });
      }
      const apiResp = await request.get(ctx, `${ctx.req.hitUrl}`);

      return ctx.res.success({ ...apiResp.data, statusCode: apiResp.status, });
    } catch (error) {
      if (error.status) {
        if (error.status < 500) {
          return ctx.res.clientError({ ...error.error, statusCode: error.status, });
        } else {
          return ctx.res.internalServerError({ ...error.error });
        }
      } else {
        return ctx.res.internalServerError({ error });
      }
    }
  },
  getById: async (ctx) => {
    try {
      const { error } = await appointmentValidator.validateGetById(ctx.request.params);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }
      const apiResp = await request.get(ctx, `${ctx.req.hitUrl}`);

      ctx.res.success({
        ...apiResp.data,
        statusCode: apiResp.status,
      });
    } catch (error) {
      if (error.status) {
        if (error.status < 500) {
          ctx.res.clientError({
            ...error.error,
            statusCode: error.status,
          });
        } else {
          ctx.res.internalServerError({ ...error.error });
        }
      } else {
        ctx.res.internalServerError({ error });
      }
    }
  },
  cancelAppointment: async (ctx) => {
    try {
      const { error, validatedData } = await appointmentValidator.validateCancel(ctx.request.body);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }
      const apiResp = await request.put(ctx, `${ctx.req.hitUrl}`, validatedData);

      return ctx.res.success({ ...apiResp.data, statusCode: apiResp.status, });
    } catch (error) {
      if (error.status) {
        if (error.status < 500) {
          return ctx.res.clientError({ ...error.error, statusCode: error.status, });
        } else {
          return ctx.res.internalServerError({ ...error.error });
        }
      } else {
        return ctx.res.internalServerError({ error });
      }
    }
  },
  saveRecord: async (ctx) => {
    try {
      const { error, validatedData } = await appointmentValidator.validateSave(ctx.request.body);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }

      const diagnosisTypeResp = await request.get('', `${config.databaseUrl}/appointment/diagnosis-type/get-by-id/${validatedData.diagnosis_type_id}`, commonService.setHeaders(ctx.request.headers, ['authorization']));
      if (!diagnosisTypeResp.data.result || (diagnosisTypeResp.data.result.status !== 'active')) {
        return ctx.res.notFound({ msg: responseMessages[1059] });
      }
      validatedData.diagnosisType = diagnosisTypeResp.data.result;

      const clinicLocationResp = await request.get('', `${config.databaseUrl}/appointment/location/get-by-id/${validatedData.clinic_location_id}`, commonService.setHeaders(ctx.request.headers, ['authorization']));
      if (!clinicLocationResp.data.result || (clinicLocationResp.data.result.status !== 'active')) {
        return ctx.res.notFound({ msg: responseMessages[1060] });
      }
      validatedData.clinicLocation = clinicLocationResp.data.result;

      const clinicNameResp = await request.get('', `${config.databaseUrl}/appointment/location/get-name-by-id/${validatedData.clinic_name_id}`, commonService.setHeaders(ctx.request.headers, ['authorization']));
      if (!clinicNameResp.data.result || (clinicNameResp.data.result.status !== 'active')) {
        return ctx.res.notFound({ msg: responseMessages[1060] });
      }
      validatedData.clinicName = clinicNameResp.data.result;

      const appointmentTypeResp = await request.get('', `${config.databaseUrl}/appointment/type/get?uuid=${validatedData.appointment_type_id}`, commonService.setHeaders(ctx.request.headers, ['authorization']));
      if (!appointmentTypeResp.data.result || (appointmentTypeResp.data.result.status !== 'active')) {
        return ctx.res.notFound({ msg: responseMessages[1061] });
      }
      validatedData.appointmentType = appointmentTypeResp.data.result;

      const clinicGetResp = await request.get('', `${config.databaseUrl}/appointment/clinic/get-by-id/${validatedData.clinic_id}`, commonService.setHeaders(ctx.request.headers, ['authorization']));
      if (!clinicGetResp.data.result || (clinicGetResp.data.result.status !== 'active')) {
        return ctx.res.notFound({ msg: responseMessages[1063] })
      }
      validatedData.clinicDetails = clinicGetResp.data.result;

      // const timeGetResp = await request.get('', `${config.databaseUrl}/appointment/clinic/get-time-by-id?uuid=${validatedData.clinic_time_id}`, commonService.setHeaders(ctx.request.headers, ['authorization']));
      // if (!timeGetResp.data.result || (timeGetResp.data.result.status !== 'active')) {
      //   return ctx.res.notFound({ msg: responseMessages[1064] })
      // }
      // validatedData.clinicTime = timeGetResp.data.result;

      const slotGetResp = await request.get('', `${config.databaseUrl}/appointment/clinic/get-slot-by-id?uuid=${validatedData.slot_id}`, commonService.setHeaders(ctx.request.headers, ['authorization']));
      if (!slotGetResp.data.result || (slotGetResp.data.result.status !== 'active')) {
        return ctx.res.notFound({ msg: responseMessages[1065] })
      }
      validatedData.clinicSlot = slotGetResp.data.result;
      // let slotStartTime = moment(`${moment(new Date(validatedData.date)).format('YYYY-MM-DD')} ${moment(new Date(slotGetResp.data.result.start_time)).format('HH:mm:ss')}`).toISOString();

      // const slotMin = Number(moment(slotStartTime).format('m'));
      // if (!isOdd(slotMin)) {
      //   slotStartTime = moment(slotStartTime).add(1, 'minute');
      // }

      validatedData.start_time = moment(`${moment(new Date(validatedData.date)).format('YYYY-MM-DD')} ${moment(new Date(slotGetResp.data.result.start_time)).format('HH:mm:ss')}`).toISOString();
      validatedData.end_time = moment(`${moment(new Date(validatedData.date)).format('YYYY-MM-DD')} ${moment(new Date(slotGetResp.data.result.end_time)).format('HH:mm:ss')}`).toISOString();

      if (validatedData.booked_to) {
        const toUserResp = await request.get('', `${config.databaseUrl}/account/get-user-data?userId=${validatedData.booked_to}`, commonService.setHeaders(ctx.request.headers, ['authorization']));
        if (!toUserResp.data.result || ((toUserResp.data.result.status || '').toLowerCase() !== 'active')) {
          return ctx.res.notFound({ msg: responseMessages[1013] })
        }
        validatedData.toUser = toUserResp.data.result;
      }

      if (validatedData.booked_from) {
        const fromUserResp = await request.get('', `${config.databaseUrl}/account/get-user-data?userId=${validatedData.booked_from}`, commonService.setHeaders(ctx.request.headers, ['authorization']));
        if (!fromUserResp.data.result || ((fromUserResp.data.result.status || '').toLowerCase() !== 'active')) {
          return ctx.res.notFound({ msg: responseMessages[1013] })
        }
        validatedData.fromUser = fromUserResp.data.result;
      }

      const slotCheckUrl = commonService.updateQueryStringParameter(`${config.databaseUrl}/appointment/appointment/check-slot-booked`,
        ['startDate', 'endDate', 'diagnosis_type_id', 'clinic_location_id', 'clinic_name_id', /* 'appointment_type_id', */ 'clinic_id'],
        [validatedData.start_time, validatedData.end_time, validatedData.diagnosis_type_id, validatedData.clinic_location_id, validatedData.clinic_name_id, /* validatedData.appointment_type_id, */ validatedData.clinic_id]);

      const slotCheckResp = await request.get('', slotCheckUrl, commonService.setHeaders(ctx.request.headers, ['authorization']));
      if (!slotCheckResp.data.result.slotExists) {
        return ctx.res.notFound({ msg: responseMessages[1066] })
      }

      const dbSaveResp = await request.post('', `${ctx.req.hitUrl}`, validatedData, commonService.setHeaders(ctx.request.headers, ['authorization']));
      return ctx.res.success({ ...dbSaveResp.data, statusCode: dbSaveResp.status, });
    } catch (error) {
      if (error.status) {
        if (error.status < 500) {
          return ctx.res.clientError({ ...error.error, statusCode: error.status, });
        } else {
          return ctx.res.internalServerError({ ...error.error });
        }
      } else {
        return ctx.res.internalServerError({ error });
      }
    }
  },
  amendBooking: async (ctx) => {
    try {
      const { error, validatedData } = await appointmentValidator.validateAmendSave(ctx.request.body);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }
      const dbSaveResp = await request.post(ctx, `${ctx.req.hitUrl}`, validatedData);
      ctx.res.success({
        ...dbSaveResp.data,
        statusCode: dbSaveResp.status,
      });
    } catch (error) {
      if (error.status) {
        if (error.status < 500) {
          ctx.res.clientError({
            ...error.error,
            statusCode: error.status,
          });
        } else {
          ctx.res.internalServerError({ ...error.error });
        }
      } else {
        ctx.res.internalServerError({ error });
      }
    }
  },
  updateAppointment: async (ctx) => {
    try {
      const { error, validatedData } = await appointmentValidator.validateUpdate(ctx.request.body);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }

      const appointmentResp = await request.get('', `${config.databaseUrl}/appointment/appointment/get-by-id/${validatedData.uuid}`, commonService.setHeaders(ctx.request.headers, ['authorization']));
      if (!appointmentResp.data.result) {
        return ctx.res.notFound({ msg: responseMessages[1069] });
      }
      validatedData.appointmentStatus = appointmentResp.data.result;

      if (validatedData.appointment_status_id) {
        const appointmentStatusResp = await request.get('', `${config.databaseUrl}/appointment/status/get?uuid=${validatedData.appointment_status_id}`, commonService.setHeaders(ctx.request.headers, ['authorization']));
        if (!appointmentStatusResp.data.result || (appointmentStatusResp.data.result.status !== 'active')) {
          return ctx.res.notFound({ msg: responseMessages[1068] });
        }
        validatedData.appointmentStatus = appointmentStatusResp.data.result;
      }

      const apiResp = await request.put(ctx, `${ctx.req.hitUrl}`, validatedData);
      ctx.res.success({
        ...apiResp.data,
        statusCode: apiResp.status,
      });
    } catch (error) {
      if (error.status) {
        if (error.status < 500) {
          ctx.res.clientError({
            ...error.error,
            statusCode: error.status,
          });
        } else {
          ctx.res.internalServerError({ ...error.error });
        }
      } else {
        ctx.res.internalServerError({ error });
      }
    }
  },
};
