const { moment } = require('../services/imports');
const config = require('../config/config');
const commonService = require('../services/common-service');
const sleepValidator = require('../validators/sleep');
const mapFhirData = require('../fhirMapping');
const request = require('../middleware/axios-request');

const fhirSavve = async (sleepList = []) => {
  try {
    const bundlePayload = {
      resourceType: 'Bundle',
      type: 'transaction',
      entry: sleepList
        .filter((sleepObj) => (sleepObj.status == 'Inactive' && sleepObj.fhirId) || sleepObj.status != 'Inactive')
        .map((sleepObj) => {
          sleepObj.userFhirId = sleepObj.userInfo.fhirId;
          const sleepMappingData = mapFhirData.fhirMapping(sleepObj);
          return {
            resource: sleepMappingData,
            request: {
              method: sleepObj.fhirId ? (sleepObj.status == 'Inactive' ? 'DELETE' : 'PUT') : 'POST',
              url: `Observation${sleepObj.fhirId ? `/${sleepObj.fhirId}` : ''}`,
            },
          };
        }),
    };
    const fhirSaveResp = await request.post(`${config.fhirServerUrl}`, bundlePayload);
    let fhirSyncArray = (fhirSaveResp.data.entry || [])
      .filter((innerData) => !innerData.response.status.startsWith('204'))
      .map((innerData) => ({
        fhirSynced: true,
        fhirId: (innerData.response.location || '').split(/Observation\/(.*?)\/_history/)[1],
        deleted: false,
      }));

    const fhirFindListResp = await request.get(
      `${config.fhirServerUrl}/Observation?_id=${fhirSyncArray.map((innerData) => innerData.fhirId).join()}`
    );
    if (fhirFindListResp.data.entry) {
      fhirSyncArray = fhirSyncArray.map((fhirSyncObj) => {
        const fhirFindData = fhirFindListResp.data.entry.find((fhirObj) => fhirObj.resource.id == fhirSyncObj.fhirId);

        if (fhirFindData) {
          const sleepFindData = sleepList.find(
            (sleepObj) => sleepObj.uuid == fhirFindData.resource.identifier[0].value
          );
          if (sleepFindData) {
            fhirSyncObj.id = sleepFindData.id;
          }
        }
        return fhirSyncObj;
      });
      const sleepDeletedArr = sleepList.filter((sleepObj) => sleepObj.status == 'Inactive');
      fhirSyncArray = [
        ...fhirSyncArray,
        ...sleepDeletedArr.map((sleepObj) => ({
          id: sleepObj.id,
          fhirSynced: true,
          deleted: true,
        })),
      ];
    }
    return { status: 1, fhirSyncArray };
  } catch (error) {
    console.log('\n save error...', error);
    return { status: 0, error };
  }
};

module.exports = {
  getList: async (ctx) => {
    try {
      const { error, validatedData } = await sleepValidator.validateGetList(ctx.request.query);
      if (error) {
        return ctx.res.unprocessableEntity({ msg: error.message });
      }

      if (validatedData.entryDate) {
        validatedData.entryDate = moment(validatedData.entryDate).format('YYYY-MM-DD');
      }

      const keyArr = Object.keys(validatedData);
      const valueArr = keyArr.map((innerData) => validatedData[innerData]);

      const postResp = await request.get(
        ctx,
        commonService.updateQueryStringParameter(`${ctx.req.hitUrl}`, keyArr, valueArr)
      );
      return ctx.res.ok({
        ...postResp.data,
      });
    } catch (error) {
      if (error.status) {
        if (error.status < 500) {
          return ctx.res.clientError({
            ...error.error,
            statusCode: error.status,
          });
        }
        return ctx.res.internalServerError({ ...error.error });
      }
      return ctx.res.internalServerError({ error });
    }
  },
  getById: async (ctx) => {
    try {
      const { error } = await sleepValidator.validateGetById(ctx.request.params);
      if (error) {
        return ctx.res.unprocessableEntity({ msg: error.message });
      }
      const getResp = await request.get(ctx, `${ctx.req.hitUrl}`);
      return ctx.res.success({
        ...getResp.data,
        statusCode: getResp.status,
      });
    } catch (error) {
      if (error.status) {
        if (error.status < 500) {
          return ctx.res.clientError({
            ...error.error,
            statusCode: error.status,
          });
        }
        return ctx.res.internalServerError({ ...error.error });
      }
      return ctx.res.internalServerError({ error });
    }
  },
  saveRecord: async (ctx) => {
    try {
      const { error } = await sleepValidator.validateSave(ctx.request.body);
      if (error) {
        return ctx.res.unprocessableEntity({ msg: error.message });
      }
      const postResp = await request.post(ctx, `${config.databaseUrl}${ctx.req.url}`, ctx.request.body);
      return ctx.res.ok({
        ...postResp.data,
      });
    } catch (error) {
      if (error.status) {
        if (error.status < 500) {
          return ctx.res.clientError({
            ...error.error,
            statusCode: error.status,
          });
        }
        return ctx.res.internalServerError({ ...error.error });
      }
      return ctx.res.internalServerError({ error });
    }
  },
  updateRecord: async (ctx) => {
    try {
      const { error } = await sleepValidator.validateUpdate(ctx.request.body);
      if (error) {
        return ctx.res.unprocessableEntity({ msg: error.message });
      }
      const postResp = await request.put(ctx, `${config.databaseUrl}${ctx.req.url}`, ctx.request.body);
      return ctx.res.ok({
        ...postResp.data,
      });
    } catch (error) {
      if (error.status) {
        if (error.status < 500) {
          return ctx.res.clientError({
            ...error.error,
            statusCode: error.status,
          });
        }
        return ctx.res.internalServerError({ ...error.error });
      }
      return ctx.res.internalServerError({ error });
    }
  },
  getChartData: async (ctx) => {
    try {
      const { error, validatedData } = await sleepValidator.validateGetChartData(ctx.request.query);
      if (error) {
        return ctx.res.unprocessableEntity({ msg: error.message });
      }

      const fromDate = commonService
        .indiaTz(validatedData.date)
        .startOf(validatedData.type == 'week' ? 'isoWeek' : validatedData.type)
        .startOf('day')
        .format('YYYY-MM-DD');
      const toDate = commonService
        .indiaTz(validatedData.date)
        .endOf(validatedData.type == 'week' ? 'isoWeek' : validatedData.type)
        .endOf('day')
        .format('YYYY-MM-DD');

      validatedData.fromDate = fromDate;
      validatedData.toDate = toDate;

      const keyArr = Object.keys(validatedData);
      const valueArr = keyArr.map((innerData) => validatedData[innerData]);

      const postResp = await request.get(
        ctx,
        commonService.updateQueryStringParameter(`${ctx.req.hitUrl}`, keyArr, valueArr)
      );
      return ctx.res.ok({
        ...postResp.data,
      });
    } catch (error) {
      if (error.status) {
        if (error.status < 500) {
          return ctx.res.clientError({
            ...error.error,
            statusCode: error.status,
          });
        }
        return ctx.res.internalServerError({ ...error.error });
      }
      return ctx.res.internalServerError({ error });
    }
  },
  toggleArchiveRecord: async (ctx) => {
    try {
      const { error } = await sleepValidator.validateArchive(ctx.request.body);
      if (error) {
        return ctx.res.unprocessableEntity({ msg: error.message });
      }
      const postResp = await request.patch(ctx, `${config.databaseUrl}${ctx.req.url}`, ctx.request.body);
      return ctx.res.ok({
        ...postResp.data,
      });
    } catch (error) {
      if (error.status) {
        if (error.status < 500) {
          return ctx.res.clientError({
            ...error.error,
            statusCode: error.status,
          });
        }
        return ctx.res.internalServerError({ ...error.error });
      }
      return ctx.res.internalServerError({ error });
    }
  },
  deleteRecord: async (ctx) => {
    try {
      const { error } = await sleepValidator.validateDelete(ctx.request.query);
      if (error) {
        return ctx.res.unprocessableEntity({ msg: error.message });
      }
      const postResp = await request.delete(ctx, `${config.databaseUrl}${ctx.req.url}`);
      return ctx.res.ok({
        ...postResp.data,
      });
    } catch (error) {
      if (error.status) {
        if (error.status < 500) {
          return ctx.res.clientError({
            ...error.error,
            statusCode: error.status,
          });
        }
        return ctx.res.internalServerError({ ...error.error });
      }
      return ctx.res.internalServerError({ error });
    }
  },
  saveFhirRecord: async (ctx) => {
    try {
      // get fhir unsynced sleep data
      const fhirSyncResp = await fhirSavve(ctx.request.body.trackerList);

      return ctx.res.ok({ result: { ...fhirSyncResp } });
    } catch (error) {
      console.log('fhir cron error: ', error);
      if (error.status) {
        if (error.status < 500) {
          return ctx.res.clientError({
            ...error.error,
            statusCode: error.status,
          });
        }
        return ctx.res.internalServerError({ ...error.error });
      }
      return ctx.res.internalServerError({ error });
    }
  },
};
