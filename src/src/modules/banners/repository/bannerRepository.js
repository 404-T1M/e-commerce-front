const Banner = require("../model/bannerModel");

class BannerRepository {
  async create(data) {
    return await Banner.create(data);
  }

  async findOne(filter) {
    return await Banner.findOne(filter).populate(
      "createdBy updatedBy",
      "name email",
    );
  }

  async save(banner) {
    return await banner.save();
  }

  async find(filter, page = 1, limit = 10, sort = { order: 1 }) {
    return await Banner.find(filter)
      .populate("createdBy updatedBy", "name email")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);
  }

  async count(filter) {
    return await Banner.countDocuments(filter);
  }

  async delete(filter) {
    return await Banner.deleteOne(filter);
  }
}

module.exports = BannerRepository;
