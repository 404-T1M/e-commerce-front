const mongoose = require("mongoose");

const addressesSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    country: {
      type: String,
      required: true,
    },

    governorate: {
      type: String,
    },

    postalCode: {
      type: Number,
    },

    city: {
      type: String,
    },

    notes: {
      type: String,
    },

    recipientMobilePhone: {
      type: String,
      required: true,
    },

    recipientName: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    isPrimary: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Address", addressesSchema);
