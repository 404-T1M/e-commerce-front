const mongoose = require("mongoose");

const paymentMethodSchema = new mongoose.Schema(
  {
    name: {
      en: {
        type: String,
        required: true,
        trim: true,
      },
      ar: {
        type: String,
        required: true,
        trim: true,
      },
    },

    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      enum: {
        values: ["cod", "wallet"],
        message: "Invalid key. Supported keys are: cod, wallet",
      },
    },

    description: {
      en: {
        type: String,
        trim: true,
      },
      ar: {
        type: String,
        trim: true,
      },
    },

    image: {
      fileName: { type: String },
      size: { type: Number },
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
  },
  { timestamps: true },
);

module.exports = mongoose.model("PaymentMethod", paymentMethodSchema);
