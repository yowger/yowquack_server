const Joi = require("joi")

const commentSchema = Joi.object({
    content: Joi.string().required().min(1).max(280),
})

module.exports = commentSchema
