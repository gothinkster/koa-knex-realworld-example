const config = require("config")
const knexfile = require("../../knexfile")
const fs = require("fs")

module.exports = function(app) {
  if (config.get("db.client") === "sqlite3") {
    try {
      fs.mkdirSync("data")
    } catch (err) {
      if (err.code !== "EEXIST") {
        throw err
      }
    }
  }

  const db = require("knex")(knexfile)
  app.db = db
  let promise

  if (process.env.NODE_ENV !== "test") {
    app.migration = true
    promise = db.migrate.latest().then(() => {
      app.migration = false
    }, console.error)
  }

  return async function(ctx, next) {
    if (ctx.app.migration && promise) {
      await promise
    }

    return next()
  }
}
