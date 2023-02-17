const { googleapi, jwksClient, jwt, uuidv4, querystring, fs } = require('../services/imports');
const config = require('../config/config');
const authValidator = require('../validators/auth');
const commonService = require('../services/common-service');
const mapFhirData = require('../fhirMapping/user');
const request = require('../middleware/axios-request');
const responseMessages = require('../middleware/response-messages');

async function getNhsJWTToken({ clientId, audience, privateKeyPath }) {
  try {
    const tokenPayload = {
      sub: clientId,
      iss: clientId,
      aud: audience,
      jti: uuidv4(), // new unique id
    };

    const cert = fs.readFileSync(privateKeyPath);

    return jwt.sign(tokenPayload, cert, { algorithm: 'RS512', expiresIn: 60 });
  } catch (error) {
    console.log('\n nhs jwt token generate error...', error);
    return '';
  }
}

async function getNhsAccessToken({ clientId, audience, nhsJWTToken, clientAuthorizeCode, loginRedirectUrl }) {
  try {
    const formData = {
      code: clientAuthorizeCode,
      client_id: clientId,
      redirect_uri: loginRedirectUrl,
      grant_type: 'authorization_code',
      client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
      client_assertion: nhsJWTToken,
      typ: 'JWT',
    };

    const response = await request.post('', `${audience}`, querystring.stringify(formData));
    // get the id_token out of the response (this is the JWT)
    return response.data;
  } catch (error) {
    console.log('\n nhs access token generate error...', error);
    return { access_token: '', refresh_token: '', id_token: '' };
  }
}

async function getNhsUserInfo({ nhsLoginTokenHost, nhsAccessToken }) {
  try {
    const userInfoResp = await request.get('', `https://${nhsLoginTokenHost}/userinfo`, {
      headers: { Authorization: `Bearer ${nhsAccessToken}` },
    });
    return userInfoResp.data;
  } catch (error) {
    console.log('\n nhs user info get error...', error);
    return '';
  }
}

async function getGoogleUserInfo({ googleAccessToken }) {
  try {
    const { google } = googleapi;
    const { OAuth2 } = google.auth;
    const oauth2Client = new OAuth2();
    oauth2Client.setCredentials({
      access_token: googleAccessToken,
    });
    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: 'v2',
    });
    const getUserInfo = await oauth2.userinfo.get();
    return getUserInfo;
  } catch (error) {
    console.log('\n google user info get error...', error);
    return '';
  }
}

async function getAzureUserInfo({ azureAccessToken }) {
  try {
    const client = jwksClient({
      jwksUri: 'https://login.microsoftonline.com/common/discovery/v2.0/keys',
    });
    const decodedValue = jwt.decode(azureAccessToken, { complete: true });
    const azureUserData = await client.getSigningKey(decodedValue.header.kid);
    console.log('azureUserData', azureUserData);
    if (!azureUserData) {
      return {
        status: 500,
        body: { msg: responseMessages[1003] },
      };
    }
    const signingKey = azureUserData.publicKey || azureUserData.rsaPublicKey;
    const decoded = await jwt.verify(azureAccessToken, signingKey, { algorithms: ['RS256'] });
    return { decoded };
  } catch (error) {
    console.log('\n azure user info get error...', error);
    return {
      status: 500,
      body: { msg: responseMessages[1003] },
    };
  }
}

async function saveUserInFhir(userPayload = {}) {
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
      return { status: 0, msg: responseMessages[1004] };
    }

    const usernameCheck = await request.get('', requestUrl, {
      params: { ...requestParams, ...{ name: userPayload.username } },
    });
    if (usernameCheck.data.total) return { status: 0, msg: responseMessages[1005] };

    if (userPayload.mobileNumber) {
      const mobileNumberCheck = await request.get('', requestUrl, {
        params: { ...requestParams, ...{ phone: userPayload.mobileNumber } },
      });
      if (mobileNumberCheck.data.total) return { status: 0, msg: responseMessages[1006] };
    }

    const userMappingData = mapFhirData.fhirMapping(userPayload);
    const postResp = await request.post('', requestUrl, userMappingData);
    return postResp.data;
  } catch (error) {
    console.log('\n save user in fhir error...', error);
    return {
      status: 500,
      body: {
        msg: 'FHIR Server Error',
      },
    };
  }
}

async function deleteUserInFhir(queryObj) {
  try {
    const requestParams = {
      _tag: `${config.fhirTagUrl}|${config.fhirTagCode}`,
    };
    if (queryObj._id) requestParams._id = queryObj._id;
    else if (queryObj.email) requestParams.email = encodeURIComponent(queryObj.email);
    else if (queryObj.username) requestParams.name = queryObj.username;
    else if (queryObj.mobileNumber) requestParams.phone = queryObj.mobileNumber;

    if (Object.keys(requestParams).length > 1) {
      await request.delete('', `${config.fhirServerUrl}/Patient`, { params: requestParams });
    }
    return { status: 1 };
  } catch (error) {
    console.log('\n delete user in fhir error...', error);
    return {
      status: 500,
      body: {
        msg: 'FHIR Server Error',
      },
    };
  }
}

module.exports = {
  signUp: async (ctx) => {
    try {
      const { error, validatedData } = await authValidator.validateSignUpUser(ctx.request.body);
      if (error) {
        console.log('\n error...', error);
        ctx.res.unprocessableEntity({ error });
        return;
      }

      switch (validatedData.loginType) {
        case 'google':
          const getUserInfo = await getGoogleUserInfo({ googleAccessToken: validatedData.accessToken });
          if (!getUserInfo) {
            ctx.res.internalServerError({ msg: responseMessages[1002] });
            return;
          }
          const gmailValue = (getUserInfo.data && getUserInfo.data.email) || '';
          if (gmailValue === validatedData.email) {
            const fhirResponse = await saveUserInFhir(validatedData);
            if (!fhirResponse.id) {
              ctx.res.badRequest({ error: fhirResponse });
              return;
            }
            validatedData.fhirId = fhirResponse.id;
            const postResp = await request.post(ctx, `${ctx.req.hitUrl}`, validatedData);
            ctx.res.success({
              ...postResp.data,
              statusCode: postResp.status,
            });
            return;
          }
          ctx.res.forbidden({ msg: responseMessages[1001] });
          return;
        case 'azure':
          const azureUserDataResp = await getAzureUserInfo({
            azureAccessToken: validatedData.accessToken,
            authoriseCode: validatedData.accessCode,
          });
          if (!azureUserDataResp.decoded) {
            ctx.res.internalServerError({ ...azureUserDataResp.body });
          }

          if (azureUserDataResp.decoded && azureUserDataResp.decoded.email === validatedData.email) {
            const fhirResponse = await saveUserInFhir(validatedData);
            if (!fhirResponse.id) {
              ctx.res.badRequest({ error: fhirResponse });
              return;
            }
            validatedData.fhirId = fhirResponse.id;
            if (validatedData.roleName !== 'Clinician') {
              validatedData.roleName = null;
            }
            const postResp = await request.post(ctx, `${ctx.req.hitUrl}`, validatedData);
            ctx.res.success({
              ...postResp.data,
              statusCode: postResp.status,
            });
            return;
          }
          ctx.res.forbidden({ msg: responseMessages[1001] });
          return;
        case 'nhs':
          // const nhsJwtToken = await getNhsJWTToken({
          //     clientId: config.nhsClientId, audience: config.nhsAudience, privateKeyPath: `${__dirname}/../../${config.nhsPrivateKeyPath}`
          // });
          // const { access_token } = await getNhsAccessToken({
          //     clientId: config.nhsClientId, audience: config.nhsAudience,
          //     nhsJWTToken: nhsJwtToken, clientAuthorizeCode: validatedData.accessCode,
          //     loginRedirectUrl: config.nhsLoginRedirectUrl
          // });
          const nhsUserInfo = await getNhsUserInfo({
            nhsLoginTokenHost: config.nhsLoginTokenHost,
            nhsAccessToken: validatedData.accessToken,
          });
          if (nhsUserInfo && nhsUserInfo.email && nhsUserInfo.email === validatedData.email) {
            const fhirResponse = await saveUserInFhir(validatedData);
            if (!fhirResponse.id) {
              ctx.res.badRequest({ error: fhirResponse });
              return;
            }
            validatedData.fhirId = fhirResponse.id;
            const postResp = await request.post(ctx, `${ctx.req.hitUrl}`, validatedData);
            ctx.res.success({
              ...postResp.data,
              statusCode: postResp.status,
            });
            return;
          }
          ctx.res.forbidden({ msg: responseMessages[1001] });
          return;
        default:
          const fhirResponse = await saveUserInFhir(validatedData);
          if (!fhirResponse.id) {
            ctx.res.badRequest({ error: fhirResponse });
            return;
          }
          validatedData.fhirId = fhirResponse.id;
          const postResp = await request.post(ctx, `${ctx.req.hitUrl}`, validatedData);
          ctx.res.success({
            ...postResp.data,
            statusCode: postResp.status,
          });
          return;
      }
    } catch (error) {
      if (error.status) {
        if (error.status === 409 && error.config && error.config.data) {
          const postData = JSON.parse(error.config.data);
          if (postData.fhirId) await deleteUserInFhir({ _id: postData.fhirId });
        }
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
  login: async (ctx) => {
    try {
      const { error, validatedData } = await authValidator.validateLoginUser(ctx.request.body);
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
      console.log('\n login error...', error);
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
  loginWithOtp: async (ctx) => {
    try {
      const { error, validatedData } = await authValidator.validateLoginWithOtp(ctx.request.body);
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
      console.log('\n login error...', error);
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
  sendResetPasswordMail: async (ctx) => {
    try {
      const { error, validatedData } = await authValidator.validateResetPassowrdMail(ctx.request.body);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }
      const postResp = await request.patch(
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
      console.log('\n login error...', error);
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
  resetPassword: async (ctx) => {
    try {
      const { error, validatedData } = await authValidator.validateResetPassowrd(ctx.request.body);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }
      const postResp = await request.patch(
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
      console.log('\n login error...', error);
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
  getAccessTokenSignUpOtp: async (ctx) => {
    try {
      const { error } = await authValidator.validateGetAccessTokenSignUpOtp(ctx.request.query);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }
      const postResp = await request.get(ctx, `${ctx.req.hitUrl}`, commonService.setHeaders(ctx.request.headers));
      ctx.res.success({
        ...postResp.data,
        statusCode: postResp.status,
      });
    } catch (error) {
      console.log('\n login error...', error);
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
  generateQBToken: async (ctx) => {
    try {
      const { error, validatedData } = await authValidator.generateQBToken(ctx.request.body);
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
      console.log('\n login error...', error);
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
  getRefreshToken: async (ctx) => {
    try {
      const { error, validatedData } = await authValidator.validateRefreshToken(ctx.request.body);
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
      console.log('\n get-refresh-token error...', error);
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
  verifyUserResetToken: async (ctx) => {
    try {
      const { error } = await authValidator.validateVerifyUserToken(ctx.request.query);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }
      const postResp = await request.get(ctx, `${ctx.req.hitUrl}`, commonService.setHeaders(ctx.request.headers));
      ctx.res.success({
        ...postResp.data,
        statusCode: postResp.status,
      });
    } catch (error) {
      console.log('\n login error...', error);
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
  verifyUserAccount: async (ctx) => {
    try {
      const { error, validatedData } = await authValidator.validateVerifyUserAccount(ctx.request.body);
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
  thirdPartyAuth: async (ctx) => {
    try {
      const { error, validatedData } = await authValidator.validateThirdPartyAuth(ctx.request.body);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }

      switch (validatedData.loginType) {
        case 'google':
          const getUserInfo = await getGoogleUserInfo({ googleAccessToken: validatedData.accessToken });
          if (!getUserInfo) {
            ctx.res.internalServerError({ msg: responseMessages[1002] });
            return;
          }
          const gmailValue = getUserInfo.data.email;
          if (gmailValue === validatedData.email) {
            const postResp = await request.post(
              ctx,
              `${config.databaseUrl}/auth/login`,
              validatedData,
              commonService.setHeaders(ctx.request.headers)
            );
            ctx.res.success({
              ...postResp.data,
              statusCode: postResp.status,
            });
            return;
          }

          ctx.res.forbidden({ msg: responseMessages[1001] });
          return;
        case 'azure':
          const azureUserDataResp = await getAzureUserInfo({
            azureAccessToken: validatedData.accessToken,
            authoriseCode: validatedData.accessCode,
          });
          if (!azureUserDataResp.decoded) {
            ctx.res.internalServerError({ ...azureUserDataResp.body });
            return;
          }

          if (azureUserDataResp.decoded.email === validatedData.email) {
            const postResp = await request.post(
              ctx,
              `${config.databaseUrl}/auth/login`,
              validatedData,
              commonService.setHeaders(ctx.request.headers)
            );
            ctx.res.success({
              ...postResp.data,
              statusCode: postResp.status,
            });
            return;
          }
          ctx.res.forbidden({ msg: responseMessages[1001] });
          return;
        case 'nhs':
          const nhsJwtToken = await getNhsJWTToken({
            clientId: config.nhsClientId,
            audience: config.nhsAudience,
            privateKeyPath: `${config.nhsPrivateKeyPath}`,
          });
          const { access_token } = await getNhsAccessToken({
            clientId: config.nhsClientId,
            audience: config.nhsAudience,
            nhsJWTToken: nhsJwtToken,
            clientAuthorizeCode: validatedData.accessCode,
            loginRedirectUrl: config.nhsLoginRedirectUrl,
          });

          const nhsUserInfo = await getNhsUserInfo({
            nhsLoginTokenHost: config.nhsLoginTokenHost,
            nhsAccessToken: access_token,
          });
          if (nhsUserInfo && nhsUserInfo.email) {
            validatedData.email = nhsUserInfo.email;
            nhsUserInfo.accessToken = access_token;
            try {
              const postResp = await request.post(
                ctx,
                `${config.databaseUrl}/auth/login`,
                validatedData,
                commonService.setHeaders(ctx.request.headers)
              );
              ctx.res.success({
                ...postResp.data,
                statusCode: postResp.status,
              });
            } catch (error) {
              console.log('\n thirdparty nhs auth error...', error);
              if (error.status) {
                if (error.status < 500) {
                  ctx.res.clientError({
                    error: error.status === 404 ? { ...error.error, nhsUserInfo } : error.error,
                    statusCode: error.status,
                  });
                } else {
                  ctx.res.internalServerError({ ...error.error });
                }
              } else {
                ctx.res.internalServerError({ error });
              }
            }
            return;
          }
          ctx.res.forbidden({ msg: responseMessages[1001] });
          return;
      }
    } catch (error) {
      console.log('\n thirdparty auth error...', error);
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
  getUserDataFromNhs: async (ctx) => {
    try {
      const { error, validatedData } = await authValidator.validateGetUserFromNhs(ctx.request.query);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }

      const nhsJwtToken = await getNhsJWTToken({
        clientId: config.nhsClientId,
        audience: config.nhsAudience,
        privateKeyPath: `${config.nhsPrivateKeyPath}`,
      });
      const { access_token } = await getNhsAccessToken({
        clientId: config.nhsClientId,
        audience: config.nhsAudience,
        nhsJWTToken: nhsJwtToken,
        clientAuthorizeCode: validatedData.authoriseCode,
        loginRedirectUrl: config.nhsLoginRedirectUrl,
      });

      const nhsUserInfo = await getNhsUserInfo({
        nhsLoginTokenHost: config.nhsLoginTokenHost,
        nhsAccessToken: access_token,
      });
      if (!nhsUserInfo) {
        ctx.res.forbidden({ msg: responseMessages[1007] });
        return;
      }
      ctx.res.ok({ result: { nhsUserInfo, access_token } });
      return;
    } catch (error) {
      console.log('\n login error...', error);
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
  checkUserAlreadyExists: async (ctx) => {
    try {
      const { error, validatedData } = await authValidator.validateUserExists(ctx.request.body);
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
      console.log('\n login error...', error);
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
  deleteUser: async (ctx) => {
    try {
      const { error, validatedData } = await authValidator.validateDeleteUser(ctx.request.query);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }
      const fhirResponse = await deleteUserInFhir(validatedData);
      if (fhirResponse.status === 500) {
        ctx.res.internalServerError({ ...fhirResponse.body });
        return;
      }
      const postResp = await request.delete(
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
      console.log('\n login error...', error);
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
  changeUserRole: async (ctx) => {
    try {
      const { error, validatedData } = await authValidator.validateChangeUserRole(ctx.request.body);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }
      const postResp = await request.patch(ctx, `${ctx.req.hitUrl}`, validatedData);
      ctx.res.success({
        ...postResp.data,
        statusCode: postResp.status,
      });
    } catch (error) {
      console.log('\n login error...', error);
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

  updateUserInvite: async (ctx) => {
    try {
      const { error, validatedData } = await authValidator.updateUserInvite(ctx.request.body);
      if (error) {
        return ctx.res.unprocessableEntity({ msg: error.message });
      }
      const userData = await request.post(ctx, `${config.databaseUrl}/circle/check-user-available`, validatedData);
      if (!userData.data.result) {
        return ctx.res.unprocessableEntity({ msg: responseMessages[1008] });
      }
      ctx.request.body.toId = userData.data.result.uuid;
      const userInvite = await request.post(ctx, `${config.databaseUrl}/auth/update-user-invite`, ctx.request.body);
      return ctx.res.ok({ result: userInvite.data.result });
    } catch (error) {
      // console.log("error.............", error);
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
  getAppSettings: async (ctx) => {
    try {
      const getResp = await request.get(ctx, `${ctx.req.hitUrl}`, commonService.setHeaders(ctx.request.headers));
      ctx.res.success({
        ...getResp.data,
        statusCode: getResp.status,
      });
    } catch (error) {
      console.log('\n getAppSettings error...', error);
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
