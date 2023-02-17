const { dotenv, bodyParser, cors, app, logger } = require('./services/imports');

dotenv.config();
const config = require('./config/index');
const router = require('./routes/__index');
const responseHandler = require('./middleware/response-handler');

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

app.listen(config.port, config.host, () => {
  console.log(`Server running at http://${config.host}:${config.port}/`);
});
