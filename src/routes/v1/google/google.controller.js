const { issueRefreshToken } = require("../../../helpers/jwt/jwt.helpers")
const { cookieConfig } = require("../../../config/cookie/cookie.config")

async function httpGoogleCallback(req, res) {
    const userId = String(req.user._id)
    const HOMEPAGE = process.env.CLIENT_URL
    const endPoint = "/"
    const redirectPath = `${HOMEPAGE}${endPoint}`

    const refreshToken = issueRefreshToken(userId)

    res.cookie("jwt", refreshToken, cookieConfig)

    res.redirect(redirectPath)
}

module.exports = {
    httpGoogleCallback,
}
