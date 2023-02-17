const { post, get, put, del } = require('../helpers/requestUtils');
const config = require('../config');
// const exampleSchema = require('../validation/example');
const responseMessages = require('../middlewares/responseMessages');
// const { func } = require('../helpers/utils');
// const { Func } = require('../helpers/requestUtils');

// returns a message if the payload doesnot respect the schema
// other wise nothing - we used this in pdcare
function validatePayload(payload, schema) {
  // https://github.com/hapijs/joi/issues/2145
  const schemaValidate = schema.validate(payload);
  if (schemaValidate.error) {
    if (
      schemaValidate.error.details[0].type === 'object.allowUnknown'
    ) {
      return responseMessages[1004];
    }
    return schemaValidate.error.details[0].message;
  }
  return null;
}

exports.exampleFunction = async (ctx) => {
  try {
    // have schema's in validation that you can use!
    // const validationError = validatePayload(
    //   ctx.request.body,
    //   exampleSchema.schemaName,
    // );
    // if (validationError) {
    //   return ctx.res.badRequest({
    //     message: validationError,
    //   });
    // }

    // add business logic here, like calling 3rd party APIs
    // or our services
    const url = config.database_url + ctx.request.url;
    ctx.body = await put(ctx, { url });
  } catch (e) {
    console.log(`:: ERROR :: exceptioned: `, e);
    return ctx.res.badRequest({
      message: responseMessages[1022],
    });
  }
};
