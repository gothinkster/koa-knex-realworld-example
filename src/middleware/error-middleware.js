const errors = require("../lib/errors")
const _ = require("lodash")

module.exports = async (ctx, next) => {
  try {
    await next()
    ctx.assert(ctx.response.body && Number(ctx.response.status) !== 404, 404)
  } catch (err) {
    ctx.type = "application/json"

    const status =
      err.status ||
      err.statusCode ||
      err.status_code ||
      (err.output && err.output.statusCode) ||
      (err.oauthError && err.oauthError.statusCode) ||
      500

    if (!ctx.response.body) {
      ctx.response.body = { errors: {} }
    }
    // ctx.app.emit('error', err, ctx);
    console.error(err)

    switch (true) {
      case err instanceof errors.ValidationError:
        ctx.body.errors = formatValidationError(err)
        ctx.status = _.defaultTo(status, 422)
        break

      case err.code === "SQLITE_CONSTRAINT": {
        let path = "unknown"

        if (Number(err.errno) === 19) {
          // SQLITE3 UNIQUE
          const idx = err.message.lastIndexOf(".")
          if (idx !== -1) {
            path = err.message.substring(idx + 1, err.message.length)
            ctx.body.errors[path] = ["has already been taken"]
          }
        }

        ctx.status = _.defaultTo(status, 422)
        break
      }

      case Number(err.code) === 23505: {
        // PG UNIQUE
        let path = "unknown"
        const [key] = err.detail.match(/\(.+?\)/g)
        if (key) {
          path = key.substr(1, key.length - 2)
        }

        ctx.body.errors[path] = ["has already been taken"]
        ctx.status = _.defaultTo(status, 422)
        break
      }

      default:
        ctx.status = _.defaultTo(status, 500)
        break
    }
  }
}

function formatValidationError(err) {
  const result = {}
  if (err.path) {
    result[err.path] = [_.defaultTo(err.message, "is not valid")]
  }
  if (err.inner && err.inner.length > 0) {
    err.inner
      .map(err => formatValidationError(err))
      .reduce((prev, curr) => Object.assign(prev, curr), result)
  }
  return result
}
