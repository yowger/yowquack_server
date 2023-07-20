const oneDay = 1 * 24 * 60 * 60 * 1000

const cookieConfig = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: oneDay,
}

module.exports = {
    cookieConfig,
}
