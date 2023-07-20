const Joi = require("joi")

const passwordFormat = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[\S]{5,}$/
// Password must be at least 5 characters long and include at least one uppercase letter, one lowercase letter, and one number.

const specialCharsFormat = /^[-@.\w]*$/
// Password cannot contain any special characters except for underscore (_), at (@), period (.), and hyphen (-)

const createUserSchema = Joi.object().keys({
    name: Joi.string().trim().min(2).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string()
        .min(5)
        .max(20)
        .regex(passwordFormat)
        .regex(specialCharsFormat)
        .messages({
            "string.pattern.base": `"Password" must contain at least one uppercase letter, one lowercase letter, one number, and may include the following special characters: _ @ . -`,
        })
        .required(),
})

module.exports = createUserSchema
