const Joi = require('@hapi/joi');

const exampleSchema = Joi.object().keys({
  foo: Joi.string(),
});

module.exports = {
  exampleSchema,
};
