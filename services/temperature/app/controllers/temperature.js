const temperatureValidator = require('../validators/temperature');
const config = require('../config/config');
const commonService = require('../services/common-service');
const mapFhirData = require('../fhirMapping');
const request = require('../middleware/axios-request');

const fhirSave = async (tempList = []) => {
  try {
    const bundlePayload = {
      resourceType: 'Bundle',
      type: 'transaction',
      entry: tempList.map((tempObj) => {
        tempObj.userFhirId = tempObj.userInfo.fhirId;
        const tempMappingData = mapFhirData.fhirMapping(tempObj);
        return {
          resource: tempMappingData,
          request: {
            method: tempObj.fhirId ? (tempObj.status == 'Inactive' ? 'DELETE' : 'PUT') : 'POST',
            url: `Observation${tempObj.fhirId ? `/${tempObj.fhirId}` : ''}`,
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
          const tempFindData = tempList.find((tempObj) => tempObj.uuid == fhirFindData.resource.identifier[0].value);
          if (tempFindData) {
            fhirSyncObj.id = tempFindData.id;
          }
        }
        return fhirSyncObj;
      });
      const tempDeletedArr = tempList.filter((tempObj) => tempObj.status == 'Inactive');
      fhirSyncArray = [
        ...fhirSyncArray,
        ...tempDeletedArr.map((tempObj) => ({
          id: tempObj.id,
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
  createTemperature: async (ctx) => {
    try {
      const { error } = await temperatureValidator.validateSaveTemperature(ctx.request.body);
      if (error) {
        return ctx.res.unprocessableEntity({ msg: error.message });
      }
      const postResp = await request.post(ctx, `${config.databaseUrl}${ctx.req.url}`, ctx.request.body);
      return ctx.res.ok({
        ...postResp.data,
      });
    } catch (error) {
      console.log('\n create temperature condition error ...', error);
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
  getAllTemperature: async (ctx) => {
    try {
      const { error, validatedData } = await temperatureValidator.validateGetTemperature(ctx.request.query);
      if (error) {
        return ctx.res.unprocessableEntity({ msg: error.message });
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
      console.log('\n temperature get error...', error);
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

  getByUuid: async (ctx) => {
    try {
      const { error } = await temperatureValidator.validateGetByUuid(ctx.request.params);
      if (error) {
        return ctx.res.unprocessableEntity({ message: error.message });
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

  updateRecord: async (ctx) => {
    try {
      const { error } = await temperatureValidator.validateUpdate(ctx.request.body);
      if (error) {
        return ctx.res.unprocessableEntity({ message: error.message });
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

  deleteRecord: async (ctx) => {
    try {
      const { error } = await temperatureValidator.validateDelete(ctx.request.query);
      if (error) {
        return ctx.res.unprocessableEntity({ message: error.message });
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
  getTemperatureChartData: async (ctx) => {
    try {
      const { error, validatedData } = await temperatureValidator.validateGetChartData(ctx.request.query);
      if (error) {
        return ctx.res.unprocessableEntity({ message: error.message });
      }

      const fromDate = commonService.indiaTz(validatedData.date).startOf('isoWeek').startOf('day').format('YYYY-MM-DD');
      const toDate = commonService.indiaTz(validatedData.date).endOf('isoWeek').endOf('day').format('YYYY-MM-DD');

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
      console.log('\n temperature get error...', error);
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
      // get fhir unsynced temperature data
      const fhirSyncResp = await fhirSave(ctx.request.body.trackerList);

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
