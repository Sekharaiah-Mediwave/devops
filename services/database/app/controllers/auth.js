const commonService = require('../services/common-service');
const dbService = require('../services/db-service');
const queue = require('../services/queue');
const { Sequelize } = require('../config/sequelize');
const { _, jwt, uuidv4 } = require('../services/imports');
const config = require('../config/config');
const db = require('../config/sequelize');
const responseMessages = require('../middleware/response-messages');
const request = require('../middleware/axios-request');

const { Op } = Sequelize;

async function getAccessRefreshToken({ tokenPaylod }) {
  try {
    const accessToken = await commonService.token(tokenPaylod, 'access');
    const refreshToken = await commonService.token(tokenPaylod, 'refresh');
    return { accessToken, refreshToken };
  } catch (error) {
    return { accessToken: '', refreshToken: '' };
  }
}

async function doSignUp({ savePayload, roleName }) {
  try {
    let savedRes = await dbService.create('user', savePayload, {});

    if (!savedRes) {
      return {
        status: 403,
        body: {
          msg: responseMessages[1045],
        },
      };
    }

    savedRes = savedRes.toJSON();

    const roleFindRes = await dbService.findOne('roles', { where: { name: roleName } });

    const roleSavedRes = await dbService.create(
      'user_role',
      { uuid: uuidv4(), userId: savedRes.uuid, roleId: roleFindRes.uuid },
      {}
    );

    const directorySettingsSavedRes = await dbService.create(
      'directory_settings',
      { uuid: uuidv4(), userId: savedRes.uuid, visible: true },
      {}
    );

    return {
      status: 200,
      body: { ...savedRes, role: roleSavedRes, directorySettings: directorySettingsSavedRes },
    };
  } catch (error) {
    console.log('\n user save error...', error);
    if (error.error && error.error.name === 'SequelizeUniqueConstraintError') {
      return {
        status: 409,
        body: {
          msg: error.error.message,
          error,
        },
      };
    }
    return {
      status: 500,
      body: {
        msg: responseMessages[1046],
        error,
      },
    };
  }
}

async function doUserUpdate({ findQuery, updatePayload }) {
  try {
    const updateResp = await dbService.update('user', updatePayload, findQuery, {});

    if (!updateResp) {
      return {
        status: 500,
        body: {
          msg: responseMessages[1047],
        },
      };
    }
    return {
      status: 200,
      body: updateResp,
    };
  } catch (error) {
    console.log('\n nhs user info get error...', error);
    return {
      status: 500,
      body: {
        msg: responseMessages[1047],
        error,
      },
    };
  }
}

module.exports = {
  signUp: async (ctx) => {
    try {
      const savePayload = {
        uuid: uuidv4(),
        username: ctx.request.body.username,
        password: ctx.request.body.password,
        email: ctx.request.body.email,
        firstName: ctx.request.body.firstName,
        lastName: ctx.request.body.lastName,
        mobileNumber: ctx.request.body.mobileNumber,
        nhsNumber: ctx.request.body.nhsNumber,
        dob: ctx.request.body.dob,
        fhirId: ctx.request.body.fhirId,
        loginType: ctx.request.body.loginType || 'normal',
      };
      switch (savePayload.loginType) {
        case 'nhs':
          savePayload.status = 'Active';
          break;
        case 'google':
          savePayload.status = 'Active';
          break;
        case 'azure':
          savePayload.status = 'Active';
          break;
      }

      if (savePayload.mobileNumber) {
        const findRes = await dbService.findOne(
          'user',
          { where: { mobileNumber: savePayload.mobileNumber }, attributes: ['uuid'] },
          {},
          {}
        );
        if (findRes) {
          return ctx.res.conflict({ msg: responseMessages[1029] });
        }
      }
      let newRole = ctx.request.body.roleName || config.roleNames.p;

      if (ctx.request.body.invitedUser) {
        const inviteCodeExist = await dbService.findOne('invite', {
          where: { email: ctx.request.body.email, inviteCode: ctx.request.body.inviteCode },
        });
        if (!inviteCodeExist) {
          return ctx.res.badRequest({ msg: responseMessages[1150] });
        }

        savePayload.uuid = inviteCodeExist.uuid;
        // find user role
        const userRole = await dbService.findOne('user', {
          where: {
            uuid: inviteCodeExist.fromId,
          },
          include: [
            {
              model: 'user_role',
              as: 'userRole',
              include: [{ model: 'roles', as: 'roleInfo' }]
            },
          ],
        });

        if (userRole.userRole.roleInfo.name === 'Super Admin') {
          if (inviteCodeExist?.relationship == 'admin') {
            newRole = config.roleNames.a;
          } else if (inviteCodeExist?.relationship == 'superadmin') {
            newRole = config.roleNames.sa;
          } else if (inviteCodeExist?.relationship == 'clinicians') {
            newRole = config.roleNames.cl;
          } else {
            newRole = config.roleNames.p;
          }
        }
        savePayload.status = 'Active';
      }

      const savedRes = await doSignUp({ savePayload, roleName: newRole });

      if (savedRes.status != 200) {
        if (savedRes.status < 500) {
          return ctx.res.clientError({
            ...savedRes.body,
            statusCode: savedRes.status,
          });
        }
        if (savedRes.status == 500) {
          return ctx.res.internalServerError({ ...savedRes.body });
        }
      }

      let verificationCode;
      let accessToken;
      let refreshToken;
      if (savePayload.loginType == 'normal' && !ctx.request.body.invitedUser) {
        verificationCode = commonService.generateRandomNumber();
        await dbService.create('user_verification', {
          uuid: uuidv4(),
          verificationCode,
          userId: savedRes.body.uuid,
          verificationType: 'SignupAccount',
        });
      } else {
        const tokenResp = await getAccessRefreshToken({
          tokenPaylod: {
            uuid: savedRes.body.uuid,
            username: savedRes.body.username,
            mobileNumber: savedRes.body.mobileNumber,
            email: savedRes.body.email,
            role: ctx.request.body.roleName || config.roleNames.p,
          },
        });
        accessToken = tokenResp.accessToken;
        refreshToken = tokenResp.refreshToken;
      }

      const updateResp = await doUserUpdate({
        findQuery: { where: { uuid: savedRes.body.uuid } },
        updatePayload: {
          accessToken,
          refreshToken,
          lastLoginDate: commonService.indiaTz().toDate(),
        },
      });

      if (updateResp.status != 200) {
        if (updateResp.status < 500) {
          return ctx.res.clientError({
            ...updateResp.body,
            statusCode: updateResp.status,
          });
        }
        if (updateResp.status == 500) {
          return ctx.res.internalServerError({ ...updateResp.body });
        }
      }

      if (savePayload.loginType == 'normal' && !ctx.request.body.invitedUser) {
        await request.post(ctx, `${config.emailUrl}/email/auth/send-sign-up-verification-mail`, {
          username: savedRes.body.username,
          token: verificationCode,
          email: savedRes.body.email,
        });
      }

      return ctx.res.ok({
        msg: 'success',
        result:
          savePayload.loginType != 'normal'
            ? {
              uuid: savedRes.body.uuid,
              firstName: savedRes.body.firstName,
              mobileNumber: savedRes.body.mobileNumber,
              email: savedRes.body.email,
              accessToken,
              refreshToken,
            }
            : '',
      });
    } catch (error) {
      console.log('\n user save error...', error);
      if (error.error && error.error.name === 'SequelizeUniqueConstraintError') {
        return ctx.res.conflict({
          msg: error.error.message,
          err: error,
        });
      }
      return ctx.res.internalServerError({ error });
    }
  },
  loginWithOtp: async (ctx) => {
    try {
      const findQuery = {
        where: {},
        include: [
          {
            model: 'user_profile',
            as: 'userProfile',
            required: false,
            include: [{ model: 'centre', as: 'centre', required: false }],
          },
          {
            model: 'user_role',
            as: 'userRole',
            include: [{ model: 'roles', as: 'roleInfo' }],
          },
        ],
      };
      if (ctx.request.body.username) {
        findQuery.where = {
          ...findQuery.where,
          [Sequelize.Op.or]: [
            {
              email: ctx.request.body.username,
            },
            {
              username: ctx.request.body.username,
            },
          ],
        };
      }

      if (ctx.request.body.email) {
        findQuery.where.email = ctx.request.body.email;
      }

      if (ctx.request.body.email && ctx.request.body.username) {
        findQuery.where = {
          ...findQuery.where,
          [Sequelize.Op.or]: [
            {
              email: ctx.request.body.email,
            },
            {
              username: ctx.request.body.username,
            },
          ],
        };
      }

      let findRes = await dbService.findOne('user', findQuery);

      if (!findRes) {
        ctx.res.notFound({ msg: responseMessages[1013] });
        return;
      }

      findRes = findRes.toJSON();

      const userVerificationFindRes = await dbService.findOne('user_verification', {
        where: { userId: findRes.uuid, verificationType: 'loginOtp' },
      });

      if (
        !userVerificationFindRes ||
        (userVerificationFindRes && userVerificationFindRes.verificationCode != ctx.request.body.otp)
      ) {
        ctx.res.unprocessableEntity({ msg: responseMessages[1019] });
        return;
      }

      const passwordMatch = await commonService.comparePassword(ctx.request.body.password, findRes.password);

      if (passwordMatch) {
        if (findRes.status === 'Inactive') {
          ctx.res.forbidden({ msg: responseMessages[1030] });
          return;
        }

        await dbService.destroy('user_verification', { where: { uuid: userVerificationFindRes.uuid } });

        const { accessToken, refreshToken } = await getAccessRefreshToken({
          tokenPaylod: {
            uuid: findRes.uuid,
            username: findRes.username,
            mobileNumber: findRes.mobileNumber,
            email: findRes.email,
            role: findRes.userRole.roleInfo.name,
          },
        });

        const updateResp = await doUserUpdate({
          findQuery: { where: { uuid: findRes.uuid } },
          updatePayload: {
            accessToken,
            refreshToken,
            lastLoginDate: commonService.indiaTz().toDate(),
          },
        });

        if (updateResp.status != 200) {
          ctx.res.internalServerError({ ...updateResp.body });
          return;
        }

        delete findRes.password;

        ctx.res.ok({ result: { ...findRes, accessToken, refreshToken } });
        return;
      }
      ctx.res.forbidden({ msg: responseMessages[1031] });
      return;
    } catch (error) {
      console.log('\n error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  login: async (ctx) => {
    try {
      const findQuery = {
        where: {},
        include: [
          {
            model: 'user_profile',
            as: 'userProfile',
            required: false,
            include: [{ model: 'centre', as: 'centre', required: false }],
          },
          {
            model: 'user_role',
            as: 'userRole',
            include: [{ model: 'roles', as: 'roleInfo' }],
          },
          {
            model: 'authenticated_apps',
            as: 'authenticatedApps',
          },
        ],
      };
      if (ctx.request.body.username) {
        findQuery.where = {
          ...findQuery.where,
          [Sequelize.Op.or]: [
            {
              email: ctx.request.body.username,
            },
            {
              username: ctx.request.body.username,
            },
          ],
        };
      }

      if (ctx.request.body.email) {
        findQuery.where.email = ctx.request.body.email;
      }

      if (ctx.request.body.email && ctx.request.body.username) {
        findQuery.where = {
          ...findQuery.where,
          [Sequelize.Op.or]: [
            {
              email: ctx.request.body.email,
            },
            {
              username: ctx.request.body.username,
            },
          ],
        };
      }

      let findRes = await dbService.findOne('user', findQuery, {}, {});

      if (!findRes) {
        ctx.res.notFound({ msg: responseMessages[1013] });
        return;
      }

      findRes = findRes.toJSON();

      let passwordMatch = false;
      const thirdPartyLoginTypes = ['google', 'nhs', 'azure'];
      if (
        thirdPartyLoginTypes.includes(ctx.request.body.loginType) &&
        (thirdPartyLoginTypes.includes(findRes.loginType) || findRes.loginType == 'normal')
      ) {
        passwordMatch = true;
      } else if (ctx.request.body.loginType == 'normal') {
        passwordMatch = await commonService.comparePassword(ctx.request.body.password || '', findRes.password || '');
      }

      if (thirdPartyLoginTypes.includes(findRes.loginType) && ctx.request.body.loginType == 'normal') {
        ctx.res.notAcceptable({ msg: responseMessages[1153] });
        return;
      }

      if (passwordMatch) {
        if (findRes.status === 'deleted') {
          ctx.res.forbidden({ msg: responseMessages[1157] });
          return;
        }
        if (findRes.status === 'Inactive') {
          ctx.res.forbidden({ msg: responseMessages[1030] });
          return;
        }

        if (findRes.mailOtp && findRes.loginType == 'normal') {
          const verificationCode = commonService.generateRandomNumber();
          await dbService.findOneAndUpsert(
            'user_verification',
            { where: { verificationType: 'loginOtp', userId: findRes.uuid } },
            { verificationCode, userId: findRes.uuid, verificationType: 'loginOtp' }
          );
          await request.post(ctx, `${config.emailUrl}/email/auth/send-login-otp`, {
            token: verificationCode,
            name: findRes.firstName,
            email: findRes.email,
          });
          ctx.res.accepted({ msg: responseMessages[1032] });
          return;
        }

        const { accessToken, refreshToken } = await getAccessRefreshToken({
          tokenPaylod: {
            uuid: findRes.uuid,
            username: findRes.username,
            mobileNumber: findRes.mobileNumber,
            email: findRes.email,
            role: findRes.userRole.roleInfo.name,
          },
        });

        const updateResp = await doUserUpdate({
          findQuery: { where: { uuid: findRes.uuid } },
          updatePayload: {
            accessToken,
            refreshToken,
            lastLoginDate: commonService.indiaTz().toDate(),
          },
        });

        if (updateResp.status != 200) {
          ctx.res.internalServerError({ ...updateResp.body });
          return;
        }

        delete findRes.password;

        ctx.res.ok({ result: { ...findRes, accessToken, refreshToken } });
        return;
      }
      ctx.res.forbidden({ msg: responseMessages[1031] });
      return;
    } catch (error) {
      console.log('\n error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  generateQBToken: async (ctx) => {
    try {
      const findQuery = {
        where: { uuid: ctx.req.decoded.uuid },
        include: [
          {
            model: 'user_role',
            as: 'userRole',
            include: [{ model: 'roles', as: 'roleInfo' }],
          },
        ],
      };

      const findRes = await dbService.findOne('user', findQuery, {}, {});
      console.log(findRes, '----');

      if (!findRes) {
        ctx.res.notFound({ msg: responseMessages[1013] });
        return;
      }

      const token = jwt.sign(
        {
          // user: userData.id,  /* nomore id in token due to we share token with third party */
          uuid: findRes.uuid,
          email: findRes.email,
          first_name: findRes.firstName,
          last_name: findRes.lastName,
          roles: findRes.userRole.roleInfo.name ? [findRes.userRole.roleInfo.name] : [],
          user_guid: null,
          gender: findRes.gender,
          subrole: null,
          userTpId: [config.tpId],
          accessToken: ctx.request.body.token,
          refreshToken: ctx.request.body.refreshToken,
          showVaccination: findRes.userRole.roleInfo.name == 'Admin',
          // exp: Math.floor(Date.now() / 1000) + 900,  // Disabled expired time because of user continue api access.
        },
        config.tpJwtSecret
      );

      ctx.res.ok({ result: { QB_Token: token, tpId: config.tpId, clientId: config.clientId } });
      return;
    } catch (error) {
      console.log('\n error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  sendResetPasswordMail: async (ctx) => {
    try {
      const findQuery = { where: { email: ctx.request.body.email } };

      const findRes = await dbService.findOne('user', findQuery, {}, {});

      if (!findRes) {
        ctx.res.notFound({ msg: responseMessages[1013] });
        return;
      }

      if (findRes.status === 'Inactive') {
        ctx.res.forbidden({ msg: responseMessages[1030] });
        return;
      }

      const verificationCode = commonService.generateRandomNumber();
      const insertResp = await dbService.findOneAndUpsert(
        'user_verification',
        { where: { verificationType: 'ResetPassword', userId: findRes.uuid } },
        {
          verificationCode,
          userId: findRes.uuid,
          verificationCodeExpiry: commonService
            .indiaTz()
            .add(config.resetPasswordTokenExpiry[0], config.resetPasswordTokenExpiry[1])
            .toDate(),
          verificationType: 'ResetPassword',
        }
      );
      if (!insertResp) {
        ctx.res.internalServerError({ msg: responseMessages[1016] });
        return;
      }
      const postResp = await request.post(ctx, `${ctx.req.hitUrl}`, {
        username: findRes.username,
        token: verificationCode,
        email: findRes.email,
      });
      ctx.res.ok({ result: postResp.data });
      return;
    } catch (error) {
      console.log('\n error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  resetPassword: async (ctx) => {
    try {
      const findQuery = {
        where: { username: ctx.request.body.username },
        include: [
          {
            required: true,
            model: db.models.user_verification,
            as: 'userVerification',
            where: {
              verificationType: 'ResetPassword',
            },
          },
        ],
      };

      const findRes = await dbService.findOne('user', findQuery, {}, {});

      if (!findRes) {
        ctx.res.notFound({ msg: responseMessages[1013] });
        return;
      }

      if (
        !findRes.userVerification[0] ||
        (findRes.userVerification[0] && findRes.userVerification[0].verificationCode != ctx.request.body.token)
      ) {
        ctx.res.unprocessableEntity({ msg: responseMessages[1017] });
        return;
      }

      if (
        commonService.compareDates(
          commonService.indiaTz().toDate(),
          findRes.userVerification[0].verificationCodeExpiry,
          'lteq'
        )
      ) {
        await dbService.destroy('user_verification', { where: { uuid: findRes.userVerification[0].uuid } });
        const updateResp = await dbService.update(
          'user',
          {
            password: ctx.request.body.password,
          },
          { where: { uuid: findRes.uuid }, individualHooks: true },
          {}
        );
        if (!updateResp) {
          ctx.res.internalServerError({ msg: responseMessages[1033] });
          return;
        }
        ctx.res.ok({ msg: responseMessages[1034] });
        return;
      }

      ctx.res.gone({ msg: responseMessages[1035] });
      return;
    } catch (error) {
      console.log('\n error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  getAccessTokenSignUpOtp: async (ctx) => {
    try {
      const findQuery = {
        where: { username: ctx.request.query.username },
        include: [
          {
            model: 'user_role',
            as: 'userRole',
            include: [{ model: 'roles', as: 'roleInfo' }],
          },
          {
            required: true,
            model: db.models.user_verification,
            as: 'userVerification',
            where: {
              verificationType: 'SignupAccount',
            },
          },
        ],
      };

      const findRes = await dbService.findOne('user', findQuery, {}, {});

      if (!findRes) {
        ctx.res.notFound({ msg: responseMessages[1013] });
        return;
      }

      if (findRes.status === 'Active') {
        ctx.res.conflict({ msg: responseMessages[1036] });
        return;
      }

      if (findRes.userVerification[0] && findRes.userVerification[0].verificationCode != ctx.request.query.token) {
        ctx.res.unprocessableEntity({ msg: responseMessages[1017] });
        return;
      }

      const accessToken = await commonService.token(
        {
          uuid: findRes.uuid,
          username: findRes.username,
          mobileNumber: findRes.mobileNumber,
          email: findRes.email,
          role: findRes.userRole.roleInfo.name,
        },
        'access'
      );

      const refreshToken = await commonService.token(
        {
          uuid: findRes.uuid,
          username: findRes.username,
          mobileNumber: findRes.mobileNumber,
          email: findRes.email,
          role: findRes.userRole.roleInfo.name,
        },
        'refresh'
      );

      await dbService.update('user', { accessToken, refreshToken }, { where: { uuid: findRes.uuid } }, {});

      ctx.res.ok({ result: { accessToken, refreshToken } });
      return;
    } catch (error) {
      console.log('\n error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  getRefreshToken: async (ctx) => {
    try {
      const decoded = await jwt.verify(ctx.request.body.refreshToken, config.jwtSecret);
      if (!decoded) {
        ctx.res.unprocessableEntity({ msg: responseMessages[1017] });
        return;
      }

      const findQuery = {
        where: { uuid: decoded.uuid },
        include: [
          {
            model: 'user_role',
            as: 'userRole',
            include: [{ model: 'roles', as: 'roleInfo' }],
          },
        ],
      };

      const findRes = await dbService.findOne('user', findQuery, {}, {});

      if (!findRes) {
        ctx.res.notFound({ msg: responseMessages[1013] });
        return;
      }

      const accessToken = await commonService.token(
        {
          uuid: findRes.uuid,
          username: findRes.username,
          mobileNumber: findRes.mobileNumber,
          email: findRes.email,
          role: findRes.userRole.roleInfo.name,
        },
        'access'
      );

      const refreshToken = await commonService.token(
        {
          uuid: findRes.uuid,
          username: findRes.username,
          mobileNumber: findRes.mobileNumber,
          email: findRes.email,
          role: findRes.userRole.roleInfo.name,
        },
        'refresh'
      );

      await dbService.update('user', { refreshToken, accessToken }, { where: { uuid: findRes.uuid } }, {});

      ctx.res.ok({ result: { accessToken, refreshToken } });
      return;
    } catch (error) {
      console.log('\n error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  verifyUserResetToken: async (ctx) => {
    try {
      const findQuery = {
        where: { username: decodeURIComponent(ctx.request.query.username) },
        include: [
          {
            required: true,
            model: db.models.user_verification,
            as: 'userVerification',
            where: {
              verificationType: 'ResetPassword',
            },
          },
        ],
      };

      const findRes = await dbService.findOne('user', findQuery, {}, {});

      if (!findRes) {
        ctx.res.notFound({ msg: responseMessages[1037] });
        return;
      }

      if (
        !findRes.userVerification[0] ||
        (findRes.userVerification[0] && findRes.userVerification[0].verificationCode != ctx.request.query.token)
      ) {
        ctx.res.unprocessableEntity({ msg: responseMessages[1017] });
        return;
      }

      if (
        commonService.compareDates(
          commonService.indiaTz().toDate(),
          findRes.userVerification[0].verificationCodeExpiry,
          'lteq'
        )
      ) {
        ctx.res.ok({ msg: responseMessages[1038] });
        return;
      }

      ctx.res.conflict({ msg: responseMessages[1039] });
      return;
    } catch (error) {
      console.log('\n error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  verifyUserAccount: async (ctx) => {
    try {
      const findQuery = {
        where: { username: ctx.request.body.username },
        include: [
          {
            required: true,
            model: db.models.user_verification,
            as: 'userVerification',
            where: {
              verificationType: 'SignupAccount',
            },
          },
          {
            model: 'user_role',
            as: 'userRole',
            include: [{ model: 'roles', as: 'roleInfo' }],
          },
        ],
      };

      const findRes = await dbService.findOne('user', findQuery, {}, {});

      if (!findRes) {
        ctx.res.notFound({ msg: responseMessages[1013] });
        return;
      }

      if (findRes.status === 'Active') {
        ctx.res.conflict({ msg: responseMessages[1036] });
        return;
      }

      if (
        !findRes.userVerification[0] ||
        (findRes.userVerification[0] && findRes.userVerification[0].verificationCode != ctx.request.body.token)
      ) {
        ctx.res.unprocessableEntity({ msg: responseMessages[1017] });
        return;
      }

      const { accessToken, refreshToken } = await getAccessRefreshToken({
        tokenPaylod: {
          uuid: findRes.uuid,
          username: findRes.username,
          mobileNumber: findRes.mobileNumber,
          email: findRes.email,
          role: findRes.userRole.roleInfo.name,
        },
      });

      await dbService.destroy('user_verification', { where: { uuid: findRes.userVerification[0].uuid } });
      const updateResp = await dbService.update(
        'user',
        {
          accessToken,
          refreshToken,
          lastLoginDate: commonService.indiaTz().toDate(),
          status: 'Active',
        },
        { where: { uuid: findRes.uuid }, individualHooks: true },
        {}
      );
      if (!updateResp) {
        ctx.res.internalServerError({ msg: responseMessages[1040] });
        return;
      }
      ctx.res.ok({
        result: {
          uuid: findRes.uuid,
          firstName: findRes.firstName,
          mobileNumber: findRes.mobileNumber,
          email: findRes.email,
          accessToken,
          refreshToken,
        },
      });
      return;
    } catch (error) {
      console.log('\n user verify error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  checkUserAlreadyExists: async (ctx) => {
    try {
      const findQuery = { where: {} };
      if (ctx.request.body.username) {
        findQuery.where.username = ctx.request.body.username;
      }

      if (ctx.request.body.email) {
        findQuery.where.email = ctx.request.body.email;
      }

      if (ctx.request.body.email && ctx.request.body.username) {
        findQuery.where = {
          ...findQuery.where,
          [Sequelize.Op.or]: [
            {
              email: ctx.request.body.email,
            },
            {
              username: ctx.request.body.username,
            },
          ],
        };
      }

      const findRes = await dbService.findOne('user', findQuery);

      if (!findRes) {
        ctx.res.ok({ msg: responseMessages[1013] });
        return;
      }

      ctx.res.conflict({ msg: responseMessages[1041] });
      return;
    } catch (error) {
      console.log('\n error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  deleteUser: async (ctx) => {
    try {
      const findQuery = { where: {} };
      if (ctx.request.query.uuid) {
        findQuery.where.uuid = ctx.request.query.uuid;
      }

      if (ctx.request.query.username) {
        findQuery.where.username = ctx.request.query.username;
      }

      if (ctx.request.query.email) {
        findQuery.where.email = ctx.request.query.email;
      }

      if (ctx.request.query.email && ctx.request.query.username && ctx.request.query.uuid) {
        findQuery.where = {
          ...findQuery.where,
          [Sequelize.Op.or]: [
            {
              email: ctx.request.query.email,
            },
            {
              uuid: ctx.request.query.uuid,
            },
            {
              username: ctx.request.query.username,
            },
          ],
        };
      }

      const findRes = await dbService.findOne('user', findQuery);

      if (!findRes) {
        ctx.res.notFound({ msg: responseMessages[1013] });
        return;
      }
      console.log(findRes.uuid, 'findQuery.uuid');
      const medication_notes = await dbService.destroy('medication_notes', { where: { userId: findRes.uuid } });
      console.log('medication_notes', medication_notes);
      const dietary_measurement = await dbService.destroy('dietary_measurement', { where: { userId: findRes.uuid } });
      console.log('dietary_measurement', dietary_measurement);
      const exercise = await dbService.destroy('exercise', { where: { userId: findRes.uuid } });
      console.log('exercise');
      const life_style = await dbService.destroy('life_style', { where: { userId: findRes.uuid } });
      console.log('life_style');
      const medication_records = await dbService.destroy('medication_records', { where: { userId: findRes.uuid } });
      console.log('medication_records');
      const getRoom = await dbService.findAll('chat_room', {
        include: [
          {
            model: 'chat_room_participants',
            where: {
              userId: findRes.uuid,
            },
          },
        ],
      });
      // distinct roomIds
      const rooms = getRoom.map((room) => room.uuid);
      const chatRoom = await dbService.destroy('chat_room', {
        where: {
          uuid: { [Op.in]: rooms },
        },
      });
      console.log('chatRoom', chatRoom);

      const deleteRes = await dbService.destroy('user', { where: { uuid: findRes.uuid } });

      if (!deleteRes) {
        ctx.res.badGateway({ msg: responseMessages[1042] });
        return;
      }

      ctx.res.ok({ msg: responseMessages[1043] });
      return;
    } catch (error) {
      console.log('\n error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  changeUserRole: async (ctx) => {
    try {
      const findQuery = { where: { email: ctx.request.body.email } };
      const savedRes = await dbService.findOne('user', findQuery);
      if (!savedRes) {
        ctx.res.notFound({ msg: responseMessages[1013] });
        return;
      }
      const roleFindRes = await dbService.findOne('roles', { where: { name: ctx.request.body.roleName } });
      const query = { where: { userId: savedRes.uuid } };
      const roleSavedRes = await dbService.update('user_role', { roleId: roleFindRes.uuid }, query, {});
      if (!roleSavedRes) {
        ctx.res.notFound({ msg: responseMessages[1013] });
        return;
      }
      ctx.res.ok({ msg: responseMessages[1044] });
      return;
    } catch (error) {
      console.log('\n error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  updateUserInvite: async (ctx) => {
    try {
      const findQuery = {
        email: ctx.request.body.email,
        inviteCode: ctx.request.body.inviteCode,
      };
      const inviteCodeExist = await dbService.findOne('invite', {
        where: findQuery,
      });

      if (!inviteCodeExist) {
        return ctx.res.badRequest({
          msg: responseMessages[1001],
        });
      }
      if (inviteCodeExist.status === 'completed') {
        return ctx.res.badRequest({
          msg: responseMessages[1002],
        });
      }
      await dbService.update(
        'invite',
        { status: 'completed', toId: ctx.request.body.toId },
        { where: { id: inviteCodeExist.id }, individualHooks: true }
      );
      if (inviteCodeExist.relationship === 'superadmin') {
        // add user_module
        const userModule = await dbService.findOne('user_module', {
          where: {
            userId: ctx.request.body.toId,
          },
        });
        if (!userModule) {
          await dbService.create('user_module', {
            userId: ctx.request.body.toId,
            permission: inviteCodeExist.modules,
            status: 'active',
            createdBy: inviteCodeExist.fromId,
          });
        }
      }
      // find user role
      const userRole = await dbService.findOne('user', {
        where: {
          uuid: inviteCodeExist.fromId,
        },
        include: [
          {
            model: 'user_role',
            as: 'userRole',
            include: [{ model: 'roles', as: 'roleInfo' }]
          },
        ],
      });
      if (userRole.userRole.roleInfo.name === 'Super Admin') {
        return ctx.res.ok({ msg: responseMessages[1004] });
      }

      const circleExist = await dbService.findOne('circle', {
        where: {
          fromId: inviteCodeExist.fromId,
          toId: ctx.request.body.toId,
          [Op.or]: [
            {
              status: 'pending',
            },
            {
              status: 'accepted',
            },
          ],
        },
      });
      if (circleExist) {
        return ctx.res.badRequest({
          msg: responseMessages[1003],
        });
      }
      const circlePayload = {
        firstName: inviteCodeExist.firstName,
        lastName: inviteCodeExist.lastName,
        email: inviteCodeExist.email,
        relationship: inviteCodeExist.relationship,
        fromId: inviteCodeExist.fromId,
        inviteCode: inviteCodeExist.inviteCode,
        toId: ctx.request.body.toId,
        status: 'pending',
      };
      const circleCreated = await dbService.create('circle', circlePayload);
      const sharePayload = {
        fromId: circlePayload.relationship === 'patient' ? circlePayload.toId : circlePayload.fromId,
        toId: circlePayload.relationship === 'patient' ? circlePayload.fromId : circlePayload.toId,
        circleId: circleCreated.uuid,
        modules: inviteCodeExist.modules,
      };
      // find user
      const user = await dbService.findOne('user', {
        where: {
          uuid: circlePayload.fromId,
        },
        attributes: ['id', 'uuid', 'firstName', 'lastName', 'email'],
      });
      await dbService.create('share', sharePayload);
      const notify = {
        queueType: 'in-app',
        queueKeyName: config.queueChannel.notification,
        payload: {
          user_id: circlePayload.fromId,
          subject: 'Circle Connect',
          message: `you have a new circle connect request from ${user?.firstName} ${user?.lastName}`,
          notification_type: 'circle_action',
          schedule_type: 'direct',
          send_to: [{
            email: inviteCodeExist.email,
            firstName: inviteCodeExist.firstName,
            lastName: inviteCodeExist.lastName
          }],
          month: null,
          week_day: null,
          day: null,
          time: new Date().toISOString(),
          end_date: null
        },
      };
      console.log('\n notify...', notify);
      await queue.AddToQueue({
        ...notify,
        url: `${config.notificationUrl}/notification`,
      });
      await dbService.update('user', { status: 'Active' }, { where: { uuid: ctx.request.body.toId } });
      return ctx.res.ok({
        msg: responseMessages[1004],
      });
    } catch (error) {
      return ctx.res.internalServerError({ error });
    }
  },
  checkAndCreateUsers: async (ctx) => {
    try {
      const sharedToData = ctx.request.body.sharedTo;
      const emails = await _.map(sharedToData, (u) => u.email);

      return dbService
        .findAll('user', {
          include: [
            {
              model: 'user_role',
              as: 'userRole',
              include: [{ model: 'roles', as: 'roleInfo' }],
            },
          ],
          attributes: ['uuid', ['firstName', 'first_name'], ['lastName', 'last_name'], 'email'],
          where: {
            email: emails,
          },
        })
        .then(async (users) => {
          const patient = await _.filter(users, (u) => u.userRole.roleInfo.name === 'Patient');

          const patientEmails = await _.map(users, (u) => ({
            email: u.email,
            first_name: u.first_name,
            last_name: u.last_name,
          }));
          const otherUsers = await _.filter(users, (u) => u.userRole.roleInfo.name !== 'Patient');
          const newUsers = [];
          let newUserList = [];
          await _.map(sharedToData, async (u) => {
            const matchUser = _.filter(patientEmails, ['email', u.email]);

            if (matchUser.length === 0) {
              newUsers.push({
                email: u.email,
                first_name: u.first_name ? u.first_name : null,
                last_name: u.last_name ? u.last_name : null,
              });
            }
          });
          if (newUsers.length) {
            newUserList = [];
            // eslint-disable-next-line no-restricted-syntax
            for (const u of newUsers) {
              const body = {
                email: u.email,
                firstName: u.first_name,
                lastName: u.last_name,
                relationship: 'patient',
                modules: {},
                fromId: ctx.request.body.sharedBy,
              };
              try {
                // eslint-disable-next-line no-await-in-loop
                const userData = await request.post(ctx, `${config.circleUrl}/circle/invite`, body);
                const availableUserData = userData.data?.result?.uuid || '';
                if (availableUserData) {
                  newUserList.push({
                    email: u.email,
                    first_name: u.first_name,
                    last_name: u.last_name,
                    uuid: availableUserData,
                    role: 'Patient',
                    verification_token: userData.data?.result?.inviteCode,
                  });
                }
              } catch (error) { /* empty */ }
            }
            return ctx.res.ok({
              result: {
                oldUsers: patient,
                newUserList,
                otherUsers,
              },
            });
          }
          return ctx.res.ok({
            result: {
              oldUsers: patient,
              newUserList,
              otherUsers,
            },
          });
        })
        .catch((error) => sequalizeErrorHandler.handleSequalizeError(ctx, error));
    } catch (e) {
      return sequalizeErrorHandler.handleSequalizeError(ctx, e);
    }
  },
};
