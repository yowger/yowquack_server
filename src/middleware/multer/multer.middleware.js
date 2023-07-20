const multer = require("multer")

const memoryStorage = multer.memoryStorage()

function fileFilter(req, file, callback) {
    const fileSize = parseInt(req.headers["content-length"])
    const threeMegabytes = 3000000

    if (fileSize > threeMegabytes) {
        req.fileSizeError =
            "File size exceeds the limit. Only a maximum of 3mb is allowed"
        callback(null, false)
    }

    if (
        file.mimetype == "image/png" ||
        file.mimetype == "image/jpg" ||
        file.mimetype == "image/jpeg" ||
        file.mimetype == "image/webp" 
    ) {
        callback(null, true)
    } else {
        req.fileTypeError =
            "Unsupported file type. Allowed formats: PNG, JPG, JPEG"

        callback(null, false)
    }
}

const upload = multer({
    storage: memoryStorage,
    fileFilter,
})

module.exports = { upload }
