const Follow = require("../../../models/follow/follow.schema")

async function getFollowers(req, res) {
    try {
        const { id } = req.params

        const followers = await Follow.find({ following: id })
            .select("_id follower createdAt")
            .populate("follower", "_id name profileImage.url")

        const totalFollowers = followers.length

        res.status(200).json({
            success: true,
            message: "Followers retrieved successfully",
            data: {
                followers,
                totalFollowers,
            },
        })
    } catch (error) {
        console.error("Failed to retrieve followers:", error)

        res.status(500).json({
            success: false,
            message: "Failed to retrieve followers",
            error: "Internal server error",
        })
    }
}

async function getFollowing(req, res) {
    try {
        const { id } = req.params

        const following = await Follow.find({ follower: id })
            .select("_id following createdAt")
            .populate("following", "_id name profileImage.url")

        const totalFollowing = following.length

        res.status(200).json({
            success: true,
            message: "Following retrieved successfully",
            data: {
                following,
                totalFollowing,
            },
        })
    } catch (error) {
        console.error("Failed to retrieve following:", error)

        res.status(500).json({
            success: false,
            message: "Failed to retrieve following",
            error: "Internal server error",
        })
    }
}

async function followUser(req, res) {
    try {
        // const followerId = req.user._id
        // const followerId = "64a605a7791001feb7f25ac8"
        // const followerId = "64a72fd1a18010688da835cf"
        const followerId = "64a8b398e0fc0396336b17b5" //temporary
        const { followingId } = req.body

        const existingFollow = await Follow.findOne({
            follower: followerId,
            following: followingId,
        })

        if (existingFollow) {
            return res.status(409).json({
                success: false,
                message: "User is already being followed",
                data: {
                    follow: existingFollow,
                },
            })
        }

        const follow = new Follow({
            follower: followerId,
            following: followingId,
        })

        await follow.save()

        res.status(201).json({
            success: true,
            message: "User followed successfully",
            data: {
                follow,
            },
        })
    } catch (error) {
        console.error("Failed to follow user:", error)

        res.status(500).json({
            success: false,
            message: "Failed to follow user",
            error: "Internal server error",
        })
    }
}

async function unfollowUser(req, res) {
    try {
        const followerId = "64a8b398e0fc0396336b17b5"
        const { followingId } = req.body

        const deletedFollow = await Follow.findOneAndDelete({
            follower: followerId,
            following: followingId,
        })

        if (!deletedFollow) {
            return res.status(404).json({
                success: false,
                message: "Follow not found",
            })
        }

        res.status(200).json({
            success: true,
            message: "User unfollowed successfully",
            data: {
                follow: deletedFollow,
            },
        })
    } catch (error) {
        console.error("Failed to unfollow user:", error)

        res.status(500).json({
            success: false,
            message: "Failed to unfollow user",
            error: "Internal server error",
        })
    }
}

module.exports = { getFollowers, getFollowing, followUser, unfollowUser }
