const User = require("../../../models/user/user.schema")
const Post = require("../../../models/post/post.schema")
const Comment = require("../../../models/comment/comment.schema")
const mongoose = require("mongoose")

async function getPostsQuery(req, res) {
    try {
        const { id: userId } = req.params
        const { page, limit } = req.query
        const pageNumber = parseInt(page) || 1
        const postsPerPage = parseInt(limit) || 10

        const query = userId ? { user: userId } : {}

        const totalPosts = await Post.countDocuments(query)
        const postsToSkip = (pageNumber - 1) * postsPerPage
        const totalPages = Math.ceil(totalPosts / postsPerPage)

        const posts = await Post.find(query)
            .select("_id user content image reactions createdAt updatedAt")
            .sort({ createdAt: -1 })
            .skip(postsToSkip)
            .limit(postsPerPage)
            .populate({
                path: "user",
                select: "_id name profileImage.url createdAt",
            })
            .populate({
                path: "author",
                select: "_id name profileImage.url",
            })
            .populate({
                path: "comments",
                select: "_id user content image.url",
                populate: {
                    path: "user",
                    select: "_id profileImage.url name",
                },
                options: {
                    sort: { createdAt: -1 },
                    limit: 3,
                },
            })
            .lean()

        res.status(200).json({
            success: true,
            data: {
                posts,
                totalPosts,
                currentPage: pageNumber,
                totalPages,
            },
        })
    } catch (error) {
        console.error("Failed to retrieve posts: ", error)

        res.status(500).json({
            success: false,
            message: "Failed to retrieve posts",
            error: "Internal server error",
        })
    }
}

// todo create notification to followers when creating post
async function getPostsAggregation(
    query,
    options = { pagination: true, postsToSkip: 0, postsPerPage: 10 }
) {
    const { pagination, postsToSkip, postsPerPage } = options

    const aggregationPipeline = [
        {
            $match: query,
        },
    ]

    aggregationPipeline.push(
        {
            $lookup: {
                from: "users",
                let: { userId: "$user" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$_id", "$$userId"] },
                        },
                    },
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                            "profileImage.url": 1,
                        },
                    },
                ],
                as: "user",
            },
        },
        {
            $lookup: {
                from: "users",
                let: { authorId: "$author" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$_id", "$$authorId"] },
                        },
                    },
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                            "profileImage.url": 1,
                        },
                    },
                ],
                as: "author",
            },
        },
        {
            $lookup: {
                from: "comments",
                let: { postId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$post", "$$postId"] },
                        },
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "user",
                            foreignField: "_id",
                            as: "user",
                        },
                    },
                    {
                        $project: {
                            _id: 1,
                            user: {
                                _id: 1,
                                name: 1,
                                "profileImage.url": 1,
                            },
                            content: 1,
                            createdAt: 1,
                        },
                    },
                    { $sort: { createdAt: -1 } },
                    { $limit: 3 },
                ],
                as: "comments",
            },
        },
        {
            $lookup: {
                from: "reactions",
                let: { postId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$post", "$$postId"] },
                        },
                    },
                    {
                        $group: {
                            _id: "$type",
                            count: { $sum: 1 },
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            type: "$_id",
                            count: 1,
                        },
                    },
                ],
                as: "reactions",
            },
        },
        {
            $project: {
                _id: 1,
                user: { $arrayElemAt: ["$user", 0] },
                author: { $arrayElemAt: ["$author", 0] },
                content: 1,
                image: 1,
                reactions: 1,
                createdAt: 1,
                updatedAt: 1,
                comments: 1,
            },
        }
    )

    if (pagination) {
        aggregationPipeline.push(
            { $skip: postsToSkip },
            { $limit: postsPerPage }
        )
    }
    const posts = await Post.aggregate(aggregationPipeline)

    return posts
}

async function getPosts(req, res) {
    try {
        const { id: userId } = req.params
        const { page, limit } = req.query
        const query = userId ? { user: userId } : {}

        const totalPosts = await Post.countDocuments(query)

        const pageNumber = parseInt(page) || 1
        const postsPerPage = parseInt(limit) || 10
        const postsToSkip = (pageNumber - 1) * postsPerPage
        const totalPages = Math.ceil(totalPosts / postsPerPage)

        const posts = await getPostsAggregation(query, {
            postsToSkip,
            postsPerPage,
        })

        res.status(200).json({
            success: true,
            data: {
                posts,
                totalPosts,
                currentPage: pageNumber,
                totalPages,
            },
        })
    } catch (error) {
        console.error("Failed to retrieve posts: ", error)

        res.status(500).json({
            success: false,
            message: "Failed to retrieve posts",
            error: "Internal server error",
        })
    }
}

const getPost = async (req, res) => {
    try {
        const { id: postId } = req.params

        const query = {
            _id: new mongoose.Types.ObjectId(postId),
        }

        const post = await getPostsAggregation(query, { pagination: false })

        if (!post) {
            return res.status(404).json({ error: "Post not found" })
        }

        res.status(200).json({
            success: true,
            data: {
                post,
            },
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: "Server error" })
    }
}

async function createPost(req, res) {
    try {
        const { id: targetUserId } = req.params
        const userId = "64a605a7791001feb7f25ac8"
        // const userId = "64a72fd1a18010688da835cf"
        const { content } = req.body

        let targetUser

        if (targetUserId) {
            targetUser = await User.findById(targetUserId)
        } else {
            targetUser = userId
        }

        if (!targetUser) {
            return res.status(404).json({ error: "User not found" })
        }

        const newPost = new Post({
            user: targetUser,
            author: userId,
            content,
        })

        const createdPost = await newPost.save()

        res.status(201).json({
            success: true,
            message: "Post created successfully",
            data: {
                post: {
                    _id: createdPost._id,
                    user: createdPost.user,
                    content: createdPost.content,
                    image: createdPost.image,
                    author: createdPost.author,
                    reactions: createdPost.reactions,
                    createdAt: createdPost.createdAt,
                    updatedAt: createdPost.updatedAt,
                },
            },
        })
    } catch (error) {
        console.error("Failed to create post: ", error)

        res.status(500).json({
            success: false,
            message: "Failed to create post",
            error: "Internal server error",
        })
    }
}

async function updatePost(req, res) {
    try {
        const userId = "64a605a7791001feb7f25ac8"
        const { id: postID } = req.params
        const { content } = req.body

        const post = await Post.findOneAndUpdate(
            { _id: postID, user: userId },
            { content }
        )
            .select("_id user content image reactions createdAt updatedAt")
            .populate({
                path: "user",
                select: "_id name profileImage.url",
            })

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            })
        }

        res.status(200).json({
            success: true,
            message: "Post updated successfully",
            data: {
                post,
            },
        })
    } catch (error) {
        console.error("Failed to update post: ", error)

        res.status(500).json({
            success: false,
            message: "Failed to update post",
            error: "Internal server error",
        })
    }
}

async function deletePost(req, res) {
    try {
        const userId = "64a605a7791001feb7f25ac8"
        const { id: postID } = req.params

        const deletedPost = await Post.findOneAndDelete({
            _id: postID,
            user: userId,
        })
            .select("_id user content image reactions createdAt updatedAt")
            .populate({
                path: "user",
                select: "_id name profileImage.url",
            })

        if (!deletedPost) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            })
        }

        res.status(200).json({
            success: true,
            message: "Post deleted successfully",
            data: {
                post: deletedPost,
            },
        })
    } catch (error) {
        console.error("Failed to delete post: ", error)

        res.status(500).json({
            success: false,
            message: "Failed to delete post",
            error: "Internal server error",
        })
    }
}

module.exports = { getPosts, getPost, createPost, updatePost, deletePost }
