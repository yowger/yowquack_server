const express = require("express")
const passport = require("passport")
const googleRouter = express.Router()
const { httpGoogleCallback } = require("./google.controller")

googleRouter.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
)

googleRouter.get(
    "/google/callback",
    passport.authenticate("google", {
        session: false,
    }),
    httpGoogleCallback
)

module.exports = googleRouter
