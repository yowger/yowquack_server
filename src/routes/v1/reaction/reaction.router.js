const express = require("express")
const router = express.Router()
const {
    getReactions,
    createReaction,
    deleteReaction,
    updateReaction,
} = require("./reaction.controller")

const validate = require("../../../middleware/validate/validate.middleware")
const mongoIdSchema = require("../../../schemas/common/mongoId.schema")
const reactionSchema = require("../../../schemas/reaction/reaction.schema")

router.get(
    "/post/:id",
    validate(mongoIdSchema, { source: "params" }),
    getReactions
)
router.post(
    "/post/:id",
    validate(mongoIdSchema, { source: "params" }),
    validate(reactionSchema),
    createReaction
)
router.put(
    ":id",
    validate(mongoIdSchema, { source: "params" }),
    validate(reactionSchema),
    updateReaction
)
router.delete(
    ":id",
    validate(mongoIdSchema, { source: "params" }),
    deleteReaction
)

module.exports = router
