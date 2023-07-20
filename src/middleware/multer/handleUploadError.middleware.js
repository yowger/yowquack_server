function handleUploadError(req, res, next) {
    if (req.fileTypeError) {
        const errorMessage = req.fileTypeError
        return res.status(415).json({ success: false, error: errorMessage })
    }

    if (req.fileSizeError) {
        const errorMessage = req.fileSizeError
        return res.status(413).json({ success: false, error: errorMessage })
    }

    if (!req.file || !req.file.buffer) {
        const errorMessage = "No image file provided"
        return res.status(400).json({ success: false, error: errorMessage })
    }

    next()
}

module.exports = {
    handleUploadError,
}
