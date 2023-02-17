const config = require('../config/config');
const commonService = require('../services/common-service');
const moodValidator = require('../validators/mood');
const mapFhirData = require('../fhirMapping');
const request = require('../middleware/axios-request');

const fhirSave = async (moodList = []) => {
  try {
    const bundlePayload = {
      resourceType: 'Bundle',
      type: 'transaction',
      entry: moodList
        .filter((moodObj) => (moodObj.status == 'Inactive' && moodObj.fhirId) || moodObj.status != 'Inactive')
        .map((moodObj) => {
          moodObj.userFhirId = moodObj.userInfo.fhirId;
          const moodMappingData = mapFhirData.fhirMapping(moodObj);
          return {
            resource: moodMappingData,
            request: {
              method: moodObj.fhirId ? (moodObj.status == 'Inactive' ? 'DELETE' : 'PUT') : 'POST',
              url: `Observation${moodObj.fhirId ? `/${moodObj.fhirId}` : ''}`,
            },
          };
        }),
    };
    const fhirSaveResp = await request.post('', `${config.fhirServerUrl}`, bundlePayload);
    let fhirSyncArray = (fhirSaveResp.data.entry || [])
      .filter((innerData) => !innerData.response.status.startsWith('204'))
      .map((innerData) => ({
        fhirSynced: true,
        fhirId: (innerData.response.location || '').split(/Observation\/(.*?)\/_history/)[1],
        deleted: false,
      }));

    const fhirFindListResp = await request.get(
      '',
      `${config.fhirServerUrl}/Observation?_id=${fhirSyncArray.map((innerData) => innerData.fhirId).join()}`
    );
    if (fhirFindListResp.data.entry) {
      fhirSyncArray = fhirSyncArray.map((fhirSyncObj) => {
        const fhirFindData = fhirFindListResp.data.entry.find((fhirObj) => fhirObj.resource.id == fhirSyncObj.fhirId);

        if (fhirFindData) {
          const moodFindData = moodList.find((moodObj) => moodObj.uuid == fhirFindData.resource.identifier[0].value);
          if (moodFindData) {
            fhirSyncObj.id = moodFindData.id;
          }
        }
        return fhirSyncObj;
      });
      const moodDeletedArr = moodList.filter((moodObj) => moodObj.status == 'Inactive');
      fhirSyncArray = [
        ...fhirSyncArray,
        ...moodDeletedArr.map((moodObj) => ({
          id: moodObj.id,
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
      const { error, validatedData } = await moodValidator.validateGetList(ctx.request.query);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }
      const keyArr = Object.keys(validatedData);
      const valueArr = keyArr.map((innerData) => validatedData[innerData]);
      const postResp = await request.get(
        ctx,
        commonService.updateQueryStringParameter(`${ctx.req.hitUrl}`, keyArr, valueArr)
      );
      ctx.res.success({
        ...postResp.data,
        statusCode: postResp.status,
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
  getById: async (ctx) => {
    try {
      const { error } = await moodValidator.validateGetById(ctx.request.params);
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
  saveRecord: async (ctx) => {
    try {
      const { error, validatedData } = await moodValidator.validateSave(ctx.request.body);
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
  updateRecord: async (ctx) => {
    try {
      const { error, validatedData } = await moodValidator.validateUpdate(ctx.request.body);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
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
  getChartData: async (ctx) => {
    try {
      const { error, validatedData } = await moodValidator.validateGetChartData(ctx.request.query);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
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
      ctx.res.success({
        ...postResp.data,
        statusCode: postResp.status,
      });
    } catch (error) {
      console.log('the tesst function errorororor\n\n\n', error);
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
  deleteRecord: async (ctx) => {
    try {
      const { error } = await moodValidator.validateDelete(ctx.request.query);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
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
  saveFhirRecord: async (ctx) => {
    try {
      // get fhir unsynced mood data
      const fhirSyncResp = await fhirSave(ctx.request.body.trackerList);
      ctx.res.success({
        result: fhirSyncResp.fhirSyncArray,
      });
    } catch (error) {
      console.log('fhir cron error: ', error);
      if (error.status) {
        if (error.status < 500) {
          ctx.res.clientError({
            ...error.error,
            statusCode: error.status,
          });
        } else {
          ctx.res.internalServerError({ error: error.error });
        }
      } else {
        ctx.res.internalServerError({ error });
      }
    }
  },
};
