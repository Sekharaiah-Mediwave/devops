const { dotenv, app, bodyParser, cors, sgMail, logger } = require('./services/imports');

dotenv.config(); /* This must be here to enable all envs on start of server */

const router = require('./routes/__index');
const config = require('./config/config');
const responseHandler = require('./middleware/response-handler');

sgMail.setApiKey(config.sendGridApiKey);

app.use(
  bodyParser({
    enableTypes: ['json', 'form'],
    formLimit: '10mb',
    jsonLimit: '10mb',
  })
);
app.use(
  cors({
    origin: '*',
    allowMethods: ['GET', 'HEAD', 'PUT', 'POST', 'DELETE', 'PATCH'],
    exposeHeaders: ['X-Request-Id'],
  })
);
app.use(logger());
app.use(responseHandler());
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(config.port, config.host, () => {
  console.log(`Server running at http://${config.host}:${config.port}/`);
});
