const User = require("../../../models/user/user.schema")
const {
    issueRefreshToken,
    issueAccessToken,
    verifyRefreshToken,
    issueResetPasswordToken,
} = require("../../../helpers/jwt/jwt.helpers")
const { sendMail } = require("../../../helpers/nodeMailer/nodeMailer.helper")
const { cookieConfig } = require("../../../config/cookie/cookie.config")

function httpLoginUser(req, res) {
    try {
        const user = req.user
        const userId = req.user._id

        const accessToken = issueAccessToken(user)

        const refreshToken = issueRefreshToken(userId)

        res.cookie("token", "sample")

        res.cookie("jwt", refreshToken, cookieConfig)

        res.status(200).json({
            accessToken,
        })
    } catch (error) {
        console.log("failed to login, error: ", error)
        return res.status(401).json({ message: "failed to login" })
    }
}

async function httpRefreshToken(req, res) {
    try {
        console.log("refresh token")
        const cookies = req.cookies

        const noJwtCookie = !cookies?.jwt

        if (noJwtCookie) {
            return res.sendStatus(401)
        }

        const refreshTokenCookie = cookies.jwt

        try {
            const decodedJwt = verifyRefreshToken(refreshTokenCookie)

            const userId = decodedJwt.userId

            const userExists = await User.findById(userId).lean()

            if (!userExists) {
                return res.sendStatus(401)
            }

            const accessToken = issueAccessToken(userExists)

            res.json({ accessToken })
        } catch (error) {
            return res.sendStatus(401)
        }
    } catch (error) {
        return res.sendStatus(500)
    }
}

async function httpForgotPassword(req, res) {
    try {
        const { email } = req.body
        const filter = { email, "provider.name": "regular" }

        const user = await findUser(filter)

        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        const currentTimestamp = Date.now()
        const coolDownPeriod = 5 * 60 * 1000

        const lastResetPasswordTimestamp = user.lastResetPasswordTimestamp

        if (
            lastResetPasswordTimestamp &&
            currentTimestamp - lastResetPasswordTimestamp < coolDownPeriod
        ) {
            console.log(
                "Please wait 5 minutes before requesting another reset password email."
            )
            return res.status(429).json({
                message:
                    "Too many reset password requests. Please wait before trying again.",
            })
        }

        const resetPasswordToken = issueResetPasswordToken({
            userId: user._id,
            email,
        })

        const tenMinutes = 600000
        user.resetPasswordToken = resetPasswordToken
        user.resetPasswordExpiry = Date.now() + tenMinutes
        user.lastResetPasswordTimestamp = new Date()

        const subject = "Password Reset Request"
        const resetPasswordLink = `${process.env.CLIENT_URL}/reset_password/${resetPasswordToken}`
        const message = `Please click on the following link to reset your password: <a href="${resetPasswordLink}">Reset Password</a> If you did not request this, please ignore this email.`

        const emailSent = await sendMail(email, subject, message)

        if (emailSent) {
            await user.save()

            return res.status(200).json({
                success: true,
                message: "Password reset email sent successfully.",
            })
        } else {
            return res
                .status(500)
                .json({ message: "Failed to send password reset email." })
        }
    } catch (error) {
        console.log("Error in httpForgotPassword:", error)
        return res.status(500).json({ message: "Failed to reset password." })
    }
}

async function httpVerifyResetPassword(req, res) {
    try {
        const resetToken = req.headers.authorization.split(" ")[1]
        const { newPassword } = req.body

        if (!resetToken) {
            return res.status(400).json({ error: "Reset token is missing" })
        }

        if (!newPassword) {
            return res.status(400).json({ error: "New password is missing" })
        }

        const user = await User.findOne({
            resetPasswordToken: resetToken,
        }).lean()

        if (!user) {
            return res
                .status(404)
                .json({ error: "Invalid or expired reset token." })
        }

        if (user.resetPasswordExpiry < Date.now()) {
            return res.status(400).json({ error: "Reset token has expired." })
        }

        user.password = newPassword
        user.resetPasswordToken = null
        user.resetPasswordExpiry = null
        user.lastResetPasswordTimestamp = undefined

        await user.save()

        return res
            .status(200)
            .json({ success: true, message: "Password reset successful." })
    } catch (error) {
        return res.sendStatus(204)
    }
}

function httpLogout(req, res) {
    try {
        const cookies = req.cookies
        const noJwtCookie = !cookies?.jwt

        if (noJwtCookie) {
            return res.sendStatus(204)
        }

        res.clearCookie("jwt", {
            httpOnly: true,
            secure: true,
            sameSite: "None",
        })

        res.status(200).json({ message: "user successfully logout" })
    } catch (error) {
        return res.sendStatus(204)
    }
}

module.exports = {
    httpLoginUser,
    httpRefreshToken,
    httpForgotPassword,
    httpVerifyResetPassword,
    httpLogout,
}
