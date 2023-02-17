const config = require('../config/config');
const commonService = require('../services/common-service');
const clinicValidator = require('../validators/clinic');
const request = require('../middleware/axios-request');
const responseMessages = require('../middleware/response-messages');


module.exports = {
  getList: async (ctx) => {
    try {
      const reqBody = ctx.request.query;
      if (reqBody.status) {
        reqBody.status = reqBody.status.split(',').map(statusData => statusData.trim());
      }
      const { error, validatedData } = await clinicValidator.validateGetList(reqBody);
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
      console.log('\n clinic list error...', error);
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
  getById: async (ctx) => {
    try {
      const { error } = await clinicValidator.validateGetById(ctx.request.params);
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
  deleteById: async (ctx) => {
    try {
      const { error } = await clinicValidator.validateGetById(ctx.request.params);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }

      const appointmentCheckPayload = {
        clinic_id: [(ctx.request.params.uuid || '')],
        itemsPerPage: 1,
        all: 1,
        limit: 1,
        order: ['createdAt', 'DESC'],
        offset: 0
      }

      const appointmentGetResp = await request.post('', `${config.databaseUrl}/appointment/appointment/get-list`, appointmentCheckPayload, commonService.setHeaders(ctx.request.headers, ['authorization']));
      if (appointmentGetResp.data.result.count) {
        return ctx.res.conflict({ msg: responseMessages[1067] });
      }

      const apiResp = await request.delete(ctx, `${ctx.req.hitUrl}`);

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
  saveRecord: async (ctx) => {
    try {
      const { error, validatedData } = await clinicValidator.validateSave(ctx.request.body);
      if (error) {
        return ctx.res.unprocessableEntity({ error });
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

      const clinicFindPayload = {
        diagnosis_type_id: validatedData.diagnosis_type_id,
        clinic_location_id: validatedData.clinic_location_id,
        clinic_name_id: validatedData.clinic_name_id,
        limit: 1,
        offset: 0,
        order: ['createdAt', 'ASC'],
      };

      const clinicResp = await request.post('', `${config.databaseUrl}/appointment/clinic/get-list`, clinicFindPayload, commonService.setHeaders(ctx.request.headers, ['authorization']));
      if (clinicResp.data.result.count) {
        return ctx.res.conflict({ msg: responseMessages[1062] });
      }

      const dbSaveResp = await request.post(ctx, `${ctx.req.hitUrl}`, validatedData);
      return ctx.res.success({
        ...dbSaveResp.data,
        statusCode: dbSaveResp.status,
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
  updateRecord: async (ctx) => {
    try {
      const { error, validatedData } = await clinicValidator.validateUpdate(ctx.request.body);
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

      const clinicFindResp = await request.get('', `${config.databaseUrl}/appointment/clinic/get-by-id/${validatedData.uuid}`, commonService.setHeaders(ctx.request.headers, ['authorization']));
      if (!clinicFindResp.data.result) {
        return ctx.res.notFound({ msg: responseMessages[1063] });
      }

      const clinicFindPayload = {
        diagnosis_type_id: validatedData.diagnosis_type_id,
        clinic_location_id: validatedData.clinic_location_id,
        clinic_name_id: validatedData.clinic_name_id,
        limit: 1,
        offset: 0,
        order: ['createdAt', 'ASC'],
        exclude: {
          clinic: [validatedData.uuid]
        }
      };

      const clinicDuplicateResp = await request.post('', `${config.databaseUrl}/appointment/clinic/get-list`, clinicFindPayload, commonService.setHeaders(ctx.request.headers, ['authorization']));
      if (clinicDuplicateResp.data.result.count) {
        return ctx.res.conflict({ msg: responseMessages[1062] });
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
  getTimesByClinic: async (ctx) => {
    try {
      const { error } = await clinicValidator.validateGetTimesByClinic(ctx.request.query);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }

      const clinicGetResp = await request.get('', `${config.databaseUrl}/appointment/clinic/get-by-id/${ctx.request.query.clinicId}`, commonService.setHeaders(ctx.request.headers, ['authorization']));
      if (!clinicGetResp.data.result || (clinicGetResp.data.result.status !== 'active')) {
        return ctx.res.notFound({ msg: responseMessages[1063] })
      }

      const getResp = await request.get('', `${ctx.req.hitUrl}`, commonService.setHeaders(ctx.request.headers, ['authorization']));
      return ctx.res.success({
        ...getResp.data,
        statusCode: getResp.status,
      });
    } catch (error) {
      console.log('\n getTimesByClinic error...', error);
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
  getTimeById: async (ctx) => {
    try {
      const { error } = await clinicValidator.validateGetTimeById(ctx.request.query);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }

      const getResp = await request.get('', `${ctx.req.hitUrl}`, commonService.setHeaders(ctx.request.headers, ['authorization']));
      return ctx.res.success({
        ...getResp.data,
        statusCode: getResp.status,
      });
    } catch (error) {
      console.log('\n getTimeById error...', error);
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
  getSlotsByClinic: async (ctx) => {
    try {
      const { error } = await clinicValidator.validateGetSlotsByClinic(ctx.request.query);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }

      const clinicGetResp = await request.get('', `${config.databaseUrl}/appointment/clinic/get-by-id/${ctx.request.query.clinicId}`, commonService.setHeaders(ctx.request.headers, ['authorization']));
      if (!clinicGetResp.data.result || (clinicGetResp.data.result.status !== 'active')) {
        return ctx.res.notFound({ msg: responseMessages[1063] })
      }

      const getResp = await request.get('', `${ctx.req.hitUrl}`, commonService.setHeaders(ctx.request.headers, ['authorization']));
      return ctx.res.success({
        ...getResp.data,
        statusCode: getResp.status,
      });
    } catch (error) {
      console.log('\n getSlotsByClinic error...', error);
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
  getSlotsByClinicTime: async (ctx) => {
    try {
      const { error } = await clinicValidator.validateGetSlotsByClinicTime(ctx.request.query);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }

      const timeGetResp = await request.get('', `${config.databaseUrl}/appointment/clinic/get-time-by-id?uuid=${ctx.request.query.clinicTimeId}`, commonService.setHeaders(ctx.request.headers, ['authorization']));
      if (!timeGetResp.data.result || (timeGetResp.data.result.status !== 'active')) {
        return ctx.res.notFound({ msg: responseMessages[1064] })
      }

      const getResp = await request.get('', `${ctx.req.hitUrl}`, commonService.setHeaders(ctx.request.headers, ['authorization']));
      return ctx.res.success({
        ...getResp.data,
        statusCode: getResp.status,
      });
    } catch (error) {
      console.log('\n getSlotsByClinicTime error...', error);
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
  getSlotById: async (ctx) => {
    try {
      const { error } = await clinicValidator.validateGetSlotById(ctx.request.query);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }

      const getResp = await request.get('', `${ctx.req.hitUrl}`, commonService.setHeaders(ctx.request.headers, ['authorization']));
      return ctx.res.success({
        ...getResp.data,
        statusCode: getResp.status,
      });
    } catch (error) {
      console.log('\n getSlotById error...', error);
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
};
