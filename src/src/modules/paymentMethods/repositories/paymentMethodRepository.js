const PaymentMethod = require("../model/paymentMethodsModel");

class PaymentMethodRepository {
  async create(data) {
    return await PaymentMethod.create(data);
  }

  async findOne(filter, options = {}) {
    let query = PaymentMethod.findOne(filter);

    if (options.populateCreatedBy) {
      query = query.populate("createdBy", "name email");
    }

    return await query;
  }

  async find(filter, sort, page, limit, options = {}) {
    let query = PaymentMethod.find(filter).sort(sort);

    if (options.populateCreatedBy) {
      query = query.populate("createdBy", "name email");
    }

    return await query.skip((page - 1) * limit).limit(limit);
  }

  async countDocuments(filter) {
    return await PaymentMethod.countDocuments(filter);
  }

  async updateOne(filter, updates) {
    return await PaymentMethod.findOneAndUpdate(filter, updates, {
      new: true,
      runValidators: true,
    });
  }

  async deleteOne(filter) {
    return await PaymentMethod.findOneAndDelete(filter);
  }
}

module.exports = PaymentMethodRepository;
