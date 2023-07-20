const mongoose = require("mongoose")

const reactionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
            required: true,
        },
        type: {
            type: String,
            enum: ["like", "haha", "wow", "sad", "angry"],
            required: true,
        },
    },
    { timestamps: true }
)

const Reaction = mongoose.model("reaction", reactionSchema)

module.exports = Reaction
