const mongoose = require("mongoose")

const postSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
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
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        visibility: {
            type: String,
            enum: ["public", "private", "friends"],
            default: "public",
        },
    },
    { timestamps: true }
)

const Post = mongoose.model("Post", postSchema)

module.exports = Post
