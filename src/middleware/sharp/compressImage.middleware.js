const sharp = require("sharp")

const compressImage = (
    options = {
        width: 300,
        height: 300,
        fit: "cover",
        position: "center",
        quality: 80,
    }
) => {
    return async function (req, res, next) {
        console.log("compressing image")
        try {
            const file = req.file
            console.log("compress ", req.file)

            if (!file) {
                return next()
            }

            const compressedBuffer = await sharp(file.buffer)
                .resize({
                    width: options.width,
                    height: options.height,
                    fit: options.fit,
                    position: options.position,
                })
                .jpeg({ quality: options.quality })
                .toBuffer()

            req.file.buffer = compressedBuffer

            next()
        } catch (error) {
            console.error("Failed to compress image:", error)
            res.status(500).json({
                success: false,
                message: "Failed to compress image",
            })
        }
    }
}

module.exports = compressImage
