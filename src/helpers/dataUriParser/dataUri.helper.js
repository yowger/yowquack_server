const DatauriParser = require("datauri/parser")

const imageBufferToDataUrl = (buffer, format = ".jpg") => {
    const parser = new DatauriParser()
    parser.format(format, buffer)
    const imageDataUrl = parser.content

    return imageDataUrl
}

module.exports = { imageBufferToDataUrl }
