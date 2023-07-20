const sharp = require("sharp")

const DEFAULT_OPTIONS = {
    width: 300,
    height: 300,
    fit: "cover",
    position: "center",
    quality: 80,
}

const compressImage = (options) => {
    return async (req, res, next) => {
        try {
            const file = req.file
            const mergedOptions = { ...DEFAULT_OPTIONS, ...options }

            const compressedBuffer = await sharp(file.buffer)
                .resize({
                    width: mergedOptions.width,
                    height: mergedOptions.height,
                    fit: mergedOptions.fit,
                    position: mergedOptions.position,
                })
                .jpeg({ quality: mergedOptions.quality })
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
