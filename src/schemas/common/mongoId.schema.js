const Joi = require("joi")

const mongoIdSchema = Joi.object({
    id: Joi.string().hex().length(24),
}).messages({
    "string.length": "Invalid ID format",
    "string.hex": "Invalid ID format",
})

module.exports = mongoIdSchema
