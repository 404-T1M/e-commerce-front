const AppError = require("../../../core/errors/appError");
const ReviewRepository = require("../repositories/reviewRepository");
const { syncProductRating } = require("../../../shared/services/ratingService");

class DeleteReviewUseCase {
  constructor() {
    this.reviewRepository = new ReviewRepository();
  }

  async execute(userId, reviewId) {
    const review = await this.reviewRepository.findOne({ _id: reviewId });

    if (!review) {
      throw new AppError("Review not found", 404);
    }

    if (review.user._id.toString() !== userId.toString()) {
      throw new AppError("You are not allowed to delete this review", 403);
    }

    const productId = review.product;
    const wasPublished = review.published;

    await this.reviewRepository.deleteOne({ _id: reviewId });

    if (wasPublished) {
      await syncProductRating(productId);
    }
  }
}

module.exports = DeleteReviewUseCase;
