const { ValidationError } = require("yup")
const http = require("http")

class AuthenticationError extends Error {
  constructor(message = http.STATUS_CODES[401]) {
    super(message)
    this.message = message
    this.statusCode = 401

    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

class AuthorizationError extends Error {
  constructor(message = http.STATUS_CODES[403]) {
    super(message)
    this.message = message
    this.statusCode = 403

    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

class NotFoundError extends Error {
  constructor(message = http.STATUS_CODES[404]) {
    super(message)
    this.message = message
    this.statusCode = 404

    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

class ServerError extends Error {
  constructor(message = http.STATUS_CODES[500]) {
    super(message)
    this.message = message
    this.statusCode = 500

    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = {
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ValidationError,
  ServerError,
}

// module.exports = {
//   UnauthorizedError, // 401
//   ForbiddenError, // 403
//   NotFoundError, // 404
//   ValidationError, // 422
//   ServerError, // 500
// }
