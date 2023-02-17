const config = require('../config/config');
const commonService = require('../services/common-service');
const diaryValidator = require('../validators/diary');
const mapFhirData = require('../fhirMapping');
const request = require('../middleware/axios-request');

const fhirSavve = async (diaryList = []) => {
  try {
    const bundlePayload = {
      resourceType: 'Bundle',
      type: 'transaction',
      entry: diaryList
        .filter((diaryObj) => (diaryObj.status == 'Inactive' && diaryObj.fhirId) || diaryObj.status != 'Inactive')
        .map((diaryObj) => {
          diaryObj.userFhirId = diaryObj.userInfo.fhirId;
          const diaryMappingData = mapFhirData.fhirMapping(diaryObj);
          return {
            resource: diaryMappingData,
            request: {
              method: diaryObj.fhirId ? (diaryObj.status == 'Inactive' ? 'DELETE' : 'PUT') : 'POST',
              url: `Observation${diaryObj.fhirId ? `/${diaryObj.fhirId}` : ''}`,
            },
          };
        }),
    };

    const fhirSaveResp = await request.post('', `${config.fhirServerUrl}`, bundlePayload);

    let fhirSyncArray = (fhirSaveResp.entry || [])
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
    if (fhirFindListResp.entry) {
      fhirSyncArray = fhirSyncArray.map((fhirSyncObj) => {
        const fhirFindData = fhirFindListResp.entry.find((fhirObj) => fhirObj.resource.id == fhirSyncObj.fhirId);

        if (fhirFindData) {
          const diaryFindData = diaryList.find(
            (diaryObj) => diaryObj.uuid == fhirFindData.resource.identifier[0].value
          );
          if (diaryFindData) {
            fhirSyncObj.id = diaryFindData.id;
          }
        }
        return fhirSyncObj;
      });
      const diaryDeletedArr = diaryList.filter((diaryObj) => diaryObj.status == 'Inactive');
      fhirSyncArray = [
        ...fhirSyncArray,
        ...diaryDeletedArr.map((diaryObj) => ({
          id: diaryObj.id,
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
  getById: async (ctx) => {
    try {
      const { error } = await diaryValidator.validateGetById(ctx.request.params);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }
      const apiResp = await request.get(ctx, ctx.req.hitUrl);
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
      const { error, validatedData } = await diaryValidator.validateSave(ctx.request.body);
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
      const { error, validatedData } = await diaryValidator.validateUpdate(ctx.request.body);
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
  getList: async (ctx) => {
    try {
      const { error, validatedData } = await diaryValidator.validateGetChartData(ctx.request.query);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }

      const fromDate = commonService.indiaTz(validatedData.fromDate).startOf('day').format('YYYY-MM-DD');
      const toDate = commonService.indiaTz(validatedData.toDate).endOf('day').format('YYYY-MM-DD');

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
      const { error } = await diaryValidator.validateDelete(ctx.request.query);
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
      // get fhir unsynced diary data
      const fhirSyncResp = await fhirSavve(ctx.request.body.trackerList);
      ctx.res.success({
        result: fhirSyncResp.fhirSyncArray,
      });
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
          ctx.res.internalServerError({ error: error.error });
        }
      } else {
        ctx.res.internalServerError({ error });
      }
    }
  },
};
