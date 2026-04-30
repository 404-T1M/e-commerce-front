const mongoose = require("mongoose");

const attributeSchema = new mongoose.Schema(
  {
    name: {
      en: { type: String, required: true },
      ar: { type: String, required: true },
    },

    type: {
      type: String,
      enum: ["text", "number", "select", "boolean"],
      required: true,
    },

    options: {
      type: [String],
      default: [],
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

attributeSchema.index({ "name.en": 1, type: 1 }, { unique: true });

module.exports = mongoose.model("Attribute", attributeSchema);
