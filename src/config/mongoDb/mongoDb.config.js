const mongoose = require("mongoose")

const MONGO_URL = process.env.MONGO_URL

mongoose.connection.once("open", () => {
    console.log("MongoDB connection ready!")
})

mongoose.connection.on("error", (err) => {
    console.error("mongo connection error: ", err)
})

function mongoConnect() {
    mongoose.connect(MONGO_URL)
}

async function mongoConnect() {
    try {
        await mongoose.connect(MONGO_URL)
    } catch (error) {
        console.error("MongoDB connection error:", error)
    }
}

async function mongoDisconnect() {
    await mongoose.disconnect()
}

process.on("SIGINT", async () => {
    await mongoDisconnect()
    process.exit(0)
})

module.exports = {
    mongoConnect,
    mongoDisconnect,
}
