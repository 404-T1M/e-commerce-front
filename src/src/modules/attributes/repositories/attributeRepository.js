const Attribute = require("../models/attributeModel");

class attributeRepository {
  _buildQuery(filters) {
    const query = { isDeleted: false };
    if (filters.name) {
      query.$or = [
        { "name.en": { $regex: filters.name, $options: "i" } },
        { "name.ar": { $regex: filters.name, $options: "i" } },
      ];
    }
    return query;
  }

  async find(filter) {
    const query = this._buildQuery(filter);
    const mQuery = Attribute.find(query);

    if (filter.sort) mQuery.sort(filter.sort);
    else mQuery.sort({ createdAt: -1 });

    if (filter.page && filter.limit) {
      mQuery.skip((filter.page - 1) * filter.limit).limit(filter.limit);
    }
    return await mQuery;
  }

  async count(filter) {
    const query = this._buildQuery(filter);
    return await Attribute.countDocuments(query);
  }

  async findOne(filter) {
    let query = Attribute.findOne(filter);
    return await query;
  }

  async create(category) {
    return await Attribute.create(category);
  }

  async updateOne(filter, updates) {
    return await Attribute.findOneAndUpdate(filter, updates, {
      new: true,
      runValidators: true,
    });
  }

  async deleteOne(filter) {
    return await Attribute.findOneAndDelete(filter);
  }
}

module.exports = attributeRepository;
