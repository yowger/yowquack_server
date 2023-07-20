const Joi = require("joi")

const reactionSchema = Joi.object({
    type: Joi.string()
        .valid("like", "love", "haha", "wow", "sad", "angry")
        .required(),
})

module.exports = reactionSchema
