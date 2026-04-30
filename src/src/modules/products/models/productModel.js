const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    name: {
      en: {
        type: String,
        required: true,
      },
      ar: {
        type: String,
        required: true,
      },
    },

    description: {
      en: {
        type: String,
        required: true,
      },
      ar: {
        type: String,
        required: true,
      },
    },

    images: {
      type: [
        {
          fileName: {
            type: String,
            required: true,
          },
          size: {
            type: Number,
            required: true,
          },
        },
      ],
      validate: {
        validator: function (value) {
          return Array.isArray(value) && value.length > 0;
        },
        message: "Product must have at least one image",
      },
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    discountPrice: {
      discountType: {
        type: String,
        default: null,
        enum: ["percentage", "fixed"],
      },
      discountValue: {
        type: Number,
        default: 0,
      },
      active: {
        type: Boolean,
        default: false,
      },
      from: {
        type: Date,
        default: null,
      },
      to: {
        type: Date,
        default: null,
      },
    },

    published: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    soldCount: {
      type: Number,
      default: 0,
    },

    rating: {
      avg: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);

productSchema.index({ "discountPrice.active": 1, "discountPrice.to": 1 });
productSchema.index({ "discountPrice.active": 1, "discountPrice.from": 1 });

module.exports = mongoose.model("Product", productSchema);
