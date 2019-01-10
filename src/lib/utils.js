const config = require("config")
const jwt = require("jsonwebtoken")
const _ = require("lodash")

function generateJWTforUser(user = {}) {
  return Object.assign({}, user, {
    token: jwt.sign(
      {
        sub: _.pick(user, ["id", "email", "username"]),
      },
      config.get("secret"),
      {
        expiresIn: "7d",
      },
    ),
  })
}

function getSelect(table, prefix, fields) {
  return fields.map(f => `${table}.${f} as ${prefix}_${f}`)
}

exports.generateJWTforUser = generateJWTforUser
exports.getSelect = getSelect
