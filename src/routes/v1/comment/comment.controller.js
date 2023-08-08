const Comment = require("../../../models/comment/comment.schema")
const Post = require("../../../models/post/post.schema")
const User = require("../../../models/user/user.schema")
const Notification = require("../../../models/notification/notification.schema")
const cloudinary = require("../../../config/cloudinary/cloudinary.config")
const {
    imageBufferToDataUrl,
} = require("../../../helpers/dataUri/dataUri.helper")

async function getComments(req, res) {
    try {
        console.log("get comment")
        const { id: postId } = req.params
        const { page, limit } = req.query
        const pageNumber = parseInt(page) || 1
        const commentsPerPage = parseInt(limit) || 10

        const totalComments = await Comment.countDocuments({ post: postId })
        const totalPages = Math.ceil(totalComments / commentsPerPage)

        const commentsToSkip = (pageNumber - 1) * commentsPerPage

        const comments = await Comment.find({ post: postId })
            .skip(commentsToSkip)
            .limit(commentsPerPage)
            .populate("user", "_id name profileImage.url")
            .lean()

        res.status(200).json({
            success: true,
            data: {
                comments,
                totalComments,
                currentPage: pageNumber,
                totalPages,
            },
        })
    } catch (error) {
        console.error("Failed to retrieve comments: ", error)
        res.status(500).json({
            success: false,
            message: "Failed to retrieve comments",
            error: "Internal server error",
        })
    }
}

async function createComment(req, res) {
    try {
        const { id: postId } = req.params
        const { content } = req.body
        const image = req.file

        // const userId = "64a605a7791001feb7f25ac8"
        // const userId = "64cd0720c774731edee9b12c"
        // const userId = "64a72fd1a18010688da835cf"
        // remi
        // const userId = "64c78606f59a5866610ae1df"
        // Roger
        // const userId = "64cd180b1a2831d698a735bd"
        // luffy
        const userId = "64cd195dbb8b492e5c114740"

        res.status(200)

        const post = await Post.findById(postId)

        if (!post) {
            return res
                .status(404)
                .json({ success: false, message: "Post not found" })
        }

        let newCommentData = {
            post: postId,
            user: userId,
            content,
        }

        if (image) {
            const imageDataUrl = imageBufferToDataUrl(image.buffer)

            const options = {
                unique_filename: true,
                overwrite: true,
                folder: `yow_quack/comment/${postId}/`,
            }

            const result = await cloudinary.uploader.upload(
                imageDataUrl,
                options
            )

            newCommentData.image = {
                publicId: result.public_id,
                url: result.secure_url,
            }
        }

        const newComment = new Comment(newCommentData)

        await newComment.save()

        const recipientId = post.user

        const notification = new Notification({
            recipient: recipientId,
            sender: userId,
            type: "comment",
            content: "Someone commented on your post.",
            postId: postId,
            commentId: newComment._id,
        })

        await notification.save()

        res.status(201).json({
            success: true,
            message: "Comment created successfully",
            data: {
                comment: {
                    _id: newComment._id,
                    user: newComment.user,
                    post: newComment.post,
                    content: newComment.content,
                    image: newComment.image.url,
                    createdAt: newComment.createdAt,
                    updatedAt: newComment.updatedAt,
                },
            },
        })
    } catch (error) {
        console.error("Failed to create comment:", error)
        res.status(500).json({
            success: false,
            message: "Failed to create comment",
            error: "Internal server error",
        })
    }
}

async function updateComment(req, res) {
    try {
        const { id: commentID } = req.params
        const { content } = req.body

        const updatedComment = await Comment.findByIdAndUpdate(
            commentID,
            { content },
            { new: true }
        )
            .select("_id user post content image.url createdAt updatedAt")
            .populate("user", "_id name profileImage.url")

        if (!updatedComment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found",
            })
        }

        res.status(200).json({
            success: true,
            message: "Comment updated successfully",
            data: {
                comment: updatedComment,
            },
        })
    } catch (error) {
        console.error("Failed to update comment: ", error)

        res.status(500).json({
            success: false,
            message: "Failed to update comment",
            error: "Internal server error",
        })
    }
}

async function deleteComment(req, res) {
    console.log("comment deleted")
    try {
        const { id: commentId } = req.params
        const userId = "64a605a7791001feb7f25ac8"

        const comment = await Comment.findOneAndDelete({
            _id: commentId,
            // user: userId,
        }).select("_id user post content image createdAt updatedAt")

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found",
            })
        }

        if (comment.image && comment.image.publicId) {
            const { publicId } = comment.image

            await cloudinary.uploader.destroy(publicId)
        }

        await Notification.deleteOne({ commentId: commentId })

        res.status(200).json({
            success: true,
            message: "Comment deleted successfully",
        })
    } catch (error) {
        console.error("Failed to delete comment: ", error)

        res.status(500).json({
            success: false,
            message: "Failed to delete comment",
            error: "Internal server error",
        })
    }
}

module.exports = { getComments, createComment, updateComment, deleteComment }
