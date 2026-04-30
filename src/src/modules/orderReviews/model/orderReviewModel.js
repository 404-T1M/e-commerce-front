const mongoose = require("mongoose");

const orderReviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    published: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

orderReviewSchema.index({ user: 1, product: 1 }, { unique: true });
orderReviewSchema.index({ product: 1, published: 1 });

module.exports = mongoose.model("OrderReview", orderReviewSchema);
