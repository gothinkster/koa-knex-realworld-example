const config = require("config")
const Koa = require("koa")

const app = new Koa()

app.proxy = true

app.keys = [config.get("secret")]

require("../schemas")(app)

const responseTime = require("koa-response-time")
const helmet = require("koa-helmet")
const logger = require("koa-logger")
const xRequestId = require("koa-x-request-id")
const camelizeMiddleware = require("../middleware/camelize-middleware")
const error = require("../middleware/error-middleware")
const cors = require("kcors")
const jwt = require("../middleware/jwt-middleware")
const bodyParser = require("koa-bodyparser")
const pagerMiddleware = require("../middleware/pager-middleware")
const userMiddleware = require("../middleware/user-middleware")
const routes = require("../routes")

app.use(responseTime())
app.use(xRequestId({ inject: true }, app))
app.use(logger())
app.use(helmet())
app.use(
  cors({
    origin: "*",
    exposeHeaders: ["Authorization"],
    credentials: true,
    allowMethods: ["GET", "PUT", "POST", "DELETE"],
    allowHeaders: ["Authorization", "Content-Type"],
    keepHeadersOnError: true,
  }),
)

app.use(camelizeMiddleware)

app.use(error)
app.use(jwt)
app.use(
  bodyParser({
    enableTypes: ["json"],
  }),
)

app.use(userMiddleware)
app.use(pagerMiddleware)

app.use(routes.routes())
app.use(routes.allowedMethods())

module.exports = app
