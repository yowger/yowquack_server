const jwt = require("jsonwebtoken")

function issueAccessToken(user) {
    console.log("issuing access token")
    const { _id, username, name, roles, avatar } = user
    const secretKey = process.env.JWT_SECRET
    const expiresIn = "15m"

    const payload = {
        user: {
            id: _id,
            username,
            name,
            roles,
            avatar: avatar.url,
        },
    }

    const accessToken = jwt.sign(payload, secretKey, {
        expiresIn,
    })

    return accessToken
}

function verifyAccessToken(accessToken) {
    console.log("issuing verify token")
    try {
        const secretKey = process.env.JWT_SECRET
        const decodedToken = jwt.verify(accessToken, secretKey)

        return decodedToken
    } catch (error) {
        return null
    }
}

function issueRefreshToken(userId) {
    const payload = { userId }
    const secretKey = process.env.REFRESH_TOKEN_SECRET
    const expiresIn = "1d"

    const refreshToken = jwt.sign(payload, secretKey, {
        expiresIn,
    })

    return refreshToken
}

function verifyRefreshToken(refreshToken) {
    const secretKey = process.env.REFRESH_TOKEN_SECRET

    const refreshTokenVerification = jwt.verify(refreshToken, secretKey)

    return refreshTokenVerification
}

function issueResetPasswordToken({ userId, email }) {
    const secretKey = process.env.JWT_RESET_PASSWORD
    const expiresIn = "10m"

    const payload = {
        userId: userId,
        email: email,
    }

    const resetPasswordToken = jwt.sign(payload, secretKey, {
        expiresIn,
    })

    return resetPasswordToken
}

// function verifyPasswordResetTokenValid(token) {
//     try {
//         const secret = process.env.JWT_RESET_PASSWORD
//         const decoded = jwt.verify(token, secret)
//         const user = decoded

//         // Perform additional checks if needed, such as token expiration or user existence

//         return user // Return the userId if the token is valid
//     } catch (error) {
//         return false // Return false if the token is invalid or expired
//     }
// }

module.exports = {
    issueAccessToken,
    verifyAccessToken,
    issueRefreshToken,
    verifyRefreshToken,
    issueResetPasswordToken,
}
