const Joi = require("joi")

const createPostSchema = Joi.object({
    content: Joi.string().trim().required().min(1).max(280),
})

module.exports = createPostSchema
