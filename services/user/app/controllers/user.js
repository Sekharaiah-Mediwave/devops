const { moment, _ } = require('../services/imports');
const userValidator = require('../validators/user');
const commonService = require('../services/common-service');
const config = require('../config/config');
const mapFhirData = require('../fhirMapping');
const responseMessages = require('../middleware/response-messages');
const request = require('../middleware/axios-request');

const saveUserInFhir = async (userPayload = {}) => {
  try {
    const requestUrl = `${config.fhirServerUrl}/Patient`;
    const requestParams = {
      _tag: `${config.fhirTagUrl}|${config.fhirTagCode}`,
      _summary: 'count',
    };
    const emailCheck = await request.get('', requestUrl, {
      params: { ...requestParams, ...{ email: encodeURIComponent(userPayload.email) } },
    });
    if (emailCheck.data.total) {
      return { status: 0, msg: 'Email address already in use!' };
    }

    const usernameCheck = await request.get('', requestUrl, {
      params: { ...requestParams, ...{ name: userPayload.username || userPayload.email } },
    });
    if (usernameCheck.data.total) return { status: 0, msg: 'Username already in use!' };

    if (userPayload.mobileNumber) {
      const mobileNumberCheck = await request.get('', requestUrl, {
        params: { ...requestParams, ...{ phone: userPayload.mobileNumber } },
      });
      if (mobileNumberCheck.data.total) return { status: 0, msg: 'Mobile already in use!' };
    }

    const userMappingData = mapFhirData.userMapping(userPayload);
    const postResp = await request.post('', requestUrl, userMappingData);
    return postResp.data;
  } catch (error) {
    console.log('\n save user in fhir error...', error);
    return Promise.reject({
      status: 500,
      body: {
        msg: 'error',
        message: 'FHIR Server Error',
        status: 0,
      },
    });
  }
};
const mapCliniciansAndPatientsData = async (clinicians, patients) => {
  const returnArray = [];
  patients.forEach((patientElem) => {
    clinicians.forEach((clinicianElem) => {
      returnArray.push({
        firstName: patientElem.firstName,
        lastName: patientElem.firstName,
        relationship: 'patient',
        fromId: clinicianElem.uuid,
        toId: patientElem.uuid,
        status: 'accepted',
        email: patientElem.email,
      });
    });
  });
  return returnArray;
};

const mapCareteamsAndPatientData = async (careteamsData, patientDatas) => {
  const mappedArray = patientDatas.map((v) => ({
    firstName: v.firstName,
    lastName: v.lastName,
    relationship: 'careteam',
    teamId: careteamsData.uuid,
    toId: v.uuid,
    status: 'accepted',
    email: v.email,
  }));
  return mappedArray;
};

module.exports = {
  getTrackerOverview: async (ctx) => {
    try {
      const { error, validatedData } = await userValidator.validateTrackerOverview(ctx.request.query);

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

      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }
      const getResp = await request.get(
        ctx,
        commonService.updateQueryStringParameter(`${ctx.req.hitUrl}`, keyArr, valueArr),
        commonService.setHeaders(ctx.request.headers)
      );
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
  updateProfile: async (ctx) => {
    try {
      const { error, validatedData } = await userValidator.validateUpdateProfile(ctx.request.body);

      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }
      const putResp = await request.put(
        ctx,
        `${ctx.req.hitUrl}`,
        validatedData,
        commonService.setHeaders(ctx.request.headers)
      );
      ctx.res.success({
        ...putResp.data,
        statusCode: putResp.status,
      });
    } catch (error) {
      console.log('\n user profile update error... ', error);
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
  inActiveAccount: async (ctx) => {
    try {
      const putResp = await request.put(ctx, `${ctx.req.hitUrl}`, {}, commonService.setHeaders(ctx.request.headers));
      ctx.res.success({
        ...putResp.data,
        statusCode: putResp.status,
      });
    } catch (error) {
      console.log('\n user profile update error... ', error);
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
  deleteAccount: async (ctx) => {
    try {
      const putResp = await request.put(ctx, `${ctx.req.hitUrl}`, {}, commonService.setHeaders(ctx.request.headers));
      ctx.res.success({
        ...putResp.data,
        statusCode: putResp.status,
      });
    } catch (error) {
      console.log('\n user profile update error... ', error);
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
  getConsent: async (ctx) => {
    try {
      const getResp = await request.get(ctx, `${ctx.req.hitUrl}`, commonService.setHeaders(ctx.request.headers));
      ctx.res.success({
        ...getResp.data,
        statusCode: getResp.status,
      });
    } catch (error) {
      console.log('\n get admin community users error... ', error);
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
  updateConsent: async (ctx) => {
    try {
      const { error, validatedData } = await userValidator.validateUpdateConsent(ctx.request.body);

      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }
      const putResp = await request.put(
        ctx,
        `${ctx.req.hitUrl}`,
        validatedData,
        commonService.setHeaders(ctx.request.headers)
      );
      ctx.res.success({
        ...putResp.data,
        statusCode: putResp.status,
      });
    } catch (error) {
      console.log('\n user profile update error... ', error);
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
  updateResourceLibraryPreference: async (ctx) => {
    try {
      const { error, validatedData } = await userValidator.validateUpdatePreferences(ctx.request.body);

      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }
      const putResp = await request.put(
        ctx,
        `${ctx.req.hitUrl}`,
        validatedData,
        commonService.setHeaders(ctx.request.headers)
      );
      ctx.res.success({
        ...putResp.data,
        statusCode: putResp.status,
      });
    } catch (error) {
      console.log('\n user profile update error... ', error);
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
  updateResourceLibraryFavorite: async (ctx) => {
    try {
      const { error, validatedData } = await userValidator.validateUpdateFavorite(ctx.request.body);

      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }
      const putResp = await request.put(
        ctx,
        `${ctx.req.hitUrl}`,
        validatedData,
        commonService.setHeaders(ctx.request.headers)
      );
      ctx.res.success({
        ...putResp.data,
        statusCode: putResp.status,
      });
    } catch (error) {
      console.log('\n user profile update error... ', error);
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
  fetchResourceLibraryPreference: async (ctx) => {
    try {
      const getResp = await request.get(ctx, `${ctx.req.hitUrl}`, commonService.setHeaders(ctx.request.headers));
      ctx.res.success({
        ...getResp.data,
        statusCode: getResp.status,
      });
    } catch (error) {
      console.log('\n get admin community users error... ', error);
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
  fetchAuditTrails: async (ctx) => {
    try {
      const getResp = await request.get(ctx, `${ctx.req.hitUrl}`, commonService.setHeaders(ctx.request.headers));
      ctx.res.success({
        ...getResp.data,
        statusCode: getResp.status,
      });
    } catch (error) {
      console.log('\n get admin community users error... ', error);
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
  getUsersFromDirectory: async (ctx) => {
    try {
      const { error, validatedData } = await userValidator.validateGetDirectoryUsers(ctx.request.query);

      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }

      const keyArr = Object.keys(validatedData);
      const valueArr = keyArr.map((innerData) => validatedData[innerData]);

      const getResp = await request.get(
        ctx,
        commonService.updateQueryStringParameter(`${ctx.req.hitUrl}`, keyArr, valueArr),
        commonService.setHeaders(ctx.request.headers)
      );
      ctx.res.success({
        ...getResp.data,
        statusCode: getResp.status,
      });
    } catch (error) {
      // console.log('\n get directory users error... ', error);
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
  getColleguesFromCircle: async (ctx) => {
    try {
      const { error, validatedData } = await userValidator.validateGetCircleCollegues(ctx.request.query);

      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }

      const keyArr = Object.keys(validatedData);
      const valueArr = keyArr.map((innerData) => validatedData[innerData]);

      const getResp = await request.get(
        ctx,
        commonService.updateQueryStringParameter(`${ctx.req.hitUrl}`, keyArr, valueArr),
        commonService.setHeaders(ctx.request.headers)
      );
      ctx.res.success({
        ...getResp.data,
        statusCode: getResp.status,
      });
    } catch (error) {
      // console.log('\n get directory users error... ', error);
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
  getCommunityUsers: async (ctx) => {
    try {
      const { error, validatedData } = await userValidator.validateAdminCommunityUsers(ctx.request.query);

      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }

      const keyArr = Object.keys(validatedData);
      const valueArr = keyArr.map((innerData) => validatedData[innerData]);

      const getResp = await request.get(
        ctx,
        commonService.updateQueryStringParameter(`${ctx.req.hitUrl}`, keyArr, valueArr),
        commonService.setHeaders(ctx.request.headers)
      );
      ctx.res.success({
        ...getResp.data,
        statusCode: getResp.status,
      });
    } catch (error) {
      console.log('\n get admin community users error... ', error);
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
  getAllAdmin: async (ctx) => {
    try {
      const { error, validatedData } = await userValidator.validateGetAdminUsers(ctx.request.query);

      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }

      const keyArr = Object.keys(validatedData);
      const valueArr = keyArr.map((innerData) => validatedData[innerData]);

      const getResp = await request.get(
        ctx,
        commonService.updateQueryStringParameter(`${ctx.req.hitUrl}`, keyArr, valueArr),
        commonService.setHeaders(ctx.request.headers)
      );
      ctx.res.success({
        ...getResp.data,
        statusCode: getResp.status,
      });
    } catch (error) {
      console.log('\n get admin community users error... ', error);
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
  getAllClinicians: async (ctx) => {
    try {
      const { error, validatedData } = await userValidator.validateGetClinicianUsers(ctx.request.query);

      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }

      const keyArr = Object.keys(validatedData);
      const valueArr = keyArr.map((innerData) => validatedData[innerData]);

      const getResp = await request.get(
        ctx,
        commonService.updateQueryStringParameter(`${ctx.req.hitUrl}`, keyArr, valueArr),
        commonService.setHeaders(ctx.request.headers)
      );
      ctx.res.success({
        ...getResp.data,
        statusCode: getResp.status,
      });
    } catch (error) {
      console.log('\n get clinician community users error... ', error);
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
  getAllCliniciansAndAdmin: async (ctx) => {
    try {
      const { error, validatedData } = await userValidator.validateGetClinicianAndAdmin(ctx.request.query);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }

      const keyArr = Object.keys(validatedData);
      const valueArr = keyArr.map((innerData) => validatedData[innerData]);

      const getResp = await request.get(
        ctx,
        commonService.updateQueryStringParameter(`${ctx.req.hitUrl}`, keyArr, valueArr),
        commonService.setHeaders(ctx.request.headers)
      );
      ctx.res.success({
        ...getResp.data,
        statusCode: getResp.status,
      });
    } catch (error) {
      console.log('\n get clinician community users error... ', error);
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
  getPeoplesFromCircle: async (ctx) => {
    try {
      const { error, validatedData } = await userValidator.validateGetCirclePeoples(ctx.request.query);

      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }

      const keyArr = Object.keys(validatedData);
      const valueArr = keyArr.map((innerData) => validatedData[innerData]);

      const getResp = await request.get(
        ctx,
        commonService.updateQueryStringParameter(`${ctx.req.hitUrl}`, keyArr, valueArr),
        commonService.setHeaders(ctx.request.headers)
      );
      ctx.res.success({
        ...getResp.data,
        statusCode: getResp.status,
      });
    } catch (error) {
      // console.log('\n get directory users error... ', error);
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
  getUsersByRole: async (ctx) => {
    try {
      const { error, validatedData } = await userValidator.validateGetUsersByRole(ctx.request.query);

      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }

      const keyArr = Object.keys(validatedData);
      const valueArr = keyArr.map((innerData) => validatedData[innerData]);

      const getResp = await request.get(
        ctx,
        commonService.updateQueryStringParameter(`${ctx.req.hitUrl}`, keyArr, valueArr),
        commonService.setHeaders(ctx.request.headers)
      );
      ctx.res.success({
        ...getResp.data,
        statusCode: getResp.status,
      });
    } catch (error) {
      // console.log('\n get directory users error... ', error);
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
  getUserCountRoleWise: async (ctx) => {
    try {
      const getResp = await request.get(ctx, `${ctx.req.hitUrl}`, commonService.setHeaders(ctx.request.headers));
      ctx.res.success({
        ...getResp.data,
        statusCode: getResp.status,
      });
    } catch (error) {
      console.log('\n get User Count Role Wise error... ', error);
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
  updateDirectorySettings: async (ctx) => {
    try {
      const { error, validatedData } = await userValidator.validateUpdateDirectorySettings(ctx.request.body);

      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }
      const putResp = await request.put(
        ctx,
        `${ctx.req.hitUrl}`,
        validatedData,
        commonService.setHeaders(ctx.request.headers)
      );
      ctx.res.success({
        ...putResp.data,
        statusCode: putResp.status,
      });
    } catch (error) {
      console.log('\n user directory settings update error... ', error);
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
  updateAccountSettings: async (ctx) => {
    try {
      const { error, validatedData } = await userValidator.validateUpdateAccountSettings(ctx.request.body);

      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }
      const putResp = await request.put(
        ctx,
        `${ctx.req.hitUrl}`,
        validatedData,
        commonService.setHeaders(ctx.request.headers)
      );
      ctx.res.success({
        ...putResp.data,
        statusCode: putResp.status,
      });
    } catch (error) {
      console.log('\n user account settings update error... ', error);
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
  createAdminUser: async (ctx) => {
    try {
      const { error, validatedData } = await userValidator.validateAdminCreateUser(ctx.request.body);

      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }

      const fhirResponse = await saveUserInFhir(validatedData);
      if (!fhirResponse.id) {
        ctx.res.badRequest({ error: fhirResponse });
        return;
      }
      validatedData.fhirId = fhirResponse.id;
      const userSavedResp = await request.post(
        ctx,
        `${ctx.req.hitUrl}`,
        validatedData,
        commonService.setHeaders(ctx.request.headers)
      );
      if (userSavedResp.status === 200) {
        await request.post(
          ctx,
          `${config.emailUrl}/email/user/send-admin-created`,
          {
            firstName: userSavedResp.data.result.firstName,
            email: userSavedResp.data.result.email,
            username: userSavedResp.data.result.username,
            password: userSavedResp.data.result.password,
          },
          commonService.setHeaders(ctx.request.headers)
        );
      }
      ctx.res.success({
        ...userSavedResp.data,
        statusCode: userSavedResp.status,
      });
    } catch (error) {
      console.log('\n user create error... ', error);
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
  createCareTeam: async (ctx) => {
    try {
      const { error, validatedData } = await userValidator.validateCreateCareTeam(ctx.request.body);

      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }

      const fhirResponse = await saveUserInFhir(validatedData);
      if (!fhirResponse.id) {
        ctx.res.badRequest({ error: fhirResponse });
        return;
      }
      validatedData.fhirId = fhirResponse.id;
      const userSavedResp = await request.post(
        ctx,
        `${ctx.req.hitUrl}`,
        validatedData,
        commonService.setHeaders(ctx.request.headers)
      );
      if (userSavedResp.status === 200) {
        await request.post(
          ctx,
          `${config.emailUrl}/email/user/send-care-team-created`,
          {
            firstName: userSavedResp.data.result.firstName,
            email: userSavedResp.data.result.email,
            username: userSavedResp.data.result.username,
            password: userSavedResp.data.result.password,
          },
          commonService.setHeaders(ctx.request.headers)
        );
      }
      ctx.res.success({
        ...userSavedResp.data,
        statusCode: userSavedResp.status,
      });
    } catch (error) {
      console.log('\n user create error... ', error);
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
  createClinician: async (ctx) => {
    try {
      const { error, validatedData } = await userValidator.validateCreateClinician(ctx.request.body);

      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }

      const fhirResponse = await saveUserInFhir(validatedData);
      if (!fhirResponse.id) {
        ctx.res.badRequest({ error: fhirResponse });
        return;
      }
      validatedData.fhirId = fhirResponse.id;
      const userSavedResp = await request.post(
        ctx,
        `${ctx.req.hitUrl}`,
        validatedData,
        commonService.setHeaders(ctx.request.headers)
      );
      if (userSavedResp.status === 200) {
        await request.post(
          ctx,
          `${config.emailUrl}/email/user/send-clinician-created`,
          {
            firstName: userSavedResp.data.result.firstName,
            email: userSavedResp.data.result.email,
            username: userSavedResp.data.result.username,
            password: userSavedResp.data.result.password,
          },
          commonService.setHeaders(ctx.request.headers)
        );
      }
      ctx.res.success({
        ...userSavedResp.data,
        statusCode: userSavedResp.status,
      });
    } catch (error) {
      console.log('\n user create error... ', error);
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
  createPatient: async (ctx) => {
    try {
      const { error, validatedData } = await userValidator.validateCreatePatient(ctx.request.body);

      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }

      const fhirResponse = await saveUserInFhir(validatedData);
      if (!fhirResponse.id) {
        ctx.res.badRequest({ error: fhirResponse });
        return;
      }
      validatedData.fhirId = fhirResponse.id;
      const userSavedResp = await request.post(
        ctx,
        `${ctx.req.hitUrl}`,
        validatedData,
        commonService.setHeaders(ctx.request.headers)
      );
      if (userSavedResp.status === 200) {
        await request.post(
          ctx,
          `${config.emailUrl}/email/user/send-patient-created`,
          {
            firstName: userSavedResp.data.result.firstName,
            email: userSavedResp.data.result.email,
            username: userSavedResp.data.result.username,
            password: userSavedResp.data.result.password,
          },
          commonService.setHeaders(ctx.request.headers)
        );
      }
      ctx.res.success({
        ...userSavedResp.data,
        statusCode: userSavedResp.status,
      });
    } catch (error) {
      console.log('\n user create error... ', error);
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
  getPatientsToLink: async (ctx) => {
    try {
      const { error, validatedData } = await userValidator.validatePatientsToLink(ctx.request.query);

      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }
      const keyArr = Object.keys(validatedData);
      const valueArr = keyArr.map((innerData) => validatedData[innerData]);
      const allPatients = await request.get(
        ctx,
        commonService.updateQueryStringParameter(`${ctx.req.hitUrl}`, keyArr, valueArr),
        commonService.setHeaders(ctx.request.headers)
      );
      ctx.res.ok({ result: allPatients.data });
    } catch (error) {
      // console.log('\n  getPatientToLinked error... ', error);
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
  linkClinicianAndPatients: async (ctx) => {
    try {
      const { error, validatedData } = await userValidator.linkClinicianAndPatients(ctx.request.body);

      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }
      const clinicianList = await request.post(
        ctx,
        `${config.databaseUrl}/user/is-clinician-available`,
        {
          clinicianIds: validatedData.clinicianIds,
        },
        commonService.setHeaders(ctx.request.headers)
      );
      if (
        !clinicianList.data ||
        (clinicianList.data && clinicianList.data.result.length !== validatedData.clinicianIds.length)
      ) {
        ctx.res.unprocessableEntity({ msg: responseMessages[1001] });
        return;
      }
      const patientList = await request.post(
        ctx,
        `${config.databaseUrl}/user/is-patients-available`,
        {
          patientIds: validatedData.patientIds,
        },
        commonService.setHeaders(ctx.request.headers)
      );
      if (
        !patientList.data ||
        (patientList.data && patientList.data.result.length !== validatedData.patientIds.length)
      ) {
        ctx.res.unprocessableEntity({ msg: responseMessages[1002] });
        return;
      }

      const mappedData = await mapCliniciansAndPatientsData(clinicianList.data.result, patientList.data.result);

      const circleListResp = await request.post(
        ctx,
        `${config.databaseUrl}/circle/get-circles-from-ids`,
        {
          fromToIds: mappedData,
        },
        commonService.setHeaders(ctx.request.headers)
      );

      const tableCircleFindList = circleListResp.data.result || [];

      const circleArrToSave = mappedData.filter(
        (el) => !tableCircleFindList.some((f) => f.fromId == el.fromId && f.toId == el.toId)
      );
      if (tableCircleFindList.length > 0) {
        await request.patch(
          ctx,
          `${config.databaseUrl}/user/remove-circle-connections`,
          {
            circleIds: tableCircleFindList.map((circleData) => circleData.uuid),
          },
          commonService.setHeaders(ctx.request.headers)
        );
      }

      const createdCircle = await request.post(
        ctx,
        `${config.databaseUrl}/user/link-clinician-to-patients`,
        {
          linkArray: circleArrToSave,
        },
        commonService.setHeaders(ctx.request.headers)
      );
      ctx.res.ok({ result: createdCircle.data });
    } catch (error) {
      // console.log('\n linkClinicianAndPatients error...', error);
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
  linkCareteamsAndPatients: async (ctx) => {
    try {
      const { error, validatedData } = await userValidator.linkCareteamAndPatients(ctx.request.body);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }
      const careteamList = await request.post(
        ctx,
        `${config.databaseUrl}/user/is-careteam-available`,
        {
          careteamId: validatedData.careteamId,
        },
        commonService.setHeaders(ctx.request.headers)
      );
      if (!careteamList.data || !careteamList.data.result) {
        ctx.res.unprocessableEntity({ msg: responseMessages[1003] });
        return;
      }
      const patientList = await request.post(
        ctx,
        `${config.databaseUrl}/user/is-patients-available`,
        {
          patientIds: validatedData.patientIds,
        },
        commonService.setHeaders(ctx.request.headers)
      );
      // console.log("patientList.........", patientList.data);
      if (
        !patientList.data ||
        (patientList.data && patientList.data.result.length !== validatedData.patientIds.length)
      ) {
        ctx.res.unprocessableEntity({ msg: responseMessages[1004] });
        return;
      }

      const careteamCircles = await request.post(
        ctx,
        `${config.databaseUrl}/user/care-team-circles`,
        {
          careteamId: validatedData.careteamId,
        },
        commonService.setHeaders(ctx.request.headers)
      );

      const patientListArray = patientList.data.result;
      const { patientIds } = validatedData;
      const careteamCirceIds = _.map(careteamCircles.data.result, 'toId');
      const removedCirclesIds = _.difference(careteamCirceIds, patientIds);
      const createdPatientIds = _.difference(patientIds, careteamCirceIds);
      const filteredPatientList = _.filter(patientListArray, (o) => createdPatientIds.includes(o.uuid));
      if (removedCirclesIds.length > 0) {
        await request.post(
          ctx,
          `${config.databaseUrl}/user/unlink-careteams-with-patients`,
          {
            patientIds: removedCirclesIds,
            teamId: validatedData.careteamId,
          },
          commonService.setHeaders(ctx.request.headers)
        );
      }
      const mappedData = await mapCareteamsAndPatientData(careteamList.data.result, filteredPatientList);
      const createdCircle = await request.post(
        ctx,
        `${config.databaseUrl}/user/link-careteams-to-patients`,
        {
          linkArray: mappedData,
        },
        commonService.setHeaders(ctx.request.headers)
      );
      ctx.res.ok({ result: createdCircle.data });
    } catch (error) {
      console.log('error.........', error);
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
  listCareteams: async (ctx) => {
    try {
      const { error, validatedData } = await userValidator.validateListCareteams(ctx.request.query);

      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }

      const keyArr = Object.keys(validatedData);
      const valueArr = keyArr.map((innerData) => validatedData[innerData]);

      const allCareteams = await request.get(
        ctx,
        commonService.updateQueryStringParameter(`${ctx.req.hitUrl}`, keyArr, valueArr),
        commonService.setHeaders(ctx.request.headers)
      );
      ctx.res.ok({ result: allCareteams.data });
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
  listUsersInCareteams: async (ctx) => {
    try {
      const { error, validatedData } = await userValidator.validateListUsersInCareteams(ctx.request.query);

      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }

      const keyArr = Object.keys(validatedData);
      const valueArr = keyArr.map((innerData) => validatedData[innerData]);

      const allCareteams = await request.get(
        ctx,
        commonService.updateQueryStringParameter(`${ctx.req.hitUrl}`, keyArr, valueArr),
        commonService.setHeaders(ctx.request.headers)
      );
      ctx.res.ok({ result: allCareteams.data });
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
  removeUserCircleConnection: async (ctx) => {
    try {
      const { error, validatedData } = await userValidator.validateRemoveUserConnections(ctx.request.body);

      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }
      const removeCircleResp = await request.patch(
        ctx,
        `${ctx.req.hitUrl}`,
        validatedData,
        commonService.setHeaders(ctx.request.headers)
      );
      ctx.res.success({
        ...removeCircleResp.data,
        statusCode: removeCircleResp.status,
      });
      return;
    } catch (error) {
      console.log('\n  removeUserCircleConnection error... ', error);
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
  deactivateUsers: async (ctx) => {
    try {
      const { error, validatedData } = await userValidator.validateDeactivateUsers(ctx.request.body);

      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }
      const removeCircleResp = await request.patch(
        ctx,
        `${ctx.req.hitUrl}`,
        validatedData,
        commonService.setHeaders(ctx.request.headers)
      );
      ctx.res.success({
        ...removeCircleResp.data,
        statusCode: removeCircleResp.status,
      });
      return;
    } catch (error) {
      console.log('\n  deactivateUsers error... ', error);
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
  removeUserFromCareTeam: async (ctx) => {
    try {
      const { error, validatedData } = await userValidator.validateRemoveUserFromCareTeam(ctx.request.body);

      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }
      const removeCircleResp = await request.patch(
        ctx,
        `${ctx.req.hitUrl}`,
        validatedData,
        commonService.setHeaders(ctx.request.headers)
      );
      ctx.res.success({
        ...removeCircleResp.data,
        statusCode: removeCircleResp.status,
      });
      return;
    } catch (error) {
      console.log('\n  deactivateUsers error... ', error);
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
  checkEmailExist: async (ctx) => {
    try {
      const { error, validatedData } = await userValidator.validateCheckEmailExist(ctx.request.body);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }
      const userSavedResp = await request.post(
        ctx,
        `${ctx.req.hitUrl}`,
        validatedData,
        commonService.setHeaders(ctx.request.headers)
      );
      ctx.res.success({
        ...userSavedResp.data,
        statusCode: userSavedResp.status,
      });
    } catch (error) {
      console.log('\n user create error... ', error);
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
  getInvitedUsers: async (ctx) => {
    try {
      const { error, validatedData } = await userValidator.validateGetInvitedUsers(ctx.request.body);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }
      const userSavedResp = await request.post(
        ctx,
        `${ctx.req.hitUrl}`,
        validatedData,
        commonService.setHeaders(ctx.request.headers)
      );
      ctx.res.success({
        ...userSavedResp.data,
        statusCode: userSavedResp.status,
      });
    } catch (error) {
      console.log('\n user create error... ', error);
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
  updateUserModule: async (ctx) => {
    try {
      const { error, validatedData } = await userValidator.validateUpdateUserModule(ctx.request.body);

      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }
      const putResp = await request.put(
        ctx,
        `${ctx.req.hitUrl}`,
        validatedData,
        commonService.setHeaders(ctx.request.headers)
      );
      ctx.res.success({
        ...putResp.data,
        statusCode: putResp.status,
      });
    } catch (error) {
      console.log('\n user profile update error... ', error);
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
  getRoles: async (ctx) => {
    try {
      const getResp = await request.get(
        ctx,
        `${ctx.req.hitUrl}`,
        commonService.setHeaders(ctx.request.headers)
      );
      ctx.res.success({
        ...getResp.data,
        statusCode: getResp.status,
      });
    } catch (error) {
      // console.log('\n get directory users error... ', error);
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
  updateRolePermission: async (ctx) => {
    try {
      const { error, validatedData } = await userValidator.validateUpdateRolePermission(ctx.request.body);

      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }
      const putResp = await request.put(
        ctx,
        `${ctx.req.hitUrl}`,
        validatedData,
        commonService.setHeaders(ctx.request.headers)
      );
      ctx.res.success({
        ...putResp.data,
        statusCode: putResp.status,
      });
    } catch (error) {
      console.log('\n user profile update error... ', error);
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
  //User Role Scope 
  getRoleScopeById: async (ctx) => {
    try {
      const getResp = await request.get(
        ctx,
        `${ctx.req.hitUrl}`,
        commonService.setHeaders(ctx.request.headers)
      );
      ctx.res.success({
        ...getResp.data,
        statusCode: getResp.status,
      });
    } catch (error) {
      // console.log('\n get directory users error... ', error);
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
  updateRoleScopeRecord: async (ctx) => {
    try {
      const { error, validatedData } = await userValidator.validateUpdateRoleScopeModule(ctx.request.body);

      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }
      const putResp = await request.put(
        ctx,
        `${ctx.req.hitUrl}`,
        validatedData,
        commonService.setHeaders(ctx.request.headers)
      );
      ctx.res.success({
        ...putResp.data,
        statusCode: putResp.status,
      });
    } catch (error) {
      console.log('\n user profile update error... ', error);
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
