const commonService = require('../services/common-service');
const dbService = require('../services/db-service');
const config = require('../config/config');
const db = require('../config/sequelize');
const { _, moment, uuidv4 } = require('../services/imports');
const { Sequelize } = require('../config/sequelize');
const responseMessages = require('../middleware/response-messages');
const request = require('../middleware/axios-request');

const { Op } = Sequelize;

module.exports = {
  getUserDetails: async (ctx) => {
    try {
      const findQuery = {
        where: { uuid: (ctx.request.query.userId || ctx.req.decoded.uuid), status: 'Active' },
        include: [
          {
            model: 'directory_settings', as: 'directorySettings', required: false,
          },
          {
            model: 'account_settings', as: 'accountSettings', required: false,
          },
          {
            model: 'user_profile',
            as: 'userProfile',
            required: false,
            include: [{ model: 'centre', as: 'centre', required: false },]
          },
          {
            model: 'user_role',
            as: 'userRole',
            include: [{ model: 'roles', as: 'roleInfo' }]
          },
          {
            model: 'authenticated_apps', as: 'authenticatedApps', required: false,
          }
        ],
        attributes: { exclude: ['password', 'accessToken', 'refreshToken'] },
      };

      const findRes = await dbService.findOne('user', findQuery, {}, {});

      if (!findRes) {
        ctx.res.notFound({ msg: responseMessages[1013] });
        return;
      }

      ctx.res.ok({ result: findRes });
      return;
    } catch (error) {
      console.log('\n error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  getUserPersonalDetails: async (ctx) => {
    try {
      const attributes = [
        'firstName',
        'lastName',
        'dob',
        'email',
        'mobileNumber',
        'gender',
        'maritalStatus',
      ];

      const findQuery = {
        where: { uuid: ctx.req.decoded.uuid, status: 'Active' },
        include: [
          {
            model: 'user_profile',
            as: 'userProfile',
            required: false,
            include: [{ model: 'centre', as: 'centre', required: false },]
          },
          {
            model: 'user_role',
            as: 'userRole',
            include: [{ model: 'roles', as: 'roleInfo' }]
          }
        ],
        attributes
      };

      const findRes = await dbService.findOne('user', findQuery, {}, {});

      if (!findRes) {
        ctx.res.notFound({ msg: responseMessages[1013] });
        return;
      }

      ctx.res.ok({ result: findRes });
      return;
    } catch (error) {
      console.log('\n error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  addProfileInfo: async (ctx) => {
    try {
      const savePayload = ctx.request.body;
      savePayload.userId = (ctx.request.body.userId || ctx.req.decoded.uuid);
      delete savePayload.profileType;

      const profileResp = await dbService.findOneAndUpsert('personal_information', { where: { userId: savePayload.userId }, individualHooks: true }, savePayload);

      if (!profileResp) {
        ctx.res.forbidden({ msg: responseMessages[1014] });
        return;
      }

      ctx.res.ok({ result: profileResp.updateRes ? JSON.parse(JSON.stringify(profileResp.updateRes)) : JSON.parse(JSON.stringify(profileResp.insertRes)) });
      return;
    } catch (error) {
      console.log('\n Profile information save error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  getProfileInfo: async (ctx) => {
    try {
      let attributes = ['id', 'myStrengths', 'myWeaknesses', 'longTermHealthGoals', 'howOthersSeeMe'];
      const profileTypeAttributesJson = {
        myBackground: ['id', 'myPersonalHistory', 'myFamilyAndFriends', 'myHistoryAndLifestyle', 'thingsIvalue', 'spiritualBeliefs', 'achievementsAndInterests', 'favouritePlaces'],
        myNeeds: ['id', 'auditoryHearing', 'auditoryDescription', 'visuallyHearing', 'visuallyDescription', 'mobilityHearing', 'mobilityDescription', 'importantRoutines', 'thingsThatUpsetMe', 'thingsThatCalmMeOrHelpMeSleep', 'thingsIcanDoForMyself', 'thingsImightNeedHelpWith', 'notesOnMyPersonalCare', 'eatingAndDrinking', 'howItakeMyMedication', 'thingsIdLikeYouToKnowAboutMe']
      };

      attributes = profileTypeAttributesJson[ctx.request.params.profileType] || attributes;

      const findQuery = { where: { userId: ctx.req.decoded.uuid }, attributes };

      const findRes = await dbService.findOne('personal_information', findQuery, {}, {});

      if (!findRes) {
        ctx.res.notFound({ msg: responseMessages[1013] });
        return;
      }

      ctx.res.ok({ result: findRes });
      return;
    } catch (error) {
      console.log('\n error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  updateUser: async (ctx) => {
    try {
      const updatePayload = {
        username: ctx.request.body.username,
        password: ctx.request.body.password,
        email: ctx.request.body.email,
        firstName: ctx.request.body.firstName,
        lastName: ctx.request.body.lastName,
        mobileNumber: ctx.request.body.mobileNumber,
      };

      const updateResp = await dbService.update('user', updatePayload, { where: { uuid: (ctx.req.decoded.uuid) }, individualHooks: true });

      if (!updateResp) {
        ctx.res.forbidden({ msg: responseMessages[1015] });
        return;
      }

      ctx.res.ok({ result: updateResp[0] });
      return;
    } catch (error) {
      console.log('\n user save error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  sendMailForTwoFactorAuth: async (ctx) => {
    try {
      const findQuery = { where: { uuid: ctx.req.decoded.uuid }, attributes: ['uuid', 'email'] };

      const findRes = await dbService.findOne('user', findQuery);

      if (!findRes) {
        ctx.res.notFound({ msg: responseMessages[1013] });
        return;
      }

      const verificationCode = commonService.generateRandomNumber();
      const insertResp = await dbService.findOneAndUpsert(
        'user_verification',
        { where: { verificationType: 'EnableTwoFactorAuth', userId: findRes.uuid } },
        { verificationCode, userId: findRes.uuid, verificationType: 'EnableTwoFactorAuth' }
      );

      if (!insertResp) {
        ctx.res.internalServerError({ msg: responseMessages[1016] });
        return;
      }

      const postResp = await request.post(ctx, `${ctx.req.hitUrl}`, { email: findRes.email, token: verificationCode, });
      ctx.res.ok({ result: postResp.data });
      return;
    } catch (error) {
      console.log('\n user 2 factor email send error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  enableTwoFactorAuth: async (ctx) => {
    try {
      const updatePayload = {
        mailOtp: ctx.request.body.mailOtp,
        mobileOtp: ctx.request.body.mobileOtp,
      };

      const findQuery = { where: { userId: ctx.req.decoded.uuid, verificationType: 'EnableTwoFactorAuth' } };

      const findRes = await dbService.findOne('user_verification', findQuery);

      if (!findRes) {
        ctx.res.notFound({ msg: responseMessages[1013] });
        return;
      }

      if (findRes.verificationCode != ctx.request.body.otp) {
        ctx.res.unprocessableEntity({ msg: responseMessages[1019] });
        return;
      }

      await dbService.destroy('user_verification', { where: { uuid: findRes.uuid } });
      const updateResp = await dbService.update('user', updatePayload, {
        where: { uuid: ctx.req.decoded.uuid },
        individualHooks: true,
      });

      if (!updateResp) {
        ctx.res.forbidden({ msg: responseMessages[1015] });
        return;
      }

      ctx.res.ok({ result: updateResp[0] });
      return;
    } catch (error) {
      console.log('\n user save error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  sendMailToUpdateEmail: async (ctx) => {
    try {
      const findQuery = { where: { uuid: ctx.req.decoded.uuid }, attributes: ['uuid', 'email'] };

      const findRes = await dbService.findOne('user', findQuery);

      if (!findRes) {
        ctx.res.notFound({ msg: responseMessages[1013] });
        return;
      }

      const mailFindRes = await dbService.findOne(
        'user',
        { where: { email: ctx.request.body.email, uuid: { [Op.ne]: ctx.req.decoded.uuid } }, attributes: ['id'] },
        {},
        {}
      );
      if (mailFindRes) {
        ctx.res.conflict({ msg: responseMessages[1018] });
        return;
      }

      const verificationCode = commonService.generateRandomNumber();
      const insertResp = await dbService.findOneAndUpsert(
        'user_verification',
        { where: { verificationType: 'UpdateEmail', userId: findRes.uuid } },
        { verificationCode, userId: findRes.uuid, verificationType: 'UpdateEmail' }
      );
      if (!insertResp) {
        ctx.res.internalServerError({ msg: responseMessages[1016] });
        return;
      }

      const postResp = await request.post(ctx, `${ctx.req.hitUrl}`, {
        primaryMail: findRes.email,
        newMail: ctx.request.body.email,
        token: verificationCode,
      });

      ctx.res.ok({ result: postResp.data });
      return;
    } catch (error) {
      console.log('\n user save error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  updateUserEmail: async (ctx) => {
    try {
      const updatePayload = {
        email: ctx.request.body.email,
      };

      const findQuery = { where: { userId: ctx.req.decoded.uuid, verificationType: 'UpdateEmail' } };

      const findRes = await dbService.findOne('user_verification', findQuery);

      if (!findRes) {
        ctx.res.notFound({ msg: responseMessages[1013] });
        return;
      }

      if (findRes.verificationCode != ctx.request.body.otp) {
        ctx.res.unprocessableEntity({ msg: responseMessages[1019] });
        return;
      }

      const mailFindRes = await dbService.findOne(
        'user',
        { where: { email: updatePayload.email, uuid: { [Op.ne]: ctx.req.decoded.uuid } }, attributes: ['id'] },
        {},
        {}
      );
      if (mailFindRes) {
        ctx.res.conflict({ msg: responseMessages[1018] });
        return;
      }
      const accessToken = await commonService.token(
        {
          uuid: ctx.req.decoded.uuid,
          username: ctx.req.decoded.username,
          mobileNumber: ctx.req.decoded.mobileNumber,
          email: updatePayload.email,
        },
        'access'
      );
      const refreshToken = await commonService.token(
        {
          uuid: ctx.req.decoded.uuid,
          username: ctx.req.decoded.username,
          mobileNumber: ctx.req.decoded.mobileNumber,
          email: updatePayload.email,
        },
        'refresh'
      );

      updatePayload.accessToken = accessToken;
      updatePayload.refreshToken = refreshToken;

      await dbService.destroy('user_verification', { where: { uuid: findRes.uuid } });
      const updateResp = await dbService.update('user', updatePayload, {
        where: { uuid: ctx.req.decoded.uuid },
        individualHooks: true,
      });

      if (!updateResp) {
        ctx.res.forbidden({ msg: responseMessages[1015] });
        return;
      }

      request.post(ctx, `${config.emailUrl}/email/account/send-account-mail-updated`, {
        email: ctx.request.body.email,
      });

      ctx.res.ok({ result: updateResp[0] });
      return;
    } catch (error) {
      console.log('\n user save error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  updateUserPassword: async (ctx) => {
    try {
      const updatePayload = {
        password: ctx.request.body.newPassword,
      };

      const findQuery = { where: { uuid: ctx.req.decoded.uuid }, attributes: ['id', 'password'] };

      const findRes = await dbService.findOne('user', findQuery);

      if (!findRes) {
        ctx.res.notFound({ msg: responseMessages[1013] });
        return;
      }

      const passwordMatch = await commonService.comparePassword(ctx.request.body.password, findRes.password);
      if (!passwordMatch) {
        ctx.res.forbidden({ msg: responseMessages[1020] });
        return;
      }

      const updateResp = await dbService.update('user', updatePayload, {
        where: { uuid: ctx.req.decoded.uuid },
        individualHooks: true,
      });

      if (!updateResp) {
        ctx.res.forbidden({ msg: responseMessages[1015] });
        return;
      }
      ctx.res.ok({ result: updateResp[0] });
      return;
    } catch (error) {
      console.log('\n user save error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  getPersonlInformation: async (ctx) => {
    try {
      const findQuery = {
        where: { uuid: ctx.req.decoded.uuid, status: 'Active' },
      };

      const findRes = await dbService.findOne('personal_details', findQuery, {}, {});

      if (!findRes) {
        ctx.res.notFound({ msg: responseMessages[1013] });
        return;
      }

      ctx.res.ok({ result: findRes });
      return;
    } catch (error) {
      console.log('\n error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  updatePersonalDetails: async (ctx) => {
    try {
      const userUpdatePayload = {
        dob: ctx.request.body.dob,
        mobileNumber: ctx.request.body.mobileNumber,
        gender: ctx.request.body.gender,
        maritalStatus: ctx.request.body.maritalStatus,
        lastName: ctx.request.body.lastName,
        firstName: ctx.request.body.firstName,
      };

      const profileUpdatePayload = {
        userId: ctx.req.decoded.uuid,
        nameCalled: ctx.request.body.nameCalled,
        ethnicity: ctx.request.body.ethnicity,
        profilePic: ctx.request.body.profilePic,
        languagesSpoken: ctx.request.body.languagesSpoken,
        iNeedAnInterpreter: ctx.request.body.iNeedAnInterpreter,
      };

      const promiseArr = [
        dbService.update('user', userUpdatePayload, { where: { uuid: ctx.req.decoded.uuid }, individualHooks: true }),
        dbService.findOneAndUpsert(
          'user_profile',
          { where: { userId: ctx.req.decoded.uuid }, individualHooks: true },
          profileUpdatePayload,
          {}
        ),
      ];

      const updateResp = await Promise.all(promiseArr);

      let returnJson = {};

      updateResp.forEach((innerElem) => {
        innerElem = innerElem.insertRes || innerElem.updateRes || innerElem[1][0];
        if (innerElem) {
          innerElem = innerElem.toJSON();
        }
        delete innerElem.password;
        delete innerElem.accessToken;
        delete innerElem.refreshToken;

        returnJson = { ...returnJson, ...innerElem };
      });

      ctx.res.ok({ result: returnJson });
      return;
    } catch (error) {
      console.log('\n user save error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  addKeyHealthInfo: async (ctx) => {
    try {
      const userPayload = {
        nhsNumber: ctx.request.body.nhsNumber,
      };
      const profileUpdatePayload = {
        userId: ctx.req.decoded.uuid,
        hospitalDetails: ctx.request.body.hospitalDetails,
      };
      const healthPayload = ctx.request.body;
      delete healthPayload.nhsNumber;
      delete healthPayload.hospitalDetails;
      healthPayload.userId = ctx.request.body.userId || ctx.req.decoded.uuid;

      const promiseArr = [
        dbService.update('user', userPayload, { where: { uuid: healthPayload.userId }, individualHooks: true }, {}),
        dbService.findOneAndUpsert(
          'health_information',
          { where: { userId: healthPayload.userId }, individualHooks: true },
          healthPayload
        ),
        dbService.findOneAndUpsert(
          'user_profile',
          { where: { userId: ctx.req.decoded.uuid }, individualHooks: true },
          profileUpdatePayload,
          {}
        ),
      ];

      const updateResp = await Promise.all(promiseArr);

      let returnJson = {};

      updateResp.forEach((innerElem) => {
        innerElem = innerElem.insertRes || innerElem.updateRes || innerElem[1][0];
        if (innerElem) {
          innerElem = innerElem.toJSON();
        }
        delete innerElem.password;
        delete innerElem.accessToken;
        delete innerElem.refreshToken;

        returnJson = { ...returnJson, ...innerElem };
      });

      ctx.res.ok({ result: returnJson });
      return;
    } catch (error) {
      console.log('\n Key Health information save error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  getKeyHealthInfo: async (ctx) => {
    try {
      const findQuery = {
        where: { uuid: ctx.req.decoded.uuid },
        include: [
          {
            model: db.models.health_information,
            as: 'healthInfo',
            attributes: { exclude: ['id', 'userId', 'fhirId', 'fhirSynced', 'createdAt', 'updatedAt'] },
          },
          {
            model: 'user_profile',
            as: 'userProfile',
            required: false,
            attributes: ['hospitalDetails'],
            include: [{ model: 'centre', as: 'centre', required: false }],
          },
          {
            model: 'user_role',
            as: 'userRole',
            include: [{ model: 'roles', as: 'roleInfo' }],
          },
          {
            model: 'bmi',
            as: 'bmi',
            where: { status: 'Active' },
            order: [['entryDate', 'DESC']],
            limit: 1,
            attributes: ['height', 'weight', 'bmi'],
          },
        ],
        attributes: ['nhsNumber'],
      };

      let findRes = await dbService.findOne('user', findQuery);
      if (!findRes) {
        ctx.res.notFound({ msg: responseMessages[1013] });
        return;
      }

      findRes = findRes.toJSON();

      if (
        findRes.userProfile &&
        (!findRes.userProfile.hospitalDetails ||
          (findRes.userProfile.hospitalDetails && !findRes.userProfile.hospitalDetails.length)) &&
        !findRes.nhsNumber &&
        !findRes.healthInfo.length
      ) {
        ctx.res.notFound({ msg: responseMessages[1021] });
        return;
      }

      ctx.res.ok({ result: findRes });
      return;
    } catch (error) {
      console.log('\n error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  getKeyContact: async (ctx) => {
    try {
      const findQuery = {
        where: { userId: ctx.req.decoded.uuid },
        attributes: { exclude: ['id', 'userId', 'fhirId', 'fhirSynced', 'createdAt', 'updatedAt'] },
      };

      const findRes = await dbService.findOne('contact_information', findQuery);

      if (!findRes) {
        ctx.res.notFound({ msg: responseMessages[1022] });
        return;
      }

      ctx.res.ok({ result: JSON.parse(JSON.stringify(findRes)) });
      return;
    } catch (error) {
      console.log('\n error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  addKeyContact: async (ctx) => {
    try {
      const savePayload = ctx.request.body;
      savePayload.userId = ctx.request.body.userId || ctx.req.decoded.uuid;

      const postResp = await dbService.findOneAndUpsert(
        'contact_information',
        { where: { userId: savePayload.userId }, individualHooks: true },
        savePayload
      );

      if (!postResp) {
        ctx.res.forbidden({ msg: responseMessages[1023] });
        return;
      }

      ctx.res.ok({
        result: postResp.updateRes
          ? JSON.parse(JSON.stringify(postResp.updateRes))
          : JSON.parse(JSON.stringify(postResp.insertRes)),
      });
      return;
    } catch (error) {
      console.log('\n Key Contact save error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  logout: async (ctx) => {
    try {
      const findQuery = { where: { uuid: ctx.req.decoded.uuid, status: 'Active' } };

      const updateRes = await dbService.update('user', { accessToken: null, refreshToken: null }, findQuery, {});

      if (!updateRes) {
        ctx.res.notFound({ msg: responseMessages[1013] });
        return;
      }

      await request.post(ctx, `${config.redisUrl}/cache/set`, { value: '', key: `user-token:${ctx.req.decoded.uuid}` });
      await request.post(ctx, `${config.redisUrl}/cache/set`, {
        value: '',
        key: `user-refresh-token:${ctx.req.decoded.uuid}`,
      });

      ctx.res.ok({ result: updateRes[0] });
      return;
    } catch (error) {
      console.log('\n error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  addUserEnabledTrackers: async (ctx) => {
    try {
      const updatePayload = {
        enabledTrackers: ctx.request.body.enabledTrackers,
      };

      const updateResp = await dbService.update('user', updatePayload, {
        where: { uuid: ctx.request.body.uuid || ctx.req.decoded.uuid },
        individualHooks: true,
      });

      if (!updateResp) {
        ctx.res.forbidden({ msg: responseMessages[1015] });
        return;
      }
      const returnJson = updateResp[1][0].toJSON();
      delete returnJson.password;
      delete returnJson.accessToken;
      delete returnJson.refreshToken;

      ctx.res.ok({ result: updateResp[1][0] });
      return;
    } catch (error) {
      console.log('\n user update error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  updateUserSkin: async (ctx) => {
    try {
      const updatePayload = {
        userSkin: ctx.request.body.userSkin,
      };

      const updateResp = await dbService.update('user', updatePayload, {
        where: { uuid: ctx.req.decoded.uuid },
        individualHooks: true,
      });

      if (!updateResp) {
        ctx.res.forbidden({ msg: responseMessages[1015] });
        return;
      }
      ctx.res.ok({ result: updateResp[0] });
      return;
    } catch (error) {
      console.log('\n user save error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  getFhirUnsavedList: async (ctx) => {
    try {
      const findQuery = {
        where: { fhirSynced: false },
        include: [
          {
            model: 'user',
            as: 'userInfo',
            attributes: ['id', 'fhirId'],
          },
        ],
      };
      const modelName =
        ctx.request.query.profileType == 'contact'
          ? 'contact_information'
          : ctx.request.query.profileType == 'health'
            ? 'health_information'
            : 'personal_information';
      const findData = await dbService.findAll(modelName, findQuery);

      ctx.res.ok({ result: findData.map((innerData) => innerData.toJSON()) });
      return;
    } catch (error) {
      console.log(`\n${ctx.request.query.profileType}find list error...`, error);
      ctx.res.internalServerError({ error });
    }
  },
  syncFhir: async (ctx) => {
    try {
      const modelName =
        ctx.request.query.profileType == 'contact'
          ? 'contact_information'
          : ctx.request.query.profileType == 'health'
            ? 'health_information'
            : 'personal_information';

      const updatePromise = ctx.request.body.fhirSyncArray.map((innerData) =>
        dbService.update(modelName, { fhirSynced: true, fhirId: innerData.fhirId }, { where: { id: innerData.id } }, {}));

      const updateResp = await Promise.all(updatePromise);

      ctx.res.ok({ result: updateResp });
      return;
    } catch (error) {
      console.log(`\n${ctx.request.query.profileType}fhir sync update error...`, error);
      ctx.res.internalServerError({ error });
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
              } catch (error) { }
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
        .catch((error) => ctx.res.internalServerError({ error }));
    } catch (e) {
      return ctx.res.internalServerError({ error: e });
    }
  },
};
