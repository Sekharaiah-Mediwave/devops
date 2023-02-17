// only record audit trails if mentioned in env
const config = require('../config/config');
const dbService = require('../services/db-service');

const auditModules = {
  // goals
  post: {
    // goal
    '/goal': 'Added new goal',
    // alcohol
    '/alcohol/save': 'Added new alcohol',
    // blood-pressure
    '/blood-pressure/save': 'Added new blood-pressure',
    // bmi
    '/bmi/save': 'Added new bmi',
    // coping
    '/coping/save': 'Added new coping',
    // diary
    '/diary/save': 'Added new diary',
    // health
    '/health/save-diagnoses': 'Added new health diagnoses',
    // mood
    '/mood/save': 'Added new mood',
    // pain
    '/pain/save': 'Added new pain',
    // problem
    '/problem/save': 'Added new problem',
    // sleep
    '/sleep/save': 'Added new sleep',
    // smoke-timeline
    '/smoke-timeline/save': 'Added new smoke-timeline',
    // smoke
    '/smoke/save': 'Added new smoke',
    // temperature
    '/temperature/save': 'Added new temperature',
  },
  get: {
    // goal
    '/goal': 'Viewed goals',
    // alcohol
    '/alcohol/get-list': 'Viewed alcohol',
    // blood-pressure
    '/blood-pressure/get-list': 'Viewed blood-pressure',
    // bmi
    '/bmi/get-list': 'Viewed bmi',
    // coping
    '/coping/get-list': 'Viewed coping',
    // diary
    '/diary/get-list': 'Viewed diary',
    // health
    '/health/get-diagnoses-by-uuid/:uuid': 'Viewed health diagnoses',
    // mood
    '/mood/get-list': 'Viewed mood',
    // pain
    '/pain/get-list': 'Viewed pain',
    // problem
    '/problem/get-list': 'Viewed problem',
    // sleep
    '/sleep/get-list': 'Viewed sleep',
    // smoke-timeline
    '/smoke-timeline/get-list': 'Viewed smoke-timeline',
    // smoke
    '/smoke/get-list': 'Viewed smoke',
    // temperature
    '/temperature/get': 'Viewed temperature',
  },
  put: {
    // goal
    '/goal/update/:goal_id': 'Update goal',
    // alcohol
    '/alcohol/update': 'Update alcohol',
    // app-settings
    '/app-settings/update': 'Update app-settings',
    // blood-pressure
    '/blood-pressure/update': 'Update blood-pressure',
    // bmi
    '/bmi/update': 'Update bmi',
    // coping
    '/coping/update': 'Update coping',
    // diary
    '/diary/update': 'Update diary',
    // health
    '/health/update-diagnoses': 'Update health diagnoses',
    // mood
    '/mood/update': 'Update mood',
    // sleep
    '/sleep/update': 'Update sleep',
    // smoke
    '/smoke/update': 'Update smoke',
    // temperature
    '/temperature/update': 'Update temperature',

  },
  patch: {},
  delete: {
    // alcohol
    '/alcohol/delete': 'Delete alcohol',
    // blood-pressure
    '/blood-pressure/delete': 'Delete blood-pressure',
    // bmi
    '/bmi/delete': 'Delete bmi',
    // coping
    '/coping/delete': 'Delete coping',
    // diary
    '/diary/delete': 'Delete diary',
    // health
    '/health/delete-diagnoses': 'Delete health diagnoses',
    // mood
    '/mood/delete': 'Delete mood',
    // pain
    '/pain/delete': 'Delete pain',
    // problem
    '/problem/delete': 'Delete problem',
    // sleep
    '/sleep/delete': 'Delete sleep',
    // smoke
    '/smoke/delete': 'Delete smoke',
    // temperature
    '/temperature/delete': 'Delete temperature',
  },
};

exports.appendToAuditTrail = async (ctx, next) => {
  try {
    if (!config.has_audit_trail) {
      console.log('-> No audit trail set');
      return await next();
    }

    console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
    console.log(ctx.method);
    console.log(ctx.request.URL.pathname);
    console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');

    let url = ctx.request.URL.pathname;
    const method = ctx.method.toLowerCase();

    // replace params with their varnames
    // object map
    const { params } = ctx.request;
    const paramNames = Object.keys(params);
    paramNames.forEach((paramName) => {
      const reg = new RegExp(params[paramName], 'g');
      const reg1 = new RegExp(/\?*/, 'g');
      url = url.replace(reg, `:${paramName}`);
      console.log(url, 'url');
      url = url.replace(reg1, '');
      console.log(url, 'url');
    });
    console.log(url, '--url', method, auditModules);

    let action = 'add';
    if (method === 'get') {
      action = 'view';
    } else if (method === 'put') {
      action = 'update';
    } else if (method === 'delete') {
      action = 'delete';
    }

    const payload = {
      user_id: ctx.req.decoded.uuid,
      data_owner: ctx.req.decoded.uuid,
      request_id: '',
      action,
      action_text: '',
      module_name: auditModules[method][url],
      action_date: new Date(),
    };

    if (!payload.module_name) {
      console.log('No module name found');
      console.log('url: ', url);
      console.log('method: ', method);
      return await next();
    }

    console.log('audit trail payload', payload);
    const temp = await dbService.create('audit_trail_logs', payload);
    console.log('temp', temp);
    ctx.request_id = temp.uuid;
    return await next();
  } catch (e) {
    console.log('Failed to write audit trail');
    console.log(e);
    return await next();
  }
};
