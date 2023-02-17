const request = require('request-promise');
const config = require('../config/index');

const defaultRequestException = {
  status: 'fail',
  data: null,
  message: 'Failed in sending request',
};

function handleRequestException(ctx, e) {
  if (e.error && e.statusCode) {
    ctx.status = e.statusCode;
    return e.error;
  } else {
    ctx.status = 400; // default - be user error
    return defaultRequestException;
  }
}

function setHeaders(headersData) {
  const headers = {
    authorization: headersData.authorization,
    host: headersData.host,
  };
  return headers;
}

const post = async (ctx, { url, qs }) => {
  try {
    const options = {
      method: 'POST',
      headers: setHeaders(ctx.request.headers),
      form: ctx.request.body,
      uri: url,
      qs,
      json: true,
    };
    return await request(options);
  } catch (e) {
    return handleRequestException(ctx, e);
  }
};

const get = async (ctx, { url, qs }) => {
  try {
    const options = {
      method: 'GET',
      headers: setHeaders(ctx.request.headers),
      uri: url,
      qs,
      json: true,
    };
    return await request(options);
  } catch (e) {
    return handleRequestException(ctx, e);
  }
};

const put = async (ctx, { url, qs }) => {
  try {
    const options = {
      method: 'PUT',
      headers: setHeaders(ctx.request.headers),
      form: ctx.request.body,
      uri: url,
      qs,
      json: true,
    };
    return await request(options);
  } catch (e) {
    return handleRequestException(ctx, e);
  }
};

// delete is a JS keyword
const del = async (ctx, { url, qs }) => {
  try {
    const options = {
      method: 'DELETE',
      headers: setHeaders(ctx.request.headers),
      form: ctx.request.body,
      uri: url,
      qs,
      json: true,
    };
    return await request(options);
  } catch (e) {
    return handleRequestException(ctx, e);
  }
};

module.exports = {
  post,
  put,
  get,
  del,
};
