const User = require("../models/userModel");

class userRepository {
  _buildQuery(filters) {
    const query = {};

    if (filters.role) {
      query.role = filters.role;
    }

    if (filters.adminGroup) {
      query.adminGroup = filters.adminGroup;
    }

    if (filters.status !== undefined && filters.status !== "") {
      query.status = filters.status;
    }

    if (filters.name) {
      query.name = { $regex: filters.name, $options: "i" };
    }

    if (filters.emailVerified !== undefined && filters.emailVerified !== "") {
      query.emailVerified = filters.emailVerified;
    }

    if (filters.isDeleted !== undefined) {
      query.isDeleted = filters.isDeleted;
    }

    if (filters.fromDate || filters.toDate) {
      query.createdAt = {};
      if (filters.fromDate) {
        query.createdAt.$gte = new Date(filters.fromDate);
      }
      if (filters.toDate) {
        query.createdAt.$lte = new Date(filters.toDate);
      }
    }
    return query;
  }

  async find(filters) {
    const query = this._buildQuery(filters);
    const users = User.find(query);

    if (filters.sort) {
      users.sort(filters.sort);
    } else {
      users.sort({ createdAt: -1 });
    }

    if (filters.page && filters.limit) {
      users.skip((filters.page - 1) * filters.limit).limit(filters.limit);
    }
    return await users;
  }
  async findOne(filter, options = {}) {
    let query = User.findOne(filter);

    if (options.withPassword) {
      query = query.select("+password");
    }

    if (options.withVerificationCode) {
      query = query.select("+verificationCode");
    }

    if (options.withResetPasswordToken) {
      query = query.select("+resetPasswordToken");
    }

    return await query;
  }

  async findByEmail(email, options = {}) {
    return this.findOne({ email }, options);
  }

  async findByPhone(mobilePhone, options = {}) {
    return this.findOne({ mobilePhone }, options);
  }

  async create(user) {
    return await User.create(user);
  }

  async save(user) {
    return await user.save();
  }

  async updateOne(filter, updates) {
    return await User.findOneAndUpdate(filter, updates, {
      new: true,
      runValidators: true,
    });
  }

  async count(filter) {
    const query = this._buildQuery(filter);
    return User.countDocuments(query);
  }

  async deleteOne(filter) {
    return await User.findOneAndDelete(filter);
  }
}

module.exports = userRepository;
