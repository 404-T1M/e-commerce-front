const Category = require("../models/categoryModel");

class categoryRepository {
  async findChildrenIds(parentId) {
    const children = await Category.find({ parent: parentId }, { _id: 1 });

    let ids = children.map((c) => c._id);

    for (const child of children) {
      const subChildrenIds = await this.findChildrenIds(child._id);
      ids = ids.concat(subChildrenIds);
    }

    return ids;
  }

  async find(
    filters,
    paginationOrProjection = {},
    sort = { createdAt: -1 },
    options = {},
  ) {
    // We support 2 styles in the 2nd param:
    // 1) pagination: { page, limit }
    // 2) projection: { _id: 1, name: 1 }
    const isPagination =
      paginationOrProjection &&
      (paginationOrProjection.page !== undefined ||
        paginationOrProjection.limit !== undefined);

    let query;

    if (isPagination) {
      const page = Number(paginationOrProjection.page) || 1;
      const limit = Number(paginationOrProjection.limit) || 10;

      query = Category.find(filters)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit);
    } else {
      const projection =
        paginationOrProjection && Object.keys(paginationOrProjection).length > 0
          ? paginationOrProjection
          : null;

      query = projection
        ? Category.find(filters, projection).sort(sort)
        : Category.find(filters).sort(sort);
    }

    if (options.populateParent) {
      query = query.populate("parent", "name slug");
    }

    if (options.populateCreatedBy) {
      query = query.populate("createdBy", "name email");
    }

    if (options.populateAttributes) {
      query = query.populate("attributes.attribute", "_id name type");
    }

    return query;
  }

  async count(filters) {
    return Category.countDocuments(filters);
  }

  async findOne(filter) {
    let query = Category.findOne(filter);
    return await query;
  }

  async create(category) {
    return await Category.create(category);
  }

  async updateOne(filter, updates) {
    return await Category.findOneAndUpdate(filter, updates, {
      new: true,
      runValidators: true,
    });
  }

  async updateMany(filter, update) {
    return await Category.updateMany(filter, update, {
      new: true,
      runValidators: true,
    });
  }

  async deleteOne(filter) {
    return await Category.findOneAndDelete(filter);
  }
}

module.exports = categoryRepository;
