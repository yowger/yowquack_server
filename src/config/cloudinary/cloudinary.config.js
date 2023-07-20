const cloudinary = require("cloudinary").v2

const cloudName = process.env.CLOUDINARY_NAME
const apiKey = process.env.CLOUDINARY_API_KEY
const apiSecret = process.env.CLOUDINARY_API_SECRET

cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
})

module.exports = cloudinary
