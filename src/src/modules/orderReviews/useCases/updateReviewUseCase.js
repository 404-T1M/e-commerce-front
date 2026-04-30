const AppError = require("../../../core/errors/appError");
const ReviewRepository = require("../repositories/reviewRepository");
const { syncProductRating } = require("../../../shared/services/ratingService");

class UpdateReviewUseCase {
  constructor() {
    this.reviewRepository = new ReviewRepository();
  }

  async execute(userId, reviewId, { rating, comment }) {
    const review = await this.reviewRepository.findOne({ _id: reviewId });

    if (!review) {
      throw new AppError("Review not found", 404);
    }

    if (review.user._id.toString() !== userId.toString()) {
      throw new AppError("You are not allowed to edit this review", 403);
    }

    const wasPublished = review.published;

    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;

    review.published = false;

    const saved = await this.reviewRepository.save(review);

    if (wasPublished) {
      await syncProductRating(review.product);
    }

    return saved;
  }
}

module.exports = UpdateReviewUseCase;
