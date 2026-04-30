const ShippingMethod = require("../model/shippingMethodsModel");

class ShippingMethodRepository {
  async create(data) {
    return await ShippingMethod.create(data);
  }

  async findOne(filter, options = {}) {
    let query = ShippingMethod.findOne(filter);

    if (options.collation) {
      query = query.collation(options.collation);
    }

    if (options.populateCreatedBy) {
      query = query.populate("createdBy", "name email profileImage");
    }

    return await query;
  }

  async find(filter, sort, page, limit, options = {}) {
    let query = ShippingMethod.find(filter).sort(sort);

    if (options.populateCreatedBy) {
      query = query.populate("createdBy", "name email");
    }

    return await query.skip((page - 1) * limit).limit(limit);
  }

  async countDocuments(filter) {
    return await ShippingMethod.countDocuments(filter);
  }

  async updateOne(filter, updates) {
    return await ShippingMethod.findOneAndUpdate(filter, updates, {
      new: true,
      runValidators: true,
    });
  }

  async deleteOne(filter) {
    return await ShippingMethod.findOneAndDelete(filter);
  }
}

module.exports = ShippingMethodRepository;
