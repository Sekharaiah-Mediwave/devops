const config = require('../config/config');
const commonService = require('../services/common-service');
const goalValidator = require('../validators/goal');
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
  getRGoalsByDate: async (ctx) => {
    try {
      const { error } = await goalValidator.validateGetByDate(ctx.request.query);
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
  getRGoalInfo: async (ctx) => {
    try {
      const { error } = await goalValidator.validateGetById(ctx.request.params);
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
  getArchivedGoals: async (ctx) => {
    try {
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
  checkRGoalTasksLeftForDate: async (ctx) => {
    try {
      const { error } = await goalValidator.validateGetByDate(ctx.request.query);
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
  checkRGoalCountForUser: async (ctx) => {
    try {
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
  getAllRGoals: async (ctx) => {
    try {
      const { error, validatedData } = await goalValidator.validateGetList(
        ctx.request.query
      );
      if (error) {
        return ctx.res.unprocessableEntity({ msg: error.message });
      }

      const apiResp = await request.get(ctx, ctx.req.hitUrl);
      ctx.res.success({
        ...apiResp.data,
        statusCode: apiResp.status,
      });
    } catch (error) {
      console.log('error', error);
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
  createRGoal: async (ctx) => {
    try {
      const { error, validatedData } = await goalValidator.validateSave(ctx.request.body);
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
  markStepCompleted: async (ctx) => {
    try {
      console.log('complete step', ctx.request);

      const { error, validatedData } = await goalValidator.validateGetByEntryId(ctx.request.params);
      console.log(validatedData, error, 'validatedData,error');
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
  archiveOrActivateGoal: async (ctx) => {
    try {
      {
        const { error, validatedData } = await goalValidator.validateGetById(ctx.request.params);
        if (error) {
          ctx.res.unprocessableEntity({ error });
          return;
        }
      }
      const { error, validatedData } = await goalValidator.validateStatus(ctx.request.body);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }
      console.log(ctx.req.hitUrl, error, validatedData, 'body');
      const apiResp = await request.put(ctx, `${ctx.req.hitUrl}`, validatedData);
      console.log(apiResp, 'apiResp');
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
  updateRGoal: async (ctx) => {
    try {
      {
        const { error, validatedData } = await goalValidator.validateGetById(ctx.request.params);
        if (error) {
          ctx.res.unprocessableEntity({ error });
          return;
        }
      }
      const { error, validatedData } = await goalValidator.validateSave(ctx.request.body);
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
};
