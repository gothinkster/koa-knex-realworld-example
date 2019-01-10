require("./src/lib/bootstrap")
const config = require("config")
const fs = require("fs")

if (config.get("db.client") === "sqlite3") {
  try {
    fs.mkdirSync("data")
  } catch (err) {
    if (err.code !== "EEXIST") {
      throw err
    }
  }
}

const dbClient = config.get("db.client")
const dbConnection = config.has("db.connection") && config.get("db.connection")

const options = {
  client: dbClient,
  connection: dbConnection || {
    filename: "data/dev.sqlite3",
  },
  migrations: {
    directory: "src/migrations",
    tableName: "migrations",
  },
  debug: false,
  seeds: {
    directory: "src/seeds",
  },
  useNullAsDefault: dbClient === "sqlite3",
}

if (dbClient !== "sqlite3") {
  options.pool = {
    min: 2,
    max: 10,
  }
}

const configs = {
  development: Object.assign({}, options),

  test: Object.assign({}, options, {
    connection: dbConnection || {
      filename: "data/test.sqlite3",
    },
  }),

  production: Object.assign({}, options, {
    connection: dbConnection || {
      filename: "data/prod.sqlite3",
    },
  }),
}

Object.assign(configs, configs[process.env.NODE_ENV])

module.exports = configs
