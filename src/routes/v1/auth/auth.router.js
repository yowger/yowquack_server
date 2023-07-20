const express = require("express")
const authRouter = express.Router()
const passportAuth = require("../../../middleware/passport/passportAuth.middleware")
const {
    httpLoginUser,
    httpRefreshToken,
    httpForgotPassword,
    httpVerifyResetPassword,
    httpLogout,
} = require("./auth.controller")

authRouter.post("/login", passportAuth, httpLoginUser)
authRouter.get("/refresh_token", httpRefreshToken)
authRouter.post("/forgot_password", httpForgotPassword)
authRouter.post("/verify_reset_password", httpVerifyResetPassword)
authRouter.post("/logout", httpLogout)

module.exports = authRouter
