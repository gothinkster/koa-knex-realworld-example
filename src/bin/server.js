require("../lib/bootstrap")
const pEvent = require("p-event")
const createServerAndListen = require("../lib/server")
const {
  server: { port, host },
} = require("../config")

const app = require("../app")

async function main() {
  let server

  try {
    server = await createServerAndListen(app, port, host)
    console.log(`Server is listening on: ${host}:${port}`)

    await Promise.race([
      ...["SIGINT", "SIGHUP", "SIGTERM"].map(s =>
        pEvent(process, s, {
          rejectionEvents: ["uncaughtException", "unhandledRejection"],
        }),
      ),
    ])
  } catch (err) {
    process.exitCode = 1
    console.error(err)
  } finally {
    if (server) {
      console.log("Close server")
      await server.stop()
      console.log("Server closed")
    }

    setTimeout(() => process.exit(), 10000).unref()
  }
}

main()
