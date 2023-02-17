const copingValidator = require('../validators/coping');
const commonService = require('../services/common-service');
const config = require('../config/config');
const request = require('../middleware/axios-request');
// const mapFhirData = require('../fhirMapping');

const fhirSavve = async (copingList = []) => {
  try {
    // const bundlePayload = {
    //   resourceType: 'Bundle',
    //   type: 'transaction',
    //   entry: copingList
    //     .filter((copingObj) => {
    //       return (
    //         (copingObj.status == 'Inactive' && copingObj.fhirId) ||
    //         copingObj.status != 'Inactive'
    //       );
    //     })
    //     .map((copingObj) => {
    //       copingObj.userFhirId = copingObj.userInfo.fhirId;
    //       const copingMappingData = mapFhirData.fhirMapping(copingObj);
    //       return {
    //         resource: copingMappingData,
    //         request: {
    //           method: copingObj.fhirId
    //             ? copingObj.status == 'Inactive'
    //               ? 'DELETE'
    //               : 'PUT'
    //             : 'POST',
    //           url: `Observation${copingObj.fhirId ? `/${copingObj.fhirId}` : ''
    //             }`,
    //         },
    //       };
    //     }),
    // };

    const fhirSaveResp = await request.post('', {
      url: `${config.fhirServerUrl}`,
    });

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
          const copingFindData = copingList.find(
            (copingObj) => copingObj.uuid == fhirFindData.resource.identifier[0].value
          );
          if (copingFindData) {
            fhirSyncObj.id = copingFindData.id;
          }
        }
        return fhirSyncObj;
      });
      const copingDeletedArr = copingList.filter((copingObj) => copingObj.status == 'Inactive');
      fhirSyncArray = [
        ...fhirSyncArray,
        ...copingDeletedArr.map((copingObj) => ({
          id: copingObj.id,
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
  createCoping: async (ctx) => {
    try {
      const { error } = await copingValidator.validateSaveCoping(ctx.request.body);
      if (error) {
        return ctx.res.unprocessableEntity({ message: error.message });
      }
      const getResp = await request.post(ctx, `${ctx.req.hitUrl}`, ctx.request.body);
      return ctx.res.success({
        ...getResp.data,
        statusCode: getResp.status,
      });
    } catch (error) {
      console.log('\n create coping condition error ...', error);
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
  getAllCopingRecord: async (ctx) => {
    try {
      const { error, validatedData } = await copingValidator.validateGetCoping(ctx.request.query);
      if (error) {
        return ctx.res.unprocessableEntity({ message: error.message });
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
      console.log('\n Coping get error...', error);
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
  getCopingRecordByUuid: async (ctx) => {
    try {
      const { error } = await copingValidator.validateGetByUuid(ctx.request.params);
      if (error) {
        return ctx.res.unprocessableEntity({ error });
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
  getAllArchivedCoping: async (ctx) => {
    try {
      const { error, validatedData } = await copingValidator.validateGetCoping(ctx.request.query);
      if (error) {
        return ctx.res.unprocessableEntity({ error });
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
      console.log('\n Coping get error...', error);
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
      const { error } = await copingValidator.validateArchived(ctx.request.body);
      if (error) {
        return ctx.res.unprocessableEntity({ error });
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
  updateCopingRecord: async (ctx) => {
    try {
      const { error } = await copingValidator.validateCopingUpdate(ctx.request.body);
      if (error) {
        return ctx.res.unprocessableEntity({ error });
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
  deleteCopingRecord: async (ctx) => {
    try {
      const { error } = await copingValidator.validateCopingDelete(ctx.request.query);
      if (error) {
        return ctx.res.unprocessableEntity({ error });
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
      // get fhir unsynced coping data
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
