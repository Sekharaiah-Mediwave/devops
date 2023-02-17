const responseMessages = require('../middleware/response-messages');

module.exports = {
  getRoom: async (ctx) => {
    try {
      // write logic here
    } catch (error) {
      console.log('error.............', error);
      return ctx.res.badRequest({
        msg: error.error.message || responseMessages[1003],
      });
    }
  },
};
