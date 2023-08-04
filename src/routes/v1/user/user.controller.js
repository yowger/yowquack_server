const mongoose = require("mongoose")
const User = require("../../../models/user/user.schema")
const Follow = require("../../../models/follow/follow.schema")
const cloudinary = require("../../../config/cloudinary/cloudinary.config")
const {
    imageBufferToDataUrl,
} = require("../../../helpers/dataUri/dataUri.helper.js")

async function getUserQuery(req, res) {
    try {
        const { id: userId } = req.params

        const user = await User.findOne({ _id: userId })
            .select(
                "_id name email profileImage.url bio verified createdAt updatedAt"
            )
            .lean()

        // make reuseable code in follow model later

        const followersCount = await Follow.countDocuments({
            following: userId,
        })

        const followingCount = await Follow.countDocuments({ follower: userId })

        const followers = await Follow.find({ following: userId })
            .select("_id follower createdAt")
            .limit(6)
            .populate("follower", "_id name profileImage.url")
            .lean()

        const following = await Follow.find({ follower: userId })
            .select("_id following createdAt")
            .limit(6)
            .populate("following", "_id name profileImage.url")
            .lean()

        user.followers = followers
        user.following = following
        user.followersCount = followersCount
        user.followingCount = followingCount

        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found", data: null })
        }

        res.status(200).json({
            success: true,
            message: "User retrieved successfully",
            data: {
                user,
            },
        })
    } catch (error) {
        console.error("Failed to retrieve user: ", error)

        res.status(500).json({
            success: false,
            message: "Failed to retrieve user",
            error: "Internal server error",
        })
    }
}

async function getUser(req, res) {
    try {
        const { id: userId } = req.params

        const user = await User.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(userId) } },
            {
                $lookup: {
                    from: "follows",
                    let: { userId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$following", "$$userId"] },
                            },
                        },
                        { $limit: 6 },
                        {
                            $lookup: {
                                from: "users",
                                localField: "follower",
                                foreignField: "_id",
                                as: "follower",
                            },
                        },
                        { $unwind: "$follower" },
                        {
                            $project: {
                                _id: 1,
                                createdAt: 1,
                                follower: {
                                    _id: "$follower._id",
                                    name: "$follower.name",
                                    "avatar.url": "$follower.avatar.url",
                                },
                            },
                        },
                        {
                            $group: {
                                _id: null,
                                totalFollowers: { $sum: 1 },
                                followers: { $push: "$$ROOT" },
                            },
                        },
                    ],
                    as: "followers",
                },
            },
            {
                $lookup: {
                    from: "follows",
                    let: { userId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$follower", "$$userId"] },
                            },
                        },
                        { $limit: 6 },
                        {
                            $lookup: {
                                from: "users",
                                localField: "following",
                                foreignField: "_id",
                                as: "following",
                            },
                        },
                        { $unwind: "$following" },
                        {
                            $project: {
                                _id: 1,
                                createdAt: 1,
                                following: {
                                    _id: "$following._id",
                                    name: "$following.name",
                                    "avatar.url": "$following.avatar.url",
                                },
                            },
                        },
                        {
                            $group: {
                                _id: null,
                                totalFollowing: { $sum: 1 },
                                following: { $push: "$$ROOT" },
                            },
                        },
                    ],
                    as: "following",
                },
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    email: 1,
                    "avatar.url": 1,
                    bio: 1,
                    verified: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    followers: 1,
                    following: 1,
                },
            },
        ])

        if (user.length === 0) {
            return res
                .status(404)
                .json({ success: false, message: "User not found", data: null })
        }

        res.status(200).json({
            success: true,
            message: "User retrieved successfully",
            data: {
                user: user[0],
            },
        })
    } catch (error) {
        console.error("Failed to retrieve user: ", error)

        res.status(500).json({
            success: false,
            message: "Failed to retrieve user",
            error: "Internal server error",
        })
    }
}

async function createUser(req, res) {
    try {
        const { name, email, password } = req.body

        const existingUser = await User.findOne({
            email,
            "provider.name": "regular",
        })
            .select("email")
            .lean()

        if (existingUser) {
            const { email } = existingUser

            return res.status(409).send({
                success: false,
                message: `The email ${email} is already in used`,
            })
        }

        const newUser = new User({
            name,
            email,
            password,
        })

        const createdUser = await newUser.save()

        if (!createdUser) {
            return res
                .status(404)
                .json({ success: false, message: "Failed to create user." })
        }

        res.status(201).json({
            success: true,
            message: "Registration successful",
            data: {
                user: {
                    id: createdUser._id,
                    name: createdUser.name,
                    email: createdUser.email,
                    provider: createdUser.provider,
                    createdAt: createdUser.createdAt,
                    updatedAt: createdUser.updatedAt,
                },
            },
        })
    } catch (error) {
        console.error("Failed to register user: ", error)

        return res.status(500).json({
            success: false,
            message: "Failed to register user",
            error: "Internal server error",
        })
    }
}

async function updateUser(req, res) {
    try {
        const { id: userId } = req.params
        const { name, email, bio } = req.body

        if (email) {
            const existingUser = await User.findOne({ email })
                .select("email")
                .lean()

            if (existingUser && existingUser._id.toString() !== userId) {
                return res.status(409).send({
                    success: false,
                    message: `The email ${email} is already in used`,
                })
            }
        }

        const updatedFields = {}

        if (name) {
            updatedFields.name = name
        }

        if (email) {
            updatedFields.email = email
        }

        if (bio) {
            updatedFields.bio = bio
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updatedFields,
            {
                new: true,
            }
        )
            .select("name email bio createdAt updatedAt")
            .lean()

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            })
        }

        res.status(200).json({
            success: true,
            message: "User updated successfully.",
            data: {
                user: updatedUser,
            },
        })
    } catch (error) {
        console.error("failed to update user: ", error)

        return res.status(500).json({
            success: false,
            message: "Failed to update user",
            error: "Internal server error",
        })
    }
}

async function deleteUser(req, res) {
    try {
        const { id: userId } = req.params

        const deletedUser = await User.findByIdAndDelete(userId, {
            projection: {
                name: 1,
                email: 1,
                bio: 1,
                createdAt: 1,
                updatedAt: 1,
            },
        })

        if (!deletedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            })
        }

        res.status(200).json({
            success: true,
            message: "User deleted successfully",
            data: {
                user: deletedUser,
            },
        })
    } catch (error) {
        console.error("Failed to delete user ", error)

        return res.status(500).json({
            success: false,
            message: "Failed to delete user",
            error: "Internal server error",
        })
    }
}

async function uploadAvatar(req, res) {
    try {
        console.log("uploading picture")
        // const { id: userId } = req.user
        // const userId = "64c78606f59a5866610ae1df"
        // joy
        const userId = "64cd0720c774731edee9b12c"
        const user = await User.findOne({ _id: userId }).select("_id avatar")

        const image = req.file
        const imageDataUrl = imageBufferToDataUrl(image.buffer)

        const userAvatarExist = user.avatar.publicId && user.avatar.url
        let options = { unique_filename: true, overwrite: true }

        if (userAvatarExist) {
            options.public_id = user.avatar.publicId

            const result = await cloudinary.uploader.upload(
                imageDataUrl,
                options
            )

            user.avatar.url = result.secure_url
        } else {
            options.folder = `yow_quack/users/${user._id}/avatar`

            const result = await cloudinary.uploader.upload(
                imageDataUrl,
                options
            )

            user.avatar.publicId = result.public_id
            user.avatar.url = result.secure_url
        }

        const updatedUser = await user.save()

        res.status(200).json({
            success: true,
            message: "Profile image updated successfully",
            data: updatedUser,
        })
    } catch (error) {
        console.log("error uploading file: ", error)
        res.status(500).json({ error: "failed to upload profile image" })
    }
}

module.exports = {
    getUser,
    createUser,
    updateUser,
    deleteUser,
    uploadAvatar,
}
