const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
    },

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
        },

        productName: {
          en: String,
          ar: String,
        },

        image: {
          fileName: String,
          size: Number,
        },

        attributes: [
          {
            attribute: String,
            value: String,
          },
        ],

        price: Number,
        quantity: Number,
        total: Number,
      },
    ],

    pricing: {
      subtotal: Number,
      discount: Number,
      shipping: Number,
      total: Number,
    },

    coupon: {
      code: String,
      discountType: String,
      discountValue: Number,
    },

    address: {
      country: String,
      governorate: String,
      city: String,
      postalCode: String,
      address: String,
      recipientName: String,
      recipientMobilePhone: String,
    },

    shippingMethod: {
      id: mongoose.Schema.Types.ObjectId,
      name: String,
      price: Number,
    },

    paymentMethod: {
      key: { type: String },
      name: { type: String },
    },

    walletTransactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WalletTransaction",
    },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
  },
  { timestamps: true },
);

orderSchema.pre("save", function () {
  if (!this.orderNumber) {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.floor(Math.random() * 9000 + 1000);
    this.orderNumber = `ORD-${ts}-${rand}`;
  }
});

module.exports = mongoose.model("Order", orderSchema);
