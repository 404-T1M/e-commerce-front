const mongoose = require("mongoose");

const walletTransactionSchema = new mongoose.Schema(
  {
    wallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["topUp", "bonus", "purchase", "refund"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },

    balanceBefore: {
      type: Number,
      required: true,
    },

    balanceAfter: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },

    paymentMethod: {
      type: String,
      enum: ["fawry", "visa", "vodafone_cash", "instapay", "admin", "wallet"],
    },

    referenceId: {
      type: String,
      trim: true,
    },

    note: {
      type: String,
      trim: true,
    },

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("WalletTransaction", walletTransactionSchema);
