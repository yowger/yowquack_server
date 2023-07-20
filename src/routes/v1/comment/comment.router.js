const express = require("express")
const router = express.Router()
const {
    getComments,
    createComment,
    updateComment,
    deleteComment,
} = require("./comment.controller")

const validate = require("../../../middleware/validate/validate.middleware")
const mongoIdSchema = require("../../../schemas/common/mongoId.schema")
const commentSchema = require("../../../schemas/comment/comment.schema")

router.get(
    "/post/:id",
    validate(mongoIdSchema, { source: "params" }),
    getComments
)
router.post(
    "/post/:id",
    validate(mongoIdSchema, { source: "params" }),
    validate(commentSchema),
    createComment
)
router.put(
    "/:id",
    validate(mongoIdSchema, { source: "params" }),
    validate(commentSchema),
    updateComment
)
router.delete(
    "/:id",
    validate(mongoIdSchema, { source: "params" }),
    deleteComment
)

module.exports = router
