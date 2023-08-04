const mongoose = require("mongoose")

const commentSchema = new mongoose.Schema(
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
        content: {
            type: String,
        },
        image: {
            publicId: {
                type: String,
                default: null,
            },
            url: {
                type: String,
                default: null,
            },
        },
    },
    { timestamps: true }
)

const Comment = mongoose.model("Comment", commentSchema)

module.exports = Comment
