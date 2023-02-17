const smokeTimelineValidator = require('../validators/smoke_timeline');
const config = require('../config/config');
const commonService = require('../services/common-service');
const { moment } = require('../services/imports');
const mapFhirData = require('../fhirMapping');
const request = require('../middleware/axios-request');

const fhirSavve = async (smokeList = []) => {
  try {
    const bundlePayload = {
      resourceType: 'Bundle',
      type: 'transaction',
      entry: smokeList
        .filter((smokeObj) => (smokeObj.status == 'Inactive' && smokeObj.fhirId) || smokeObj.status != 'Inactive')
        .map((smokeObj) => {
          smokeObj.userFhirId = smokeObj.userInfo.fhirId;
          const smokeMappingData = mapFhirData.fhirMapping(smokeObj, false);
          return {
            resource: smokeMappingData,
            request: {
              method: smokeObj.fhirId ? (smokeObj.status == 'Inactive' ? 'DELETE' : 'PUT') : 'POST',
              url: `Observation${smokeObj.fhirId ? `/${smokeObj.fhirId}` : ''}`,
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
          const smokeFindData = smokeList.find(
            (smokeObj) => smokeObj.uuid == fhirFindData.resource.identifier[0].value
          );
          if (smokeFindData) {
            fhirSyncObj.id = smokeFindData.id;
          }
        }
        return fhirSyncObj;
      });
      const smokeDeletedArr = smokeList.filter((smokeObj) => smokeObj.status == 'Inactive');
      fhirSyncArray = [
        ...fhirSyncArray,
        ...smokeDeletedArr.map((smokeObj) => ({
          id: smokeObj.id,
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
  getLatestQuitting: async (ctx) => {
    try {
      const { error, validatedData } = await smokeTimelineValidator.validateGetLatestQuitting(ctx.request.query);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }

      const keyArr = Object.keys(validatedData);
      const valueArr = keyArr.map((innerData) => validatedData[innerData]);

      const apiResp = await request.get(
        ctx,
        commonService.updateQueryStringParameter(`${ctx.req.hitUrl}`, keyArr, valueArr),
        commonService.setHeaders(ctx.request.headers)
      );
      ctx.res.success({
        ...apiResp.data,
        statusCode: apiResp.status,
      });
    } catch (error) {
      console.log('\n smoke timeline get error...', error);
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
  getList: async (ctx) => {
    try {
      const { error, validatedData } = await smokeTimelineValidator.validateGetList(ctx.request.query);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }

      if (validatedData.entryStartDate) {
        validatedData.entryStartDate = moment(validatedData.entryStartDate).format('YYYY-MM-DD');
      }
      if (validatedData.entryEndDate) {
        validatedData.entryEndDate = moment(validatedData.entryEndDate).format('YYYY-MM-DD');
      }
      if (validatedData.toDate) {
        validatedData.toDate = moment(validatedData.toDate).format('YYYY-MM-DD');
      }

      const keyArr = Object.keys(validatedData);
      const valueArr = keyArr.map((innerData) => validatedData[innerData]);

      const postResp = await request.get(
        ctx,
        commonService.updateQueryStringParameter(`${ctx.req.hitUrl}`, keyArr, valueArr),
        commonService.setHeaders(ctx.request.headers)
      );
      ctx.res.success({
        ...postResp.data,
        statusCode: postResp.status,
      });
    } catch (error) {
      console.log('\n smoke timeline get error...', error);
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
      const { error, validatedData } = await smokeTimelineValidator.validateGetChartData(ctx.request.query);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }

      const fromDate = commonService
        .indiaTz(validatedData.date)
        .startOf(validatedData.type)
        .startOf('day')
        .format('YYYY-MM-DD');
      const toDate = commonService
        .indiaTz(validatedData.date)
        .endOf(validatedData.type)
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
      ctx.res.success({
        ...postResp.data,
        statusCode: postResp.status,
      });
    } catch (error) {
      console.log('\n smoke timeline get error...', error);
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
      const { error, validatedData } = await smokeTimelineValidator.validateSave(ctx.request.body);
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
      console.log('\n smoke timeline save error...', error);
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
  addNoSmokeEntry: async (ctx) => {
    try {
      const { error, validatedData } = await smokeTimelineValidator.validateNoSmokeEntry(ctx.request.body);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }

      const apiResp = await request.patch(ctx, `${ctx.req.hitUrl}`, validatedData);
      ctx.res.success({
        ...apiResp.data,
        statusCode: apiResp.status,
      });
    } catch (error) {
      console.log('\n smoke timeline error...', error);
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
  toggleDailyReminder: async (ctx) => {
    try {
      const { error, validatedData } = await smokeTimelineValidator.validateDailyReminder(ctx.request.body);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }

      const apiResp = await request.patch(ctx, `${ctx.req.hitUrl}`, validatedData);
      ctx.res.success({
        ...apiResp.data,
        statusCode: apiResp.status,
      });
    } catch (error) {
      console.log('\n smoke timeline error...', error);
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
  endQuitting: async (ctx) => {
    try {
      const { error, validatedData } = await smokeTimelineValidator.validateEndQuitting(ctx.request.body);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }

      const apiResp = await request.patch(ctx, `${ctx.req.hitUrl}`, validatedData);
      ctx.res.success({
        ...apiResp.data,
        statusCode: apiResp.status,
      });
    } catch (error) {
      console.log('\n smoke timeline error...', error);
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
      // get fhir unsynced sleep data
      const fhirSyncResp = await fhirSavve(ctx.request.body.trackerList);

      ctx.res.ok({ result: { ...fhirSyncResp } });
      return;
    } catch (error) {
      console.log('fhir cron error: ', error);
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
