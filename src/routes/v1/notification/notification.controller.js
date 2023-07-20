const Notification = require("../../../models/notification/notification.schema")

async function getNotifications(req, res) {
    try {
        // const userId = req.user._id
        // const userId = "64a72fd1a18010688da835cf"
        const userId = "64a605a7791001feb7f25ac8"

        const notifications = await Notification.find({ recipient: userId })
            .sort({ createdAt: -1 })
            .select("_id recipient sender type content isRead createdAt")
            .lean()

        res.status(200).json({
            success: true,
            message: "Notifications retrieved successfully",
            data: {
                notifications,
            },
        })
    } catch (error) {
        console.error("Failed to retrieve notifications:", error)

        res.status(500).json({
            success: false,
            message: "Failed to retrieve notifications",
            error: "Internal server error",
        })
    }
}

module.exports = { getNotifications }
