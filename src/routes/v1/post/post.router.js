const express = require("express")
const router = express.Router()
const {
    getPosts,
    getPost,
    createPost,
    updatePost,
    deletePost,
} = require("./post.controller")

const validate = require("../../../middleware/validate/validate.middleware")
const mongoIdSchema = require("../../../schemas/common/mongoId.schema")
const optionalMongoId = require("../../../schemas/common/optionalMongoId.schema")
const createPostSchema = require("../../../schemas/post/createPost.schema")
const updatePostSchema = require("../../../schemas/post/updatePost.schema")

router.get(
    "/user/:id?",
    validate(optionalMongoId, { source: "params" }),
    getPosts
)
router.get("/:id", validate(mongoIdSchema, { source: "params" }), getPost)
router.post(
    "/:id?",
    validate(optionalMongoId, { source: "params" }),
    validate(createPostSchema),
    createPost
)
router.put(
    "/:id",
    validate(mongoIdSchema, { source: "params" }),
    validate(updatePostSchema),
    updatePost
)
router.delete("/:id", validate(mongoIdSchema, { source: "params" }), deletePost)

module.exports = router
