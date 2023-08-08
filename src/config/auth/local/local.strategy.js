const LocalStrategy = require("passport-local").Strategy
const User = require("../../../models/user/user.schema")

const localStrategy = new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async function (email, password, done) {
        console.log("test ", email, password)
        try {
            const user = await User.findOne({
                email,
                "provider.name": "regular",
            })

            if (!user) {
                return done(null, false, {
                    statusCode: 404,
                    errors: "email is not registered",
                })
            }

            const matchPassword = await user.matchPassword(password)

            if (!matchPassword) {
                return done(null, false, {
                    statusCode: 401,
                    errors: "invalid password",
                })
            }

            return done(null, user)
        } catch (error) {
            return done(error, false, { errors: "error logging in" })
        }
    }
)

module.exports = localStrategy
