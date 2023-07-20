const express = require("express")
const router = express.Router()
const {
    // httpGetAllUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    uploadAvatar,
} = require("./user.controller")

const validate = require("../../../middleware/validate/validate.middleware")
const mongoIdSchema = require("../../../schemas/common/mongoId.schema")
const createUserSchema = require("../../../schemas/user/createUser.schema")
const updateUserSchema = require("../../../schemas/user/updateUser.schema")

const { upload } = require("../../../middleware/multer/multer.middleware")
const {
    handleUploadError,
} = require("../../../middleware/multer/handleUploadError.middleware")
const compressImage = require("../../../middleware/sharp/compressImage.middleware")

// get all user
router.get("/", () => {})
router.get("/:id", validate(mongoIdSchema, { source: "params" }), getUser)
router.post("/", validate(createUserSchema), createUser)
router.post(
    "/avatar",
    upload.single("file"),
    handleUploadError,
    compressImage(),
    uploadAvatar
)
router.put(
    "/:id",
    validate(mongoIdSchema, { source: "params" }),
    validate(updateUserSchema),
    updateUser
)
router.delete("/:id", validate(mongoIdSchema, { source: "params" }), deleteUser)

module.exports = router
