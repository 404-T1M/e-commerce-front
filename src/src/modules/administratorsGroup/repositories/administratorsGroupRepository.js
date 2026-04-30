const AdminGroup = require("../models/adminModel");

class adminRepository {
  _buildQuery(filters) {
    const query = {};
    if (filters.name) {
      query.name = { $regex: filters.name, $options: "i" };
    }
    return query;
  }
  async find(filters = {}) {
    const query = this._buildQuery(filters);
    const mQuery = AdminGroup.find(query);

    if (filters.sort) mQuery.sort(filters.sort);
    else mQuery.sort({ createdAt: -1 });

    if (filters.page && filters.limit) {
      mQuery.skip((filters.page - 1) * filters.limit).limit(filters.limit);
    }
    return await mQuery;
  }

  async count(filters = {}) {
    const query = this._buildQuery(filters);
    return await AdminGroup.countDocuments(query);
  }

  async findOne(filter) {
    let query = AdminGroup.findOne(filter);
    return await query;
  }

  async save(adminGroup) {
    return await AdminGroup.create(adminGroup);
  }

  async updateOne(filter, updates) {
    return await AdminGroup.findOneAndUpdate(filter, updates, {
      new: true,
      runValidators: true,
    });
  }

  async deleteOne(filter) {
    return await AdminGroup.findOneAndDelete(filter);
  }
}

module.exports = adminRepository;
