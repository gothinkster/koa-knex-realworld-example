const db = require("../lib/db")

module.exports = {
  async get(ctx) {
    const tags = await db("tags").pluck("name")

    ctx.body = { tags }
  },
}
