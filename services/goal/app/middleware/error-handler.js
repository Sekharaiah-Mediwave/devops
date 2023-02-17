/**
 * Return middleware that handle exceptions in Koa.
 * Dispose to the first middleware.
 *
 * @return {function} Koa middleware.
 */
function errorHandler() {
  return async (ctx, next) => {
    try {
      await next();

      // Respond 404 Not Found for unhandled request
      if (ctx.status === 404) ctx.throw(404);
    } catch (err) {
      ctx.res.internalServerError(500);

      // Recommended for centralized error reporting,
      // retaining the default behaviour in Koa
      ctx.app.emit('error', err, ctx);
    }
  };
}

function handleSequalizeError(ctx, error) {
  console.log('\n\n\n--------------SequalizeError---------------\n\n\n\n', error, '\n\n\n\n\n');

  return ctx.res.badRequest({
    msg: 'bad request!',
  });
}

module.exports = { errorHandler, handleSequalizeError };
