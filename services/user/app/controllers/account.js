const accountValidator = require('../validators/account');
const commonService = require('../services/common-service');
const config = require('../config/config');
const mapFhirData = require('../fhirMapping');
const request = require('../middleware/axios-request');
// const dbService = require('../../../database/app/services/db-service');

const fhirSave = async (accountList = [], profileType = '') => {
  try {
    const bundlePayload = {
      resourceType: 'Bundle',
      type: 'transaction',
      entry: accountList
        .filter(
          (accountObj) => (accountObj.status == 'Inactive' && accountObj.fhirId) || accountObj.status != 'Inactive'
        )
        .map((accountObj) => {
          accountObj.userFhirId = accountObj.userInfo.fhirId;
          const accountMappingData = mapFhirData[profileType](accountObj);
          return {
            resource: accountMappingData,
            request: {
              method: accountObj.fhirId ? 'PUT' : 'POST',
              url: `Observation${accountObj.fhirId ? `/${accountObj.fhirId}` : ''}`,
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
      }));

    const fhirFindListResp = await request.get(
      '',
      `${config.fhirServerUrl}/Observation?_id=${fhirSyncArray.map((innerData) => innerData.fhirId).join()}`
    );
    if (fhirFindListResp.data.entry) {
      fhirSyncArray = fhirSyncArray.map((fhirSyncObj) => {
        const fhirFindData = fhirFindListResp.data.entry.find((fhirObj) => fhirObj.resource.id == fhirSyncObj.fhirId);

        if (fhirFindData) {
          const accountFindData = accountList.find(
            (accountObj) => accountObj.uuid == fhirFindData.resource.identifier[0].value
          );
          if (accountFindData) {
            fhirSyncObj.id = accountFindData.id;
          }
        }
        return fhirSyncObj;
      });
    }
    return { status: 1, fhirSyncArray };
  } catch (error) {
    console.log('\n save error...', error);
    return { status: 0, error };
  }
};

module.exports = {
  updateUser: async (ctx) => {
    try {
      const { error, validatedData } = await accountValidator.validateUpdateUser(ctx.request.body);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }
      const updateResp = await request.put(
        ctx,
        `${ctx.req.hitUrl}`,
        validatedData,
        commonService.setHeaders(ctx.request.headers)
      );
      ctx.res.success({
        ...updateResp.data,
        statusCode: updateResp.status,
      });
    } catch (error) {
      console.log('\n updateUser error...', error);
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
  addUserEnabledTrackers: async (ctx) => {
    try {
      const { error, validatedData } = await accountValidator.validateAddUserTrackers(ctx.request.body);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }
      const updateResp = await request.patch(
        ctx,
        `${ctx.req.hitUrl}`,
        validatedData,
        commonService.setHeaders(ctx.request.headers)
      );
      ctx.res.success({
        ...updateResp.data,
        statusCode: updateResp.status,
      });
    } catch (error) {
      console.log('\n updateUser error...', error);
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
  getUserDetails: async (ctx) => {
    try {
      const { error } = await accountValidator.validateGetUserData(ctx.request.query);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }

      const getResp = await request.get(ctx, `${ctx.req.hitUrl}`, commonService.setHeaders(ctx.request.headers));
      ctx.res.success({
        ...getResp.data,
        statusCode: getResp.status,
      });
    } catch (error) {
      console.log('\n get User error...', error);
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
  getUserPersonalDetails: async (ctx) => {
    try {
      const getResp = await request.get(ctx, `${ctx.req.hitUrl}`, commonService.setHeaders(ctx.request.headers));
      ctx.res.success({
        ...getResp.data,
        statusCode: getResp.status,
      });
    } catch (error) {
      console.log('\n get User Personal error...', error);
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
  postProfileInformation: async (ctx) => {
    try {
      const { error, validatedData } = await accountValidator.validateMyProfileInfo(ctx.request.body);

      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }
      const postResp = await request.post(
        ctx,
        `${ctx.req.hitUrl}`,
        validatedData,
        commonService.setHeaders(ctx.request.headers)
      );
      ctx.res.success({
        ...postResp.data,
        statusCode: postResp.status,
      });
    } catch (error) {
      console.log('\n post Profile information error...', error);
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
  getProfileInformation: async (ctx) => {
    try {
      const { error } = await accountValidator.validateGetMyProfileInfo(ctx.request.params);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }

      const getResp = await request.get(ctx, `${ctx.req.hitUrl}`, commonService.setHeaders(ctx.request.headers));
      ctx.res.success({
        ...getResp.data,
        statusCode: getResp.status,
      });
    } catch (error) {
      console.log('\n get profile information error...', error);
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
  updatePersonalDetails: async (ctx) => {
    try {
      const { error, validatedData } = await accountValidator.validateMyPersonalDetails(ctx.request.body);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }
      const updateResp = await request.put(
        ctx,
        `${ctx.req.hitUrl}`,
        validatedData,
        commonService.setHeaders(ctx.request.headers)
      );
      ctx.res.success({
        ...updateResp.data,
        statusCode: updateResp.status,
      });
    } catch (error) {
      console.log('\n update personal details error...', error);
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
  postKeyHealthInfo: async (ctx) => {
    try {
      const { error, validatedData } = await accountValidator.validateKeyHealthInfo(ctx.request.body);

      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }
      const postResp = await request.post(
        ctx,
        `${ctx.req.hitUrl}`,
        validatedData,
        commonService.setHeaders(ctx.request.headers)
      );
      ctx.res.success({
        ...postResp.data,
        statusCode: postResp.status,
      });
    } catch (error) {
      console.log('\n post key health info error...', error);
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
  postKeyContact: async (ctx) => {
    try {
      const { error, validatedData } = await accountValidator.validateKeyContact(ctx.request.body);

      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }
      const postResp = await request.post(
        ctx,
        `${ctx.req.hitUrl}`,
        validatedData,
        commonService.setHeaders(ctx.request.headers)
      );
      ctx.res.success({
        ...postResp.data,
        statusCode: postResp.status,
      });
    } catch (error) {
      console.log('\n post key contact error...', error);
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
  logout: async (ctx) => {
    try {
      const deleteResp = await request.delete(ctx, `${ctx.req.hitUrl}`, commonService.setHeaders(ctx.request.headers));
      ctx.res.success({
        ...deleteResp.data,
        statusCode: deleteResp.status,
      });
    } catch (error) {
      console.log('\n delete User error...', error);
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
  updateMailSendOtp: async (ctx) => {
    try {
      const { error, validatedData } = await accountValidator.validateSendOtpMail(ctx.request.body);

      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }
      const postResp = await request.post(
        ctx,
        `${ctx.req.hitUrl}`,
        validatedData,
        commonService.setHeaders(ctx.request.headers)
      );
      ctx.res.success({
        ...postResp.data,
        statusCode: postResp.status,
      });
    } catch (error) {
      console.log('\n update mail send otp error...', error);
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
  sendTwoFactorAuthOtp: async (ctx) => {
    try {
      const postResp = await request.post(
        ctx,
        `${ctx.req.hitUrl}`,
        ctx.request.body,
        commonService.setHeaders(ctx.request.headers)
      );
      ctx.res.success({
        ...postResp.data,
        statusCode: postResp.status,
      });
    } catch (error) {
      console.log('\n two factor auth otp send error...', error);
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
  updateMail: async (ctx) => {
    try {
      const { error, validatedData } = await accountValidator.validateUpdateMail(ctx.request.body);

      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }
      const patchResp = await request.patch(
        ctx,
        `${ctx.req.hitUrl}`,
        validatedData,
        commonService.setHeaders(ctx.request.headers)
      );
      ctx.res.success({
        ...patchResp.data,
        statusCode: patchResp.status,
      });
    } catch (error) {
      console.log('\n update mail error...', error);
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
  updatePassword: async (ctx) => {
    try {
      const { error, validatedData } = await accountValidator.validateUpdatePassword(ctx.request.body);

      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }
      const patchResp = await request.patch(
        ctx,
        `${ctx.req.hitUrl}`,
        validatedData,
        commonService.setHeaders(ctx.request.headers)
      );
      ctx.res.success({
        ...patchResp.data,
        statusCode: patchResp.status,
      });
    } catch (error) {
      console.log('\n update password error...', error);
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
  enableTwoFactorAuth: async (ctx) => {
    try {
      const { error, validatedData } = await accountValidator.validateEnableTwoFactorAuth(ctx.request.body);

      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }
      const patchResp = await request.patch(
        ctx,
        `${ctx.req.hitUrl}`,
        validatedData,
        commonService.setHeaders(ctx.request.headers)
      );
      ctx.res.success({
        ...patchResp.data,
        statusCode: patchResp.status,
      });
    } catch (error) {
      console.log('\n enable two factor auth error...', error);
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
  updateUserSkin: async (ctx) => {
    try {
      const { error, validatedData } = await accountValidator.validateUpdateUserSkin(ctx.request.body);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }
      const updateResp = await request.patch(
        ctx,
        `${ctx.req.hitUrl}`,
        validatedData,
        commonService.setHeaders(ctx.request.headers)
      );
      ctx.res.success({
        ...updateResp.data,
        statusCode: updateResp.status,
      });
    } catch (error) {
      console.log('\n updateUser error...', error);
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
      // get fhir unsynced alcohol data
      const fhirSyncResp = await fhirSave(ctx.request.body.accountList, ctx.request.query.profileType);

      ctx.res.ok({ result: { ...fhirSyncResp } });
      return;
    } catch (error) {
      console.log('fhir cron error: ', error);
      if (error.response) {
        if (error.response.status < 500) {
          ctx.res.clientError({
            ...error.response.data,
            statusCode: error.response.status,
          });
        } else {
          ctx.res.internalServerError({ error: error.response.data });
        }
      } else {
        ctx.res.internalServerError({ error });
      }
    }
  },
  checkAndCreateUsers: async (ctx) => {
    try {
      const postResp = await request.post(
        ctx,
        `${ctx.req.hitUrl}`,
        ctx.request.body,
        commonService.setHeaders(ctx.request.headers)
      );
      ctx.res.success({
        ...postResp.data,
        statusCode: postResp.status,
      });
    } catch (error) {
      console.log('\n post key contact error...', error);
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
