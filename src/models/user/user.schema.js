const mongoose = require("mongoose")
const bcrypt = require("bcrypt")

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            default: null,
            min: 2,
            max: 30,
        },
        email: {
            type: String,
            unique: true,
            index: true,
            trim: true,
            lowercase: true,
            required: true,
        },
        password: {
            type: String,
            trim: true,
            min: 5,
            max: 20,
        },
        bio: {
            type: String,
            default: "",
        },
        roles: {
            type: [String],
            default: ["USER"],
        },
        provider: {
            name: {
                type: String,
                enum: ["google", "facebook", "twitter", "regular"],
                default: "regular",
            },
            id: {
                type: String,
                unique: true,
                sparse: true,
            },
        },
        avatar: {
            publicId: {
                type: String,
                default: null,
            },
            url: {
                type: String,
                default: null,
            },
        },
        verified: {
            type: Boolean,
            default: false,
        },
        resetPasswordToken: {
            type: String,
            default: null,
        },
        resetPasswordExpiry: {
            type: Date,
            default: null,
        },
        lastResetPasswordTimestamp: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
)

userSchema.index({ email: 1, "provider.name": 1 }, { unique: true })

userSchema.pre("save", async function (next) {
    try {
        const user = this

        const providerNotRegular =
            user.provider && user.provider.name !== "regular"

        const passwordAlreadyModified = !user.isModified("password")

        if (providerNotRegular || passwordAlreadyModified) {
            next()
        }

        const rounds = 10
        const hashedPassword = await bcrypt.hash(user.password, rounds)
        user.password = hashedPassword

        next()
    } catch (error) {
        return next(error)
    }
})

userSchema.methods.matchPassword = async function (password) {
    try {
        const user = this
        const comparedPassword = await bcrypt.compare(password, user.password)

        return comparedPassword
    } catch (error) {
        throw new Error(error)
    }
}

const User = mongoose.model("User", userSchema)

module.exports = User
