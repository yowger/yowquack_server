const helmet = require("helmet")
const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const corsOptions = require("./config/cors/cors.config")
const passport = require("passport")

const jwtStrategy = require("./config/auth/jwt/jwt.strategy")
const localStrategy = require("./config/auth/local/local.strategy")
const googleStrategy = require("./config/auth/google/google.strategy")
const apiRoutesV1 = require("./routes/v1/api.router.v1")

const app = express()

app.use(cors(corsOptions))

app.use(express.json())
app.use(cookieParser())
app.use(helmet())

passport.use(jwtStrategy)
passport.use(localStrategy)
passport.use(googleStrategy)

app.use("/v1", apiRoutesV1)

// const listEndpoints = require("express-list-endpoints")
// console.log(listEndpoints(app))

module.exports = app
