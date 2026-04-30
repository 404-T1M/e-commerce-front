const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema(
  {
    title: {
      en: { type: String, required: true },
      ar: { type: String, required: true },
    },

    description: {
      en: { type: String, required: true },
      ar: { type: String, required: true },
    },

    type: {
      type: String,
      enum: [
        "hero_banner",
        "slider",
        "categories",
        "customCategoriesSection",
        "customProductsSection",
        "mostSellingProducts",
        "productsWithOffers",
        "newArrivals",
        "topRatedProducts",
        "forYouRecommendations",
        "similarProducts",
      ],
      required: true,
    },

    data: {
      bannerIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Banner" }],
      categoryIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
      productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    },

    order: {
      type: Number,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    limit: {
      type: Number,
      default: 10,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Section", sectionSchema);
