const validate =
    (schema, options = { source: "body" }) =>
    (req, res, next) => {
        let data

        if (options.source === "body") {
            data = req.body
        } else if (options.source === "params") {
            data = req.params
        } else {
            return res
                .status(400)
                .json({ message: "Invalid validation source" })
        }

        const { error } = schema.validate(data, options)

        if (error) {
            const errorMessages = error.details.map((detail) => {
                const { message, context } = detail

                const { key } = context

                const errorMessage = {
                    field: key,
                    message,
                }

                return errorMessage
            })
            return res
                .status(422)
                .json({ message: "Validation failed", errors: errorMessages })
        }

        next()
    }

module.exports = validate
