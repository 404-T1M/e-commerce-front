const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: validator.isEmail,
        message: "Invalid email format",
      },
    },

    mobilePhone: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    profileImage: {
      fileName: {
        type: String,
        default: "default-avatar_edu8jh",
      },
      size: Number,
    },

    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },

    adminGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminGroup",
      required: function () {
        return this.role === "admin";
      },
    },

    googleId: {
      type: String,
      default: null,
    },

    status: {
      type: Boolean,
      default: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    tokenVersion: {
      type: Number,
      default: 0,
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    verificationCode: {
      type: String,
      default: null,
      select: false,
    },

    verificationCodeExpire: {
      type: Date,
    },

    resetPasswordToken: { type: String },

    resetPasswordExpires: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

userSchema.index({ name: 1 });

module.exports = mongoose.model("User", userSchema);
