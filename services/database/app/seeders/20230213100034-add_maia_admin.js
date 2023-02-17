const { uuidv4 } = require('../services/imports');
const { models } = require('../config/sequelize');
const config = require('../config/config');

const userPayload = {
  uuid: '4e070066-f08d-440f-bf3d-64469e69e287',
  username: 'maia admin',
  password: 'Maia@1234',
  email: 'madmin@mindwaveventures.com',
  mobileNumber: '+910987654322',
  firstName: 'Maia',
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
        where: { name: config.roleNames.ma },
        attributes: ['uuid', 'name'],
      });
      return await models.user_role.create({ uuid: uuidv4(), userId: userPayload.uuid, roleId: roleData.uuid });
    }
  },

  down: async () => {},
};
