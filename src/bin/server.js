require("../lib/bootstrap")
const pEvent = require("p-event")
const createServerAndListen = require("../lib/server")
const config = require("config")

const app = require("../lib/app")

async function main() {
  const host = config.get("server.host")
  const port = config.get("server.port")
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
