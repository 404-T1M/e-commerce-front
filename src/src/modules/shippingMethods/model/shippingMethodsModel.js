const mongoose = require("mongoose");

const shippingMethodSchema = new mongoose.Schema(
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

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    estimatedDeliveryDays: {
      type: Number,
      min: 0,
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

shippingMethodSchema.index(
  { "name.en": 1 },
  { unique: true, collation: { locale: "en", strength: 2 } },
);
shippingMethodSchema.index(
  { "name.ar": 1 },
  { unique: true, collation: { locale: "ar", strength: 2 } },
);

module.exports = mongoose.model("ShippingMethod", shippingMethodSchema);
