const Reaction = require("../../../models/reaction/reaction.schema")
const Post = require("../../../models/post/post.schema")
const Notification = require("../../../models/notification/notification.schema")

async function getReactions(req, res) {
    try {
        const { postId } = req.params

        const reactions = await Reaction.find({ post: postId }).lean()

        res.status(200).json({
            success: true,
            message: "Reactions retrieved successfully",
            data: {
                reactions,
            },
        })
    } catch (error) {
        console.error("Failed to retrieve reactions:", error)

        res.status(500).json({
            success: false,
            message: "Failed to retrieve reactions",
            error: "Internal server error",
        })
    }
}

async function createReaction(req, res) {
    try {
        const { id: postId } = req.params
        const { type } = req.body
        // const userId = req.user._id
        // const userId = "64a72fd1a18010688da835cf"
        // const userId = "64a605a7791001feb7f25ac8"
        // const userId = "64a8b398e0fc0396336b17b5"
        // Roger
        // const userId = "64cd180b1a2831d698a735bd"
        // luffy
        const userId = "64cd195dbb8b492e5c114740"

        const post = await Post.findById(postId)
        if (!post) {
            return res
                .status(404)
                .json({ success: false, message: "Post not found" })
        }

        const existingReaction = await Reaction.findOne({
            user: userId,
            post: postId,
        })

        if (existingReaction) {
            existingReaction.type = type
            await existingReaction.save()

            return res.status(200).json({
                success: true,
                message: "Reaction updated successfully",
                data: { reaction: existingReaction },
            })
        }

        const reaction = new Reaction({
            user: userId,
            post: postId,
            type: type,
        })

        await reaction.save()

        const recipientId = post.user

        const notification = new Notification({
            recipient: recipientId,
            sender: userId,
            type: "reaction",
            content: "Someone reacted to your post.",
            postId: postId,
            reactionId: reaction._id,
        })

        await notification.save()

        res.status(201).json({
            success: true,
            message: "Reaction created successfully",
            data: { reaction },
        })
    } catch (error) {
        console.error("Failed to create/update reaction:", error)
        res.status(500).json({
            success: false,
            message: "Failed to create/update reaction",
            error: "Internal server error",
        })
    }
}

async function updateReaction(req, res) {
    try {
        const { id: reactionId } = req.params
        const { type } = req.body
        // const userId = req.user._id
        const userId = "64a72fd1a18010688da835cf"

        const reaction = await Reaction.findOneAndUpdate(
            { _id: reactionId, user: userId },
            { type },
            { new: true }
        )

        if (!reaction) {
            return res.status(404).json({
                success: false,
                message: "Reaction not found",
                data: null,
            })
        }

        res.status(200).json({
            success: true,
            message: "Reaction updated successfully",
            data: {
                reaction,
            },
        })
    } catch (error) {
        console.error("Failed to update reaction:", error)

        res.status(500).json({
            success: false,
            message: "Failed to update reaction",
            error: "Internal server error",
        })
    }
}

async function deleteReaction(req, res) {
    try {
        const { id: reactionId } = req.params
        const { userId } = req.user

        const reaction = await Reaction.findOne({
            _id: reactionId,
            user: userId,
        })

        if (!reaction) {
            return res.status(404).json({
                success: false,
                message: "Reaction not found",
                data: null,
            })
        }

        await Reaction.findByIdAndDelete(reactionId)

        await Notification.deleteOne({ reactionId: reactionId })

        res.status(200).json({
            success: true,
            message: "Reaction deleted successfully",
            data: null,
        })
    } catch (error) {
        console.error("Failed to delete reaction:", error)

        res.status(500).json({
            success: false,
            message: "Failed to delete reaction",
            error: "Internal server error",
        })
    }
}

module.exports = {
    getReactions,
    createReaction,
    updateReaction,
    deleteReaction,
}
