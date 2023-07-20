const JwtStrategy = require("passport-jwt").Strategy
const ExtractJwt = require("passport-jwt").ExtractJwt
const User = require("../../../models/user/user.schema")

const jwtStrategy = new JwtStrategy(
    {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken("authorization"),
        secretOrKey: process.env.JWT_SECRET,
    },
    async function (jwtPayload, done) {
        try {
            const user = jwtPayload.user

            const userExists = await User.findUser({ _id: user.id }).lean()

            if (!userExists) {
                done(null, false)
            }

            done(null, user)
        } catch (error) {
            done(error, false)
        }
    }
)

module.exports = jwtStrategy
