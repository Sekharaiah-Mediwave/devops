const dbService = require('../services/db-service');
/**
 * HTTP Status codes
 */
const statusCodes = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  PARTIAL_CONTENT: 206,
  MULTIPLE_CHOICES: 300,
  PERMANENT_REDIRECT: 308,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  NOT_ACCEPTABLE: 406,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  GONE: 410,
  UNPROCESSABLE_ENTITY: 422,
  UNAVAILABLE_FOR_LEGAL_REASONS: 451,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIME_OUT: 504,
  NETWORK_AUTHENTICATION_REQUIRED: 511,
};

const responseHandler = () => async (ctx, next) => {
  const remove = async (ctx) => {
    if (ctx.request_id) {
      console.log(ctx.request_id, 'ctx.request_id--');
      await dbService.destroy('audit_trail_logs', { where: { uuid: ctx.request_id } });
    }
  };
  ctx.res.statusCodes = statusCodes;
  ctx.statusCodes = ctx.res.statusCodes;

  ctx.res.success = ({ /* 200 responses */ statusCode, result = null, count = null, msg = null }) => {
    const status = 'success';

    statusCode && statusCode < statusCodes.MULTIPLE_CHOICES && statusCode >= statusCodes.OK
      ? (ctx.status = statusCode)
      : (ctx.status = statusCodes.OK);

    const returnBody = { status, result, msg };

    if (count != null) {
      returnBody.count = count;
    }

    ctx.body = returnBody;
  };

  ctx.res.redirect = ({ /* 300 responses */ statusCode, result = null, error = null, msg = null }) => {
    const status = 'redirect';

    statusCode && statusCode < statusCodes.BAD_REQUEST && statusCode >= statusCodes.MULTIPLE_CHOICES
      ? (ctx.status = statusCode)
      : (ctx.status = statusCodes.MULTIPLE_CHOICES);

    ctx.body = { status, result, msg, error };
  };

  ctx.res.clientError = ({ /* 400 responses */ statusCode, result = null, error = null, msg = null }) => {
    (async () => await remove(ctx))();
    const status = 'clientError';

    statusCode && statusCode < statusCodes.INTERNAL_SERVER_ERROR && statusCode >= statusCodes.BAD_REQUEST
      ? (ctx.status = statusCode)
      : (ctx.status = statusCodes.BAD_REQUEST);

    ctx.body = { status, result, msg, error };
  };

  ctx.res.serverError = ({ /* 500 responses */ statusCode, result = null, error = null, msg = null }) => {
    (async () => await remove(ctx))();
    const status = 'serverError';

    statusCode && statusCode >= statusCodes.INTERNAL_SERVER_ERROR
      ? (ctx.status = statusCode)
      : (ctx.status = statusCodes.INTERNAL_SERVER_ERROR);

    ctx.body = { status, result, msg, error };
  };

  ctx.res.ok = (params = {}) => {
    ctx.res.success({
      ...params,
      statusCode: statusCodes.OK,
    });
  };

  ctx.res.created = (params = {}) => {
    ctx.res.success({
      ...params,
      statusCode: statusCodes.CREATED,
    });
  };

  ctx.res.accepted = (params = {}) => {
    ctx.res.success({
      ...params,
      statusCode: statusCodes.ACCEPTED,
    });
  };

  ctx.res.noContent = (params = {}) => {
    ctx.res.success({
      ...params,
      statusCode: statusCodes.NO_CONTENT,
    });
  };

  ctx.res.badRequest = (params = {}) => {
    ctx.res.clientError({
      ...params,
      statusCode: statusCodes.BAD_REQUEST,
    });
  };

  ctx.res.unauthorized = (params = {}) => {
    ctx.res.clientError({
      ...params,
      statusCode: statusCodes.UNAUTHORIZED,
    });
  };

  ctx.res.forbidden = (params = {}) => {
    ctx.res.clientError({
      ...params,
      statusCode: statusCodes.FORBIDDEN,
    });
  };

  ctx.res.notFound = (params = {}) => {
    ctx.res.clientError({
      ...params,
      statusCode: statusCodes.NOT_FOUND,
    });
  };

  ctx.res.notAcceptable = (params = {}) => {
    ctx.res.clientError({
      ...params,
      statusCode: statusCodes.NOT_ACCEPTABLE,
    });
  };

  ctx.res.requestTimeout = (params = {}) => {
    ctx.res.clientError({
      ...params,
      statusCode: statusCodes.REQUEST_TIMEOUT,
    });
  };

  ctx.res.conflict = (params = {}) => {
    ctx.res.clientError({
      ...params,
      statusCode: statusCodes.CONFLICT,
    });
  };

  ctx.res.gone = (params = {}) => {
    ctx.res.clientError({
      ...params,
      statusCode: statusCodes.GONE,
    });
  };

  ctx.res.unprocessableEntity = (params = {}) => {
    ctx.res.clientError({
      ...params,
      statusCode: statusCodes.UNPROCESSABLE_ENTITY,
    });
  };

  ctx.res.internalServerError = (params = {}) => {
    ctx.res.serverError({
      ...params,
      statusCode: statusCodes.INTERNAL_SERVER_ERROR,
    });
  };

  ctx.res.notImplemented = (params = {}) => {
    ctx.res.serverError({
      ...params,
      statusCode: statusCodes.NOT_IMPLEMENTED,
    });
  };

  ctx.res.badGateway = (params = {}) => {
    ctx.res.serverError({
      ...params,
      statusCode: statusCodes.BAD_GATEWAY,
    });
  };

  ctx.res.serviceUnavailable = (params = {}) => {
    ctx.res.serverError({
      ...params,
      statusCode: statusCodes.SERVICE_UNAVAILABLE,
    });
  };

  ctx.res.gatewayTimeOut = (params = {}) => {
    ctx.res.serverError({
      ...params,
      statusCode: statusCodes.GATEWAY_TIME_OUT,
    });
  };
  await next();
};

module.exports = responseHandler;
