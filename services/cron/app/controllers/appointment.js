const config = require('../config');
const request = require('../middleware/axios-request');

module.exports = {
  appointmentStatusChange: async () => {
    try {
      const appointmentPayload = {
        fromCron: true,
        range: 'past',
        order: ['createdAt', 'DESC'],
        status: ['active']
      };
      const appointmentListResp = await request.post('', `${config.databaseUrl}/appointment/appointment/get-all`, appointmentPayload);
      const appointmentUpdatePayload = {
        apptIds: (appointmentListResp.data.result.rows || []).map(({ uuid }) => uuid)
      };
      if (appointmentUpdatePayload.apptIds.length) {
        /* const appointmentUpdateResp = */ await request.put('', `${config.databaseUrl}/appointment/appointment/update-missed`, appointmentUpdatePayload);
      }
      return 'missed appointment update success';
    } catch (error) {
      return 'missed appointment update error';
    }
  },
};
