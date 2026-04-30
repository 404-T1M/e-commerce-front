const AppError = require("../../../core/errors/appError");
const ReviewRepository = require("../repositories/reviewRepository");
const { syncProductRating } = require("../../../shared/services/ratingService");
const {
  assertAdminPermission,
} = require("../../../core/authorization/checkAdminAndHisPermission");

class AdminUpdateReviewStatusUseCase {
  constructor() {
    this.reviewRepository = new ReviewRepository();
  }

  async execute(adminUser, reviewId, published) {
    await assertAdminPermission(adminUser, "orderReviews.update");

    const review = await this.reviewRepository.findOne({ _id: reviewId });

    if (!review) {
      throw new AppError("Review not found", 404);
    }

    review.published = published;
    const saved = await this.reviewRepository.save(review);

    await syncProductRating(review.product);

    return saved;
  }
}

module.exports = AdminUpdateReviewStatusUseCase;
