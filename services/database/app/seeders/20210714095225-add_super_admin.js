const { uuidv4 } = require('../services/imports');
const { models } = require('../config/sequelize');
const config = require('../config/config');

const userPayload = {
  uuid: uuidv4(),
  username: 'super admin',
  password: 'Maia@1234',
  email: 'admin@mindwaveventures.com',
  mobileNumber: '+910987654321',
  firstName: 'Super',
  lastName: 'Admin',
  dob: new Date(),
  termsAndCondition: true,
  privacyStatement: true,
  status: 'Active',
};

const userProfilePayload = {
  uuid: uuidv4(),
  userId: userPayload.uuid,
};

module.exports = {
  up: async () => {
    const userExists = await models.user.findOne({ where: { username: userPayload.username }, attributes: ['uuid'] });
    if (!userExists) {
      await models.user.create(userPayload);
      await models.user_profile.create(userProfilePayload);
      const roleData = await models.roles.findOne({
        where: { name: config.roleNames.sa },
        attributes: ['uuid', 'name'],
      });
      return await models.user_role.create({ uuid: uuidv4(), userId: userPayload.uuid, roleId: roleData.uuid });
    }
  },

  down: async () => {},
};
