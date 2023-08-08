const GoogleStrategy = require("passport-google-oauth20").Strategy
const User = require("../../../models/user/user.schema")

async function registerGoogleUser(accessToken, refreshToken, profile, done) {
    try {
        console.log("google profile: ", profile)
        const { sub, name, picture, email, email_verified } = profile._json

        const provider = {
            name: "google",
            id: sub,
        }

        const userExists = await User.findOne({
            email,
            "provider.name": "google",
        }).lean()

        if (userExists) {
            return done(null, userExists)
        }

        const user = await new User({
            provider,
            name,
            email,
            "avatar.url": picture,
            verified: email_verified,
        })

        const createdUser = await user.save()

        return done(null, createdUser)
    } catch (error) {
        console.log(error)
    }
}

const googleStrategy = new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    registerGoogleUser
)

module.exports = googleStrategy
