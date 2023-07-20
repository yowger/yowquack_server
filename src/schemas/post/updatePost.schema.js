const Joi = require("joi")

const updatePostSchema = Joi.object({
    content: Joi.string().trim().required().min(1).max(280),
})

module.exports = updatePostSchema
