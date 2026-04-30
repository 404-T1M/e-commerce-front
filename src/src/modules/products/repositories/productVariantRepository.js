const ProductVariant = require("../models/productVariantModel");
class ProductVariantRepository {
  async find(query, pagination, sort, options = {}) {
    let mongooseQuery = ProductVariant.find(query).sort(sort);

    if (options.populateProduct) {
      mongooseQuery = mongooseQuery.populate(
        "product",
        "name discountPrice published isDeleted",
      );
    }

    if (options.populateAttributes) {
      mongooseQuery = mongooseQuery.populate(
        "attributes.attribute",
        "name type options isDeleted",
      );
    }

    if (options.populateCreatedBy) {
      mongooseQuery = mongooseQuery.populate(
        "createdBy updatedBy",
        "name email",
      );
    }

    return mongooseQuery
      .skip((pagination.page - 1) * pagination.limit)
      .limit(pagination.limit);
  }

  async count(query) {
    return ProductVariant.countDocuments(query);
  }

  async findOne(filter, options = {}) {
    let query = ProductVariant.findOne(filter);

    if (options.populateProduct) {
      query = query.populate(
        "product",
        "name discountPrice published isDeleted",
      );
    }

    if (options.populateAttributes) {
      query = query.populate(
        "attributes.attribute",
        "name type options isDeleted",
      );
    }

    if (options.populateCreatedBy) {
      query = query.populate("createdBy updatedBy", "name email");
    }

    return await query;
  }

  async create(variant) {
    return await ProductVariant.create(variant);
  }

  async updateOne(filter, updates) {
    return await ProductVariant.findOneAndUpdate(filter, updates, {
      new: true,
      runValidators: true,
    });
  }

  async decrementStock(variantId, quantity) {
    return await ProductVariant.findOneAndUpdate(
      { _id: variantId, stock: { $gte: quantity } },
      { $inc: { stock: -quantity } },
      { new: true },
    );
  }

  async incrementStock(variantId, quantity) {
    return await ProductVariant.findByIdAndUpdate(
      variantId,
      { $inc: { stock: quantity } },
      { new: true },
    );
  }

  async updateMany(filter, update) {
    return await ProductVariant.updateMany(filter, update, {
      new: true,
      runValidators: true,
    });
  }

  async findWithProduct(variantMatch, productMatch, sort, pagination) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;
    const resolvedSort = this._resolveGroupSort(sort);

    const pipeline = [
      { $match: variantMatch },

      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "product",
        },
      },

      { $unwind: "$product" },

      { $match: productMatch },

      {
        $group: {
          _id: "$product._id",
          product: { $first: "$product" },
          variants: {
            $push: {
              _id: "$_id",
              sku: "$sku",
              price: "$price",
              stock: "$stock",
              attributes: "$attributes",
              image: "$image",
              published: "$published",
              isDeleted: "$isDeleted",
              createdBy: "$createdBy",
            },
          },
          minPrice: { $min: "$price.finalPrice" },
          maxPrice: { $max: "$price.finalPrice" },
          productCreatedAt: { $first: "$product.createdAt" },
        },
      },

      { $sort: resolvedSort },

      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $lookup: {
                from: "categories",
                localField: "product.category",
                foreignField: "_id",
                as: "product.category",
              },
            },
            {
              $unwind: {
                path: "$product.category",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "product.createdBy",
                foreignField: "_id",
                as: "product.createdBy",
              },
            },
            {
              $unwind: {
                path: "$product.createdBy",
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
          totalCount: [{ $count: "total" }],
        },
      },
    ];

    const [result] = await ProductVariant.aggregate(pipeline);

    return {
      data: result.data,
      total: result.totalCount[0]?.total ?? 0,
    };
  }

  _resolveGroupSort(sort) {
    const fieldMap = {
      "price.finalPrice": "minPrice",
      "product.createdAt": "productCreatedAt",
    };

    return Object.fromEntries(
      Object.entries(sort).map(([field, dir]) => [
        fieldMap[field] ?? field,
        dir,
      ]),
    );
  }

  async getAvailableFilterOptions(variantMatch, productMatch) {
    const pipeline = [
      { $match: variantMatch },

      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },

      { $match: productMatch },

      {
        $facet: {
          attributes: [
            { $unwind: "$attributes" },
            {
              $group: {
                _id: {
                  nameEn: "$attributes.nameSnapshot.en",
                  nameAr: "$attributes.nameSnapshot.ar",
                },
                values: { $addToSet: "$attributes.value" },
                attributeId: { $first: "$attributes.attribute" },
              },
            },
            {
              $project: {
                _id: 0,
                attributeId: 1,
                name: {
                  en: "$_id.nameEn",
                  ar: "$_id.nameAr",
                },
                values: 1,
              },
            },
            { $sort: { "name.en": 1 } },
          ],

          priceRange: [
            {
              $group: {
                _id: null,
                min: { $min: "$price.finalPrice" },
                max: { $max: "$price.finalPrice" },
              },
            },
            {
              $project: { _id: 0, min: 1, max: 1 },
            },
          ],
        },
      },
    ];

    const [result] = await ProductVariant.aggregate(pipeline);

    return {
      attributes: result.attributes,
      priceRange: result.priceRange[0] ?? { min: 0, max: 0 },
    };
  }
}

module.exports = ProductVariantRepository;
