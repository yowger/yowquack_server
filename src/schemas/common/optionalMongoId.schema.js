const Joi = require("joi")

const optionalMongoIdSchema = Joi.object({
    id: Joi.string().hex().length(24).optional(),
}).messages({
    "string.length": "Invalid ID format",
    "string.hex": "Invalid ID format",
})

module.exports = optionalMongoIdSchema
