const http = require('http');
const { dotenv, app, bodyParser, cors, logger } = require('./services/imports');

dotenv.config(); /* This must be here to enable all envs on start of server */

const router = require('./routes/__index');
const config = require('./config/config');
const responseHandler = require('./middleware/response-handler');
const webSocket = require('./socket-io');

const server = http.createServer(app.callback());

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
app.use(responseHandler());
app.use(logger());
app.use(router.routes());
app.use(router.allowedMethods());

server.listen(config.port, config.host, async () => {
  webSocket(server);
  console.log(`Server running at http://${config.host}:${config.port}/`);
});
