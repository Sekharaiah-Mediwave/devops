const painValidator = require('../validators/pain');
const commonService = require('../services/common-service');
const { moment } = require('../services/imports');
const config = require('../config/config');
const mapFhirData = require('../fhirMapping');
const request = require('../middleware/axios-request');

const fhirSavve = async (painList = []) => {
  try {
    const entryArr = [
      ...painList.map((painObj) => {
        const returnArr = [
          painObj.pain_condition_records
            .filter(
              (childData) =>
                ((painObj.status == 'Inactive' || childData.status == 'Inactive') && childData.fhirId) ||
                childData.status != 'Inactive'
            )
            .map((childData) => {
              childData.userFhirId = painObj.userInfo.fhirId;
              const painChildMappingData = mapFhirData.fhirMapping(childData, true);
              let method = 'POST';
              if (childData.fhirId) {
                if (painObj.status == 'Inactive' || childData.status == 'Inactive') {
                  method = 'DELETE';
                } else {
                  method = 'PUT';
                }
              }
              return {
                resource: {
                  ...painChildMappingData,
                  derivedFrom: [
                    {
                      reference: childData.fhirId ? `Observation/${painObj.fhirId}` : `urn:uuid:${painObj.uuid}`,
                      display: 'Pain',
                    },
                  ],
                },
                request: {
                  method,
                  url: `Observation${childData.fhirId ? `/${childData.fhirId}` : ''}`,
                },
              };
            }),
        ];
        return returnArr;
      }),
      ...painList
        .filter((painObj) => (painObj.status == 'Inactive' && painObj.fhirId) || painObj.status != 'Inactive')
        .map((painObj) => {
          painObj.userFhirId = painObj.userInfo.fhirId;
          const painMappingData = mapFhirData.fhirMapping(painObj);
          const returnArr = [
            {
              fullUrl: `urn:uuid:${painObj.uuid}`,
              resource: painMappingData,
              request: {
                method: painObj.fhirId ? (painObj.status == 'Inactive' ? 'DELETE' : 'PUT') : 'POST',
                url: `Observation${painObj.fhirId ? `/${painObj.fhirId}` : ''}`,
              },
            },
          ];
          return returnArr;
        }),
    ];

    const bundlePayload = {
      resourceType: 'Bundle',
      type: 'transaction',
      entry: entryArr.flat(2),
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
      const painRecordArr = painList.map((painData) => painData.pain_condition_records).flat();
      fhirSyncArray = fhirSyncArray.map((fhirSyncObj) => {
        const fhirFindData = fhirFindListResp.data.entry.find((fhirObj) => fhirObj.resource.id == fhirSyncObj.fhirId);

        if (fhirFindData) {
          const painFindData = painList.find((painObj) => painObj.uuid == fhirFindData.resource.identifier[0].value);
          if (painFindData) {
            fhirSyncObj.painId = painFindData.id;
          }

          const painRecordFindData = painRecordArr.find(
            (painObj) => painObj.uuid == fhirFindData.resource.identifier[0].value
          );
          if (painRecordFindData) {
            fhirSyncObj.painRecordId = painRecordFindData.id;
          }
        }
        return fhirSyncObj;
      });
      const painDeletedArr = painList.filter((painObj) => painObj.status == 'Inactive');
      const painRecordDeletedArr = painRecordArr.filter((painObj) => painObj.status == 'Inactive');
      fhirSyncArray = [
        ...fhirSyncArray,
        ...painDeletedArr.map((painObj) => ({
          painId: painObj.id,
          fhirSynced: true,
          deleted: true,
        })),
        ...painRecordDeletedArr.map((painObj) => ({
          painRecordId: painObj.id,
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
  createPain: async (ctx) => {
    try {
      const { error, validatedData } = await painValidator.validateSavePain(ctx.request.body);
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
      console.log('\n create Pain error ...', error);
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
  getPainById: async (ctx) => {
    try {
      const { error } = await painValidator.validatePainGetById(ctx.request.params);
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
      console.log('\n pain get error...', error);
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
  getPainList: async (ctx) => {
    try {
      const { error, validatedData } = await painValidator.validatePainGetList(ctx.request.query);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
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
      ctx.res.success({
        ...postResp.data,
        statusCode: postResp.status,
      });
    } catch (error) {
      console.log('\n pain get error...', error);
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
  toggleArchivePain: async (ctx) => {
    try {
      const { error, validatedData } = await painValidator.validatePainArchive(ctx.request.body);
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
      console.log('\n pain error...', error);
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
  deletePain: async (ctx) => {
    try {
      const { error } = await painValidator.validatePainDelete(ctx.request.query);
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
      console.log('\n pain error...', error);
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

  createPainRecord: async (ctx) => {
    try {
      const { error, validatedData } = await painValidator.validateSavePainRecord(ctx.request.body);
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
      console.log('\n create Pain error ...', error);
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
  updatePainRecord: async (ctx) => {
    try {
      const { error, validatedData } = await painValidator.validateUpdatePainRecord(ctx.request.body);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }

      const dbSaveResp = await request.put(ctx, `${ctx.req.hitUrl}`, validatedData);
      ctx.res.success({
        ...dbSaveResp.data,
        statusCode: dbSaveResp.status,
      });
    } catch (error) {
      console.log('\n update Pain error ...', error);
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
  getPainRecordById: async (ctx) => {
    try {
      const { error } = await painValidator.validatePainRecordGetById(ctx.request.params);
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
      console.log('\n pain get error...', error);
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
  getPainRecordList: async (ctx) => {
    try {
      const { error, validatedData } = await painValidator.validatePainRecordGetList(ctx.request.query);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
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
      ctx.res.success({
        ...postResp.data,
        statusCode: postResp.status,
      });
    } catch (error) {
      console.log('\n pain get error...', error);
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
  toggleArchivePainRecord: async (ctx) => {
    try {
      const { error, validatedData } = await painValidator.validatePainRecordArchive(ctx.request.body);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }

      const apiResp = await request.patch(
        ctx,
        `${ctx.req.hitUrl}`,
        validatedData,
        commonService.setHeaders(ctx.request.headers)
      );
      ctx.res.success({
        ...apiResp.data,
        statusCode: apiResp.status,
      });
    } catch (error) {
      console.log('\n pain error...', error);
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
  deletePainRecord: async (ctx) => {
    try {
      const { error } = await painValidator.validatePainRecordDelete(ctx.request.query);
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
      console.log('\n pain error...', error);
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
  getPainRecordChartData: async (ctx) => {
    try {
      const { error, validatedData } = await painValidator.validatePainRecordGetChartData(ctx.request.query);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
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
      ctx.res.success({
        ...postResp.data,
        statusCode: postResp.status,
      });
    } catch (error) {
      console.log('\n pain get error...', error);
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
      // get fhir unsynced pain data
      const fhirSyncResp = await fhirSavve(ctx.request.body.trackerList);

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
