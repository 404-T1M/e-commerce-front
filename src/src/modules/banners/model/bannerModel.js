const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    title: {
      en: { type: String, required: true },
      ar: { type: String, required: true },
    },

    image: {
      fileName: String,
      size: Number,
    },

    link: {
      type: String,
    },

    order: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },

  { timestamps: true },
);

module.exports = mongoose.model("Banner", bannerSchema);
