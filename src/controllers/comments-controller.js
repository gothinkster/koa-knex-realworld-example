const humps = require("humps")
const uuid = require("uuid")
const _ = require("lodash")
const { getSelect } = require("../lib/utils")
const joinJs = require("join-js").default
const db = require("../lib/db")
const {
  commentFields,
  userFields,
  relationsMaps,
} = require("../lib/relations-map")

module.exports = {
  async byComment(comment, ctx, next) {
    ctx.assert(comment, 404)

    comment = await db("comments")
      .first()
      .where({ id: comment })

    ctx.assert(comment, 404)

    ctx.params.comment = comment

    return next()
  },

  async get(ctx) {
    const { user } = ctx.state
    const { article } = ctx.params

    let comments = await db("comments")
      .select(
        ...getSelect("comments", "comment", commentFields),
        ...getSelect("users", "author", userFields),
        "followers.id as author_following",
      )
      .where({ article: article.id })
      .leftJoin("users", "comments.author", "users.id")
      .leftJoin("followers", function() {
        this.on("users.id", "=", "followers.user").onIn("followers.follower", [
          user && user.id,
        ])
      })

    comments = joinJs
      .map(comments, relationsMaps, "commentMap", "comment_")
      .map(c => {
        delete c.author.id
        c.author.following = Boolean(c.author.following)
        return c
      })

    ctx.body = { comments }
  },

  async post(ctx) {
    const { body } = ctx.request
    const { user } = ctx.state
    const { article } = ctx.params
    let { comment = {} } = body

    const opts = { abortEarly: false }

    comment.id = uuid()
    comment.author = user.id
    comment.article = article.id

    comment = await ctx.app.schemas.comment.validate(comment, opts)

    await db("comments").insert(humps.decamelizeKeys(comment))

    comment.author = _.pick(user, ["username", "bio", "image", "id"])

    ctx.body = { comment }
  },

  async del(ctx) {
    const { comment } = ctx.params

    await db("comments")
      .del()
      .where({ id: comment.id })

    ctx.body = {}
  },
}
