const mongoose = require("mongoose");
const ProductVariantRepository = require("../../repositories/productVariantRepository");
const CategoryRepository = require("../../../categories/repositories/categoryRepository");
const {
  assertAdminPermission,
} = require("../../../../core/authorization/checkAdminAndHisPermission");

class GetProductFilterOptionsUseCase {
  constructor() {
    this.variantRepo = new ProductVariantRepository();
    this.categoryRepo = new CategoryRepository();
  }

  async execute(loggedInUser, filter = {}) {
    if (loggedInUser?.role === "admin") {
      await assertAdminPermission(loggedInUser, "products.list");
    }

    const categoryMatch = {};
    if (!loggedInUser || loggedInUser.role !== "admin") {
      categoryMatch.published = true;
      categoryMatch.isDeleted = false;
    } else {
      if (filter.published !== undefined) categoryMatch.published = filter.published;
      if (filter.isDeleted !== undefined) categoryMatch.isDeleted = filter.isDeleted;
    }

    const categoriesQuery = await this.categoryRepo.find(categoryMatch);
    const categoriesList = categoriesQuery.map(c => ({
      _id: c._id,
      name: c.name,
      slug: c.slug
    }));

    const variantMatch = {};

    if (!loggedInUser || loggedInUser.role !== "admin") {
      variantMatch.published = true;
      variantMatch.isDeleted = false;
    } else {
      if (filter.published !== undefined)
        variantMatch.published = filter.published;
      if (filter.isDeleted !== undefined)
        variantMatch.isDeleted = filter.isDeleted;
    }

    const productMatch = {};

    if (filter.category) {
      let categoryArr;
      if (typeof filter.category === "string") {
        categoryArr = filter.category.split(",");
      } else if (Array.isArray(filter.category)) {
        categoryArr = filter.category;
      }

      if (categoryArr && categoryArr.length > 0) {
        const categoryIds = categoryArr.map(cat => {
          return mongoose.Types.ObjectId.isValid(cat) ? new mongoose.Types.ObjectId(cat) : cat;
        });
        productMatch["product.category"] = { $in: categoryIds };
      }
    }

    if (!loggedInUser || loggedInUser.role !== "admin") {
      productMatch["product.published"] = true;
      productMatch["product.isDeleted"] = false;
    } else {
      if (filter.productPublished !== undefined)
        productMatch["product.published"] = filter.productPublished;
      if (filter.productIsDeleted !== undefined)
        productMatch["product.isDeleted"] = filter.productIsDeleted;
    }

    let { attributes, priceRange } =
      await this.variantRepo.getAvailableFilterOptions(
        variantMatch,
        productMatch,
      );

    if (!filter.category) {
      attributes = [];
    }

    const sortOptions = [
      { key: "newest", label: { en: "Newest", ar: "الأحدث" } },
      { key: "oldest", label: { en: "Oldest", ar: "الأقدم" } },
      {
        key: "price_asc",
        label: { en: "Price: Low → High", ar: "السعر: الأقل أولاً" },
      },
      {
        key: "price_desc",
        label: { en: "Price: High → Low", ar: "السعر: الأعلى أولاً" },
      },
    ];

    return {
      categories: categoriesList,
      attributes,
      priceRange,
      sortOptions,
    };
  }
}

module.exports = GetProductFilterOptionsUseCase;
