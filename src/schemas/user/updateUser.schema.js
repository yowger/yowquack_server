const Joi = require("joi")

const updateUserSchema = Joi.object()
    .keys({
        id: Joi.string(), //delete later
        name: Joi.string().trim().min(2).max(30).optional(),
        email: Joi.string().email().optional(),
        bio: Joi.string().optional(),
    })
    .min(1)
    .messages({
        "object.min": "At least one field is required for user update",
    })

module.exports = updateUserSchema
