const OrderReview = require("../model/orderReviewModel");

const REVIEW_POPULATE = [
  { path: "user", select: "name email" },
  { path: "product", select: "name images" },
];

class ReviewRepository {
  async create(data) {
    return await OrderReview.create(data);
  }

  async findOne(filter) {
    return await OrderReview.findOne(filter).populate(REVIEW_POPULATE);
  }

  async find(filter = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      OrderReview.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate(REVIEW_POPULATE),
      OrderReview.countDocuments(filter),
    ]);
    return { reviews, total };
  }

  async save(review) {
    return await review.save();
  }

  async deleteOne(filter) {
    return await OrderReview.findOneAndDelete(filter).populate(REVIEW_POPULATE);
  }
}

module.exports = ReviewRepository;
