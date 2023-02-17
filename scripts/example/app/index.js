// Load APM on production environment
const Koa = require("koa");
const bodyParser = require("koa-bodyparser");
const cors = require("@koa/cors");
const https = require("https");
const fs = require("fs");
const config = require("./config");
const apm = require("./apm");

const errorHandler = require("./middlewares/errorHandler");
const logMiddleware = require("./middlewares/log");
const logger = require("./logger");
const requestId = require("./middlewares/requestId");
const responseHandler = require("./middlewares/responseHandler");
const router = require("./routes");
// const orm = require('./orm');

const app = new Koa();

// Trust proxy
app.proxy = true;

// // Setup ORM
// app.use(orm.middleware);

// Set middlewares
app.use(
  bodyParser({
    enableTypes: ["json", "form"],
    formLimit: "10mb",
    jsonLimit: "10mb",
  })
);
app.use(requestId());
app.use(
  cors({
    origin: "*",
    allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH"],
    exposeHeaders: ["X-Request-Id"],
  })
);

app.use(responseHandler());
app.use(errorHandler());
app.use(logMiddleware({ logger }));

// Bootstrap application router
app.use(router.routes());
app.use(router.allowedMethods());

function onError(err, ctx) {
  if (apm.active) apm.captureError(err);
  if (ctx == null)
    logger.error({ err, event: "error" }, "Unhandled exception occured");
}

// Handle uncaught errors
app.on("error", onError);

// Start server
if (!module.parent) {
  const serverCallback = app.callback();
  const httpsServer = https.createServer(
    {
      key: fs.readFileSync("cert/serverkey.pem", "utf8"),
      cert: fs.readFileSync("cert/ca-certificate.crt", "utf8"),
    },
    serverCallback
  );
  httpsServer.listen(config.port, (err) => {
    if (err) {
      console.error("HTTPS server FAIL: ", err, err && err.stack);
    } else {
      logger.info(
        { event: "execute" },
        `API server listening on ${config.host}:${config.port}, in ${config.env}`
      );
      logger.info(`HTTPS server OK: https://${config.host}:${config.port}`);
    }
  });
}

// Expose app
module.exports = app;
