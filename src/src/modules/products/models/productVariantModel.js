const mongoose = require("mongoose");

const productVariantSchema = mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },

  image: {
    fileName: {
      type: String,
    },
    size: Number,
  },

  attributes: [
    {
      attribute: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Attribute",
        required: true,
      },
      nameSnapshot: {
        en: String,
        ar: String,
      },
      value: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
      },
    },
  ],

  price: {
    originalPrice: {
      type: Number,
      required: true,
    },
    salePrice: {
      type: Number,
      required: true,
    },
    finalPrice: {
      type: Number,
      required: true,
    },
  },

  stock: {
    type: Number,
    required: true,
  },

  sku: {
    type: String,
    unique: true,
  },

  published: {
    type: Boolean,
    default: false,
  },

  isDeleted: {
    type: Boolean,
    default: false,
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("ProductVariant", productVariantSchema);
