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
const { upload } = require("../../../middleware/multer/multer.middleware")
const {
    handleUploadError,
} = require("../../../middleware/multer/handleUploadError.middleware")
const compressImage = require("../../../middleware/sharp/compressImage.middleware")

const compressOptions = {
    width: 540,
    quality: 80,
}

router.get(
    "/user/:id?",
    validate(optionalMongoId, { source: "params" }),
    getPosts
)
router.get("/:id", validate(mongoIdSchema, { source: "params" }), getPost)
router.post(
    "/:id?",
    validate(optionalMongoId, { source: "params" }),
    // validate(createPostSchema),
    upload.single("file"),
    handleUploadError({ allowEmptyImage: true }),
    compressImage(compressOptions),
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
