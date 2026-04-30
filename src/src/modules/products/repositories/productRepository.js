const Product = require("../models/productModel");

class ProductRepository {
  async search(term, { limit = 10 }) {
    return Product.aggregate([
      {
        $search: {
          index: "products_search",
          compound: {
            should: [
              {
                autocomplete: {
                  query: term,
                  path: "name.en",
                  fuzzy: { maxEdits: 1 },
                  score: { boost: { value: 3 } },
                },
              },
              {
                autocomplete: {
                  query: term,
                  path: "name.ar",
                  fuzzy: { maxEdits: 1 },
                  score: { boost: { value: 3 } },
                },
              },
              {
                text: {
                  query: term,
                  path: ["description.en", "description.ar"],
                  score: { boost: { value: 1 } },
                },
              },
            ],
            minimumShouldMatch: 1,
          },
        },
      },
      {
        $match: {
          published: true,
          isDeleted: false,
        },
      },
      {
        $sort: {
          score: -1,
        },
      },
      {
        $limit: limit,
      },
      {
        $project: {
          name: 1,
          price: 1,
          images: { $slice: ["$images", 1] },
          score: { $meta: "searchScore" },
        },
      },
    ]);
  }

  async find(query, pagination, sort, options = {}) {
    let mongooseQuery = Product.find(query).sort(sort);

    if (options.populateCategory) {
      mongooseQuery = mongooseQuery.populate("category", "name");
    }

    if (options.populateCreatedBy) {
      mongooseQuery = mongooseQuery.populate("createdBy", "name email");
    }

    return mongooseQuery
      .skip((pagination.page - 1) * pagination.limit)
      .limit(pagination.limit);
  }

  async count(query) {
    return Product.countDocuments(query);
  }

  async findOne(filter, options = {}) {
    let query = Product.findOne(filter);

    if (options.populateCategory) {
      query = query.populate("category", "name parent attributes");
    }

    if (options.populateCreatedBy) {
      query = query.populate("createdBy", "name email");
    }

    return await query;
  }

  async create(product) {
    return await Product.create(product);
  }

  async updateOne(filter, updates) {
    return await Product.findOneAndUpdate(filter, updates, {
      new: true,
      runValidators: true,
    });
  }

  async updateMany(filter, update) {
    return await Product.updateMany(filter, update, {
      new: true,
      runValidators: true,
    });
  }

  async findWithVariants(productMatch, variantMatch, pagination, sort) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const pipeline = [
      { $match: productMatch },
      {
        $lookup: {
          from: "productvariants",
          let: { productId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$product", "$$productId"] } } },
            { $match: variantMatch },
            { $sort: { "price.finalPrice": 1 } }
          ],
          as: "variants",
        },
      },
      {
        $match: {
          variants: { $ne: [] }
        }
      },
      {
        $addFields: {
          minPrice: {
            $ifNull: [{ $min: "$variants.price.finalPrice" }, 0],
          },
        },
      },
      { $sort: sort },
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $lookup: {
                from: "categories",
                localField: "category",
                foreignField: "_id",
                as: "category",
              },
            },
            {
              $unwind: {
                path: "$category",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "createdBy",
                foreignField: "_id",
                as: "createdBy",
              },
            },
            {
              $unwind: {
                path: "$createdBy",
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
          totalCount: [{ $count: "total" }],
        },
      },
    ];

    const [result] = await Product.aggregate(pipeline);
    return {
      data: result.data || [],
      total: result.totalCount[0]?.total ?? 0,
    };
  }
}

module.exports = ProductRepository;
