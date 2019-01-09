const http = require("http")
const stoppable = require("stoppable")
const pEvent = require("p-event")
const util = require("util")

module.exports = async function createServerAndListen(app, port, host) {
  const server = stoppable(http.createServer(app.callback()), 7000)

  server.listen(port, host)

  server.stop = util.promisify(server.stop)

  await pEvent(server, "listening")

  return server
}
