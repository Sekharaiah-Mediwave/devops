const healthValidator = require('../validators/health');
const commonService = require('../services/common-service');
const config = require('../config/config');
const request = require('../middleware/axios-request');

module.exports = {
  createDiagnoses: async (ctx) => {
    try {
      const { error } = await healthValidator.validateSaveDiagnoses(ctx.request.body);
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
  getAllDiagnosesRecord: async (ctx) => {
    try {
      const { error, validatedData } = await healthValidator.validateGetDiagnoses(ctx.request.query);
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
  getDiagnosesRecordByUuid: async (ctx) => {
    try {
      const { error } = await healthValidator.validateGetByUuid(ctx.request.params);
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
  createMedication: async (ctx) => {
    try {
      const { error } = await healthValidator.validateSaveMedication(ctx.request.body);
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
  updateDiagnosesRecord: async (ctx) => {
    try {
      const { error } = await healthValidator.validateDiagnosesUpdate(ctx.request.body);
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
  updateMedicationRecord: async (ctx) => {
    try {
      const { error } = await healthValidator.validateMedicationUpdate(ctx.request.body);
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
        return ctx.res.internalServerError({ ...error.error });
      }
      return ctx.res.internalServerError({ error });
    }
  },
  toggleDiagnosesArchiveRecord: async (ctx) => {
    try {
      const { error } = await healthValidator.validateDiagnosesArchived(ctx.request.body);
      if (error) {
        return ctx.res.unprocessableEntity({ message: error.message });
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
  toggleMedicationArchiveRecord: async (ctx) => {
    try {
      const { error } = await healthValidator.validateMedicationArchived(ctx.request.body);
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
  getAllArchiveDiagnoses: async (ctx) => {
    try {
      const { error, validatedData } = await healthValidator.validateGetDiagnoses(ctx.request.query);
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
  getAllArchiveMedication: async (ctx) => {
    try {
      const { error, validatedData } = await healthValidator.validateGetMedication(ctx.request.query);
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
  deleteDiagnosesRecord: async (ctx) => {
    try {
      const { error } = await healthValidator.validateDelete(ctx.request.query);
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
  deleteMedicationRecord: async (ctx) => {
    try {
      const { error } = await healthValidator.validateDelete(ctx.request.query);
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
  createMedicationNotes: async (ctx) => {
    try {
      const { error } = await healthValidator.validateSaveMedicationNotes(ctx.request.body);
      if (error) {
        return ctx.res.unprocessableEntity({ msg: error.message });
      }
      const postResp = await request.post(ctx, `${config.databaseUrl}${ctx.req.url}`, ctx.request.body);
      return ctx.res.ok({
        ...postResp.data,
      });
    } catch (error) {
      console.log('\n create  condition error ...', error);
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
  updateMedicationNotes: async (ctx) => {
    try {
      const { error } = await healthValidator.validateMedicationNotesUpdate(ctx.request.body);
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
  deleteMedicationNotes: async (ctx) => {
    try {
      const { error } = await healthValidator.validateDelete(ctx.request.query);
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
  /* Activity section */
  createActivites: async (ctx) => {
    try {
      const { error } = await healthValidator.validateSaveActivity(ctx.request.body);
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
  getActivites: async (ctx) => {
    try {
      const { error, validatedData } = await healthValidator.validateGetActivity(ctx.request.query);
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
      console.log('\n Activity get error...', error);
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
  toggleActivityArchive: async (ctx) => {
    try {
      const { error } = await healthValidator.validateActivityArchive(ctx.request.body);
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
  getArchiveActivites: async (ctx) => {
    try {
      const { error, validatedData } = await healthValidator.validateGetActivity(ctx.request.query);
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
      console.log('\n Activity get error...', error);
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
  deleteActivityRecord: async (ctx) => {
    try {
      const { error } = await healthValidator.validateDelete(ctx.request.query);
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
  updateActivity: async (ctx) => {
    try {
      const { error } = await healthValidator.validateActivityUpdate(ctx.request.body);
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
  /* Exercise and Dietary */
  getTrackerInfo: async (ctx) => {
    try {
      const { error, validatedData } = await healthValidator.validateGetActivity(ctx.request.query);
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
  createExercise: async (ctx) => {
    try {
      const { error } = await healthValidator.validateSaveExercise(ctx.request.body);
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
  getExercise: async (ctx) => {
    try {
      const { error, validatedData } = await healthValidator.validateGetExercise(ctx.request.query);
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
      console.log('\n Activity get error...', error);
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
  upsertDietaryAndMeasurement: async (ctx) => {
    try {
      const { error } = await healthValidator.validateSaveDietaryAndMeasurement(ctx.request.body);
      if (error) {
        return ctx.res.unprocessableEntity({ message: error.message });
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
  updateExercise: async (ctx) => {
    try {
      const { error } = await healthValidator.validateExerciseUpdate(ctx.request.body);
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
  getDietaryAndMeasurement: async (ctx) => {
    try {
      const { error, validatedData } = await healthValidator.validateGetExercise(ctx.request.query);
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
      console.log('\n Activity get error...', error);
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
  deleteExercise: async (ctx) => {
    try {
      const { error } = await healthValidator.validateDelete(ctx.request.query);
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
        return ctx.res.internalServerError({ ...error.error });
      }
      return ctx.res.internalServerError({ error });
    }
  },
};
