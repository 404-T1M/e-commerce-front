const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },

    discountValue: {
      type: Number,
      required: true,
    },

    startsAt: Date,
    endsAt: Date,

    minOrderTotal: {
      type: Number,
      default: 0,
      min: 0,
    },

    maxDiscountAmount: {
      type: Number,
      min: 0,
    },

    applicableCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        default: [],
      },
    ],

    applicableProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        default: [],
      },
    ],

    allowedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],

    usageLimit: {
      type: Number,
      min: 0,
    },

    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    allowMultiplePerUser: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Coupon", couponSchema);
