const { models } = require('../config/sequelize');

module.exports = {
  up: async () => {
    const Bmi = await models.bmi.findAll({});
    for (const element of Bmi) {
      const height = element.height ? element.height / 100 : 0;
      const weight = element.weight ? element.weight : 0;
      const bmi = Number((weight / (height * height)).toFixed(2));
      await models.bmi.update({ bmi }, { where: { id: element.id } });
    }
  },

  down: async () => {},
};
