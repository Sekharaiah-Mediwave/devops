/* eslint-disable no-undef */
const { multer, fs, jwt } = require('../services/imports');
// const { rolesToAccessOtherUsers } = require('../config/variableConstants');
const config = require('../config/config');

module.exports = {
  checkRoleToFetchOtherUser: (/* rolesToCheck = [] */) => async (ctx, next) => await next(), // try {
  //     if (!ctx.request.query.userId && !ctx.request.params.userId && !ctx.request.body.userId) {
  //         return await next();
  //     }

  //     const allowedRoles = [...rolesToAccessOtherUsers, ...rolesToCheck].map(roleShortName => (config.roleNames[roleShortName] || ''));

  //     if (ctx.req.decoded && ctx.req.decoded.role && allowedRoles.includes(ctx.req.decoded.role)) {
  //         return await next();
  //     }

  //     ctx.status = 401;
  //     ctx.body = {
  //         status: 0,
  //         msg: "You are not allowed to access other user's data"
  //     };
  //     return;
  // } catch (error) {
  //     console.log("error..........", error);
  //     ctx.status = 401;
  //     ctx.body = {
  //         status: 0,
  //         msg: "You are not allowed to access other user's data. Role check error."
  //     };
  //     return;
  // }

  checkSetToken: async (ctx, next) => {
    let token = ctx.request.headers.Authorization || ctx.request.headers.authorization;
    if (token) {
      token = token.substr('Bearer '.length);
      try {
        const decoded = await jwt.verify(token, config.jwtSecret);
        if (decoded) {
          ctx.req.decoded = decoded;
        }
      } catch (error) {
        ctx.req.decoded = null;
      }
    }
    return await next();
  },
  multerupload: (destinationPath) => {
    const { fileStoragePath } = config;
    const fileServerPath = `${__dirname}/../../${fileStoragePath}`;
    const filePath = fileServerPath + destinationPath;
    const folderExists = fs.existsSync(filePath);
    const splitFilePath = (fileStoragePath + destinationPath).split('/');
    let writeFilePath = '';
    if (!folderExists) {
      for (const iterator of splitFilePath) {
        if (iterator) {
          if (writeFilePath) {
            writeFilePath += `/${iterator}`;
          } else {
            writeFilePath = iterator;
          }
          if (!fs.existsSync(`${__dirname}/../../${writeFilePath}`)) {
            fs.mkdirSync(`${__dirname}/../../${writeFilePath}`);
          }
        }
      }
    } else {
      writeFilePath = filePath;
    }
    destinationPath = writeFilePath;

    return multer({
      // multer settings
      storage: multer.diskStorage({
        // multers disk storage settings
        destination(req, file, cb) {
          cb(null, writeFilePath); // image storage path
        },
        filename(req, file, cb) {
          const fileExist = fs.existsSync(`${writeFilePath}/${file.originalname}`); // checks file existence
          if (fileExist) {
            const orgFileName = file.originalname.split('.');
            cb(null, `${orgFileName[0].replace(/ /g, '')}-${Date.now()}.${orgFileName[1]}`); // if efile exists appending date
          } else {
            cb(null, file.originalname);
          }
        },
      }),
    });
  },
  checkAddUrlToHit: (baseUrlToAppend) => async (ctx, next) => {
    ctx.req.hitUrl = baseUrlToAppend + ctx.req.url;
    await next();
  },
};
