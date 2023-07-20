const express = require("express")
const router = express.Router()
const {
    getFollowers,
    getFollowing,
    followUser,
    unfollowUser,
} = require("./follow.controller")

const validate = require("../../../middleware/validate/validate.middleware")
const mongoIdSchema = require("../../../schemas/common/mongoId.schema")

router.get(
    "/user/:id/followers",
    validate(mongoIdSchema, { source: "params" }),
    getFollowers
)
router.get(
    "/user/:id/following",
    validate(mongoIdSchema, { source: "params" }),
    getFollowing
)
router.post("/", followUser)
router.delete(
    "/:id",
    validate(mongoIdSchema, { source: "params" }),
    unfollowUser
)

module.exports = router
