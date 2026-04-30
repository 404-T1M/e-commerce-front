const mongoose = require("mongoose");

const cartSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [
      {
        variant: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ProductVariant",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        priceSnapshot: {
          type: Number,
          required: true,
        },
      },
    ],

    coupon: {
      code: { type: String, trim: true, uppercase: true },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Cart", cartSchema);
