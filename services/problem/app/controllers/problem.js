const problemValidator = require('../validators/problem');
const commonService = require('../services/common-service');
const { moment } = require('../services/imports');
const config = require('../config/config');
const mapFhirData = require('../fhirMapping');
const request = require('../middleware/axios-request');

const fhirSavve = async (problemList = { problem: [], records: [] }) => {
  try {
    const problemEntries = problemList.problem.map((problemObj) => {
      problemObj.userFhirId = problemObj.userInfo.fhirId;
      const problemMappingData = mapFhirData.problem(problemObj);
      const entryObj = {
        resource: problemMappingData,
        request: {
          method: problemObj.fhirId ? (problemObj.status == 'Inactive' ? 'DELETE' : 'PUT') : 'POST',
          url: `Observation${problemObj.fhirId ? `/${problemObj.fhirId}` : ''}`,
        },
      };
      if (!problemObj.fhirId) entryObj.fullUrl = `urn:uuid:${problemObj.uuid}`;
      return entryObj;
    });
    const recordEntries = problemList.records.map((recordObj) => {
      recordObj.userFhirId = recordObj.userInfo.fhirId;
      recordObj.reference = recordObj.problemInfo.fhirId
        ? `Observation/${recordObj.problemInfo.fhirId}`
        : `urn:uuid:${recordObj.problemInfo.uuid}`;
      recordObj.userFhirId = recordObj.userInfo.fhirId;
      const recordMappingData = mapFhirData.problemRecord(recordObj);
      return {
        resource: recordMappingData,
        request: {
          method: recordObj.fhirId ? (recordObj.status == 'Inactive' ? 'DELETE' : 'PUT') : 'POST',
          url: `Observation${recordObj.fhirId ? `/${recordObj.fhirId}` : ''}`,
        },
      };
    });

    const bundlePayload = {
      resourceType: 'Bundle',
      type: 'transaction',
      entry: problemEntries.concat(recordEntries),
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
          const problemFindData = problemList.problem.find(
            (problemObj) => problemObj.uuid == fhirFindData.resource.identifier[0].value
          );
          if (problemFindData) {
            fhirSyncObj.problemId = problemFindData.id;
          } else {
            const problemRecordFindData = problemList.records.find(
              (problemObj) => problemObj.uuid == fhirFindData.resource.identifier[0].value
            );
            if (problemRecordFindData) {
              fhirSyncObj.problemRecordId = problemRecordFindData.id;
            }
          }
        }
        return fhirSyncObj;
      });
      const problemDeletedArr = problemList.problem.filter((problemObj) => problemObj.status == 'Inactive');
      const problemRecordDeletedArr = problemList.records.filter((problemObj) => problemObj.status == 'Inactive');
      fhirSyncArray = [
        ...fhirSyncArray,
        ...problemDeletedArr.map((problemObj) => ({
          problemId: problemObj.id,
          fhirSynced: true,
          deleted: true,
        })),
        ...problemRecordDeletedArr.map((problemObj) => ({
          problemRecordId: problemObj.id,
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
  createProblem: async (ctx) => {
    try {
      const { error } = await problemValidator.validateSaveProblem(ctx.request.body);
      if (error) {
        return ctx.res.unprocessableEntity({ msg: error.message });
      }
      const postResp = await request.post(ctx, `${config.databaseUrl}${ctx.req.url}`, ctx.request.body);
      return ctx.res.ok({
        ...postResp.data,
      });
    } catch (error) {
      console.log('\n create problem error ...', error);
      if (error.status) {
        if (error.status < 500) {
          return ctx.res.clientError({
            ...error.error,
            statusCode: error.status,
          });
        }
        return ctx.res.internalServerError({ error: error.error });
      }
      return ctx.res.internalServerError({ error });
    }
  },
  getProblemById: async (ctx) => {
    try {
      const { error } = await problemValidator.validateProblemGetById(ctx.request.params);
      if (error) {
        return ctx.res.unprocessableEntity({ message: error.message });
      }
      const getResp = await request.get(ctx, `${ctx.req.hitUrl}`);
      return ctx.res.success({
        ...getResp.data,
        statusCode: getResp.status,
      });
    } catch (error) {
      console.log('\n problem get error...', error);
      if (error.status) {
        if (error.status < 500) {
          return ctx.res.clientError({
            ...error.error,
            statusCode: error.status,
          });
        }
        return ctx.res.internalServerError({ error: error.error });
      }
      return ctx.res.internalServerError({ error });
    }
  },
  getProblemList: async (ctx) => {
    try {
      const { error, validatedData } = await problemValidator.validateProblemGetList(ctx.request.query);
      if (error) {
        return ctx.res.unprocessableEntity({ message: error.message });
      }

      if (validatedData.entryDate) {
        validatedData.entryDate = moment(validatedData.entryDate).format('YYYY-MM-DD');
      }
      if (validatedData.fromDate) {
        validatedData.fromDate = moment(validatedData.fromDate).format('YYYY-MM-DD');
      }
      if (validatedData.toDate) {
        validatedData.toDate = moment(validatedData.toDate).format('YYYY-MM-DD');
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
      console.log('\n alcohol get error...', error);
      if (error.status) {
        if (error.status < 500) {
          return ctx.res.clientError({
            ...error.error,
            statusCode: error.status,
          });
        }
        return ctx.res.internalServerError({ error: error.error });
      }
      return ctx.res.internalServerError({ error });
    }
  },
  toggleArchiveProblem: async (ctx) => {
    try {
      const { error } = await problemValidator.validateProblemArchive(ctx.request.body);
      if (error) {
        return ctx.res.unprocessableEntity({ message: error.message });
      }
      const postResp = await request.patch(ctx, `${config.databaseUrl}${ctx.req.url}`, ctx.request.body);
      return ctx.res.ok({
        ...postResp.data,
      });
    } catch (error) {
      console.log('\n alcohol error...', error);
      if (error.status) {
        if (error.status < 500) {
          return ctx.res.clientError({
            ...error.error,
            statusCode: error.status,
          });
        }
        return ctx.res.internalServerError({ error: error.error });
      }
      return ctx.res.internalServerError({ error });
    }
  },
  deleteProblem: async (ctx) => {
    try {
      const { error } = await problemValidator.validateProblemDelete(ctx.request.query);
      if (error) {
        return ctx.res.unprocessableEntity({ message: error.message });
      }
      const postResp = await request.delete(ctx, `${config.databaseUrl}${ctx.req.url}`);
      return ctx.res.ok({
        ...postResp.data,
      });
    } catch (error) {
      console.log('\n alcohol error...', error);
      if (error.status) {
        if (error.status < 500) {
          return ctx.res.clientError({
            ...error.error,
            statusCode: error.status,
          });
        }
        return ctx.res.internalServerError({ error: error.error });
      }
      return ctx.res.internalServerError({ error });
    }
  },

  createProblemRecord: async (ctx) => {
    try {
      const { error } = await problemValidator.validateSaveProblemRecord(ctx.request.body);
      if (error) {
        return ctx.res.unprocessableEntity({ msg: error.message });
      }
      const postResp = await request.post(ctx, `${config.databaseUrl}${ctx.req.url}`, ctx.request.body);
      return ctx.res.ok({
        ...postResp.data,
      });
    } catch (error) {
      console.log('\n alcohol save error...', error);
      if (error.status) {
        if (error.status < 500) {
          return ctx.res.clientError({
            ...error.error,
            statusCode: error.status,
          });
        }
        return ctx.res.internalServerError({ error: error.error });
      }
      return ctx.res.internalServerError({ error });
    }
  },
  updateProblemRecord: async (ctx) => {
    try {
      const { error } = await problemValidator.validateUpdateProblemRecord(ctx.request.body);
      if (error) {
        return ctx.res.unprocessableEntity({ message: error.message });
      }

      const postResp = await request.put(ctx, `${config.databaseUrl}${ctx.req.url}`, ctx.request.body);
      return ctx.res.ok({
        ...postResp.data,
      });
    } catch (error) {
      console.log('\n alcohol error...', error);
      if (error.status) {
        if (error.status < 500) {
          return ctx.res.clientError({
            ...error.error,
            statusCode: error.status,
          });
        }
        return ctx.res.internalServerError({ error: error.error });
      }
      return ctx.res.internalServerError({ error });
    }
  },
  getProblemRecordById: async (ctx) => {
    try {
      const { error } = await problemValidator.validateProblemRecordGetById(ctx.request.params);
      if (error) {
        return ctx.res.unprocessableEntity({ message: error.message });
      }

      const getResp = await request.get(ctx, `${ctx.req.hitUrl}`);
      return ctx.res.success({
        ...getResp.data,
        statusCode: getResp.status,
      });
    } catch (error) {
      console.log('\n alcohol get error...', error);
      if (error.status) {
        if (error.status < 500) {
          return ctx.res.clientError({
            ...error.error,
            statusCode: error.status,
          });
        }
        return ctx.res.internalServerError({ error: error.error });
      }
      return ctx.res.internalServerError({ error });
    }
  },
  getProblemRecordList: async (ctx) => {
    try {
      const { error, validatedData } = await problemValidator.validateProblemRecordGetList(ctx.request.query);
      if (error) {
        return ctx.res.unprocessableEntity({ message: error.message });
      }
      if (validatedData.entryDate) {
        validatedData.entryDate = moment(validatedData.entryDate).format('YYYY-MM-DD');
      }
      if (validatedData.fromDate) {
        validatedData.fromDate = moment(validatedData.fromDate).format('YYYY-MM-DD');
      }
      if (validatedData.toDate) {
        validatedData.toDate = moment(validatedData.toDate).format('YYYY-MM-DD');
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
      console.log('\n problem get error...', error);
      if (error.status) {
        if (error.status < 500) {
          return ctx.res.clientError({
            ...error.error,
            statusCode: error.status,
          });
        }
        return ctx.res.internalServerError({ error: error.error });
      }
      return ctx.res.internalServerError({ error });
    }
  },
  toggleArchiveProblemRecord: async (ctx) => {
    try {
      const { error } = await problemValidator.validateProblemRecordArchive(ctx.request.body);
      if (error) {
        return ctx.res.unprocessableEntity({ message: error.message });
      }
      const postResp = await request.patch(ctx, `${config.databaseUrl}${ctx.req.url}`, ctx.request.body);
      return ctx.res.ok({
        ...postResp.data,
      });
    } catch (error) {
      console.log('\n problem error...', error);
      if (error.status) {
        if (error.status < 500) {
          return ctx.res.clientError({
            ...error.error,
            statusCode: error.status,
          });
        }
        return ctx.res.internalServerError({ error: error.error });
      }
      return ctx.res.internalServerError({ error });
    }
  },
  deleteProblemRecord: async (ctx) => {
    try {
      const { error } = await problemValidator.validateProblemRecordDelete(ctx.request.query);
      if (error) {
        return ctx.res.unprocessableEntity({ message: error.message });
      }
      const postResp = await request.delete(ctx, `${config.databaseUrl}${ctx.req.url}`);
      return ctx.res.ok({
        ...postResp.data,
      });
    } catch (error) {
      console.log('\n problem error...', error);
      if (error.status) {
        if (error.status < 500) {
          return ctx.res.clientError({
            ...error.error,
            statusCode: error.status,
          });
        }
        return ctx.res.internalServerError({ error: error.error });
      }
      return ctx.res.internalServerError({ error });
    }
  },
  getProblemRecordChartData: async (ctx) => {
    try {
      const { error, validatedData } = await problemValidator.validateProblemRecordGetChartData(ctx.request.query);
      if (error) {
        return ctx.res.unprocessableEntity({ message: error.message });
      }
      const fromDate = moment(validatedData.date)
        .startOf(validatedData.type == 'week' ? 'isoWeek' : validatedData.type)
        .startOf('day')
        .format('YYYY-MM-DD');
      const toDate = moment(validatedData.date)
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
      console.log('\n problem get error...', error);
      if (error.status) {
        if (error.status < 500) {
          return ctx.res.clientError({
            ...error.error,
            statusCode: error.status,
          });
        }
        return ctx.res.internalServerError({ error: error.error });
      }
      return ctx.res.internalServerError({ error });
    }
  },
  saveFhirRecord: async (ctx) => {
    try {
      // get fhir unsynced problem data
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
