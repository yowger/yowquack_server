const express = require("express")
const router = express.Router()
const { getNotifications } = require("./notification.controller")

router.get("/", getNotifications)
router.patch("/:id", () => {})
router.delete("/:id", () => {})

module.exports = router
