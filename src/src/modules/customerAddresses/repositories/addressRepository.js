const Address = require("../models/customerAddressesModel");

class AddressRepository {
  async findOne(filter, options = {}) {
    let query = Address.findOne(filter);

    if (options.populateUser) {
      query = query.populate("user", "name email mobilePhone profileImage");
    }
    return await query;
  }

  async create(address) {
    return await Address.create(address);
  }

  async find(filter, sort, page, limit, options = {}) {
    let query = Address.find(filter).sort(sort);

    if (options.populateUsers) {
      query.populate("user", "name email mobilePhone profileImage");
    }

    return await query.skip((page - 1) * limit).limit(limit);
  }

  async count(filter) {
    return Address.countDocuments(filter);
  }

  async updateOne(filter, updates) {
    return await Address.findOneAndUpdate(filter, updates, {
      new: true,
      runValidators: true,
    });
  }

  async deleteOne(filter) {
    return Address.findOneAndDelete(filter);
  }

  async updateMany(filter, updates) {
    return await Address.updateMany(filter, updates, {
      new: true,
      runValidators: true,
    });
  }
}

module.exports = AddressRepository;
