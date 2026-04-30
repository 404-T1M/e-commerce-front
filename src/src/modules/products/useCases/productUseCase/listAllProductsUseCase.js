const mongoose = require("mongoose");
const ProductRepository = require("../../repositories/productRepository");
const productResponseDTO = require("../../DTO/productResponseDTO");
const {
  assertAdminPermission,
} = require("../../../../core/authorization/checkAdminAndHisPermission");

class ListAllProductsUseCase {
  constructor() {
    this.productRepo = new ProductRepository();
  }

  async execute(loggedInUser, filter) {
    if (loggedInUser?.role === "admin") {
      await assertAdminPermission(loggedInUser, "products.list");
    }

    const query = {};

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
        query.category = { $in: categoryIds };
      }
    }

    if (!loggedInUser || loggedInUser.role !== "admin") {
      query.published = true;
      query.isDeleted = false;
    } else {
      if (filter.published !== undefined && filter.published !== "") {
        query.published =
          filter.published === "true" || filter.published === true;
      }
      if (filter.isDeleted !== undefined && filter.isDeleted !== "") {
        query.isDeleted =
          filter.isDeleted === "true" || filter.isDeleted === true;
      }
    }

    if (filter.name) {
      query.$or = [
        { "name.en": { $regex: filter.name, $options: "i" } },
        { "name.ar": { $regex: filter.name, $options: "i" } },
      ];
    }

    const sortMap = {
      price_asc: { minPrice: 1 },
      price_desc: { minPrice: -1 },
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
    };
    const sort = sortMap[filter.sort] || { createdAt: -1 };

    const pagination = {
      page: Number(filter.page) || 1,
      limit: Number(filter.limit) || 20,
    };

    const variantMatch = {};
    if (!loggedInUser || loggedInUser.role !== "admin") {
      variantMatch.published = true;
      variantMatch.isDeleted = false;
    } else {
      if (filter.published !== undefined && filter.published !== "") {
        variantMatch.published = filter.published === "true" || filter.published === true;
      }
      if (filter.isDeleted !== undefined && filter.isDeleted !== "") {
        variantMatch.isDeleted = filter.isDeleted === "true" || filter.isDeleted === true;
      }
    }

    if (filter.priceMin || filter.priceMax) {
      variantMatch["price.finalPrice"] = {};
      if (filter.priceMin) variantMatch["price.finalPrice"].$gte = Number(filter.priceMin);
      if (filter.priceMax) variantMatch["price.finalPrice"].$lte = Number(filter.priceMax);
    }

    if (filter.attributes) {
      let attributesArr;
      if (typeof filter.attributes === "string") {
        attributesArr = filter.attributes.split(",");
      } else if (Array.isArray(filter.attributes)) {
        attributesArr = filter.attributes;
      }

      if (attributesArr && attributesArr.length > 0) {
        variantMatch["attributes.value"] = { $in: attributesArr };
      }
    }

    const { data, total } = await this.productRepo.findWithVariants(
      query,
      variantMatch,
      pagination,
      sort,
    );

    return {
      products: data.map((item) => new productResponseDTO(item)),
      meta: {
        total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }
}

module.exports = ListAllProductsUseCase;
