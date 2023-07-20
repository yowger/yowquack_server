const passport = require("passport")

function passportAuth(req, res, next) {
    passport.authenticate(
        "local-login",
        { session: false },
        function (error, user, info) {
            const errorMessage = info?.errors || null
            const statusCode = info?.statusCode || 400

            if (!user) {
                return res.status(statusCode).json({ message: errorMessage })
            }

            req.user = user

            next()
        }
    )(req, res, next)
}

module.exports = passportAuth
