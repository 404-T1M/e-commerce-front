const mongoose = require("mongoose");

const categorySchema = mongoose.Schema(
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

    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
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

    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },

    attributes: [
      {
        attribute: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Attribute",
          required: true,
        },
        required: {
          type: Boolean,
          default: false,
        },
      },
    ],

    published: {
      type: Boolean,
      default: false,
    },

    image: {
      fileName: {
        type: String,
        required: true,
      },
      size: Number,
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

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

categorySchema.virtual("productsCount", {
  ref: "Product",
  localField: "_id",
  foreignField: "category",
  count: true,
});

categorySchema.index({ slug: 1 }, { unique: true });
categorySchema.index({ parent: 1 });
categorySchema.index({ published: 1 });

module.exports = mongoose.model("Category", categorySchema);
