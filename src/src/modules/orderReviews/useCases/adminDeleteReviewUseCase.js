const AppError = require("../../../core/errors/appError");
const ReviewRepository = require("../repositories/reviewRepository");
const EmailService = require("../../../shared/services/emailService");
const { syncProductRating } = require("../../../shared/services/ratingService");
const {
  assertAdminPermission,
} = require("../../../core/authorization/checkAdminAndHisPermission");
const {
  deletedReviewTemplate,
} = require("../../../shared/services/templates/deletedReviewTemplate");

class AdminDeleteReviewUseCase {
  constructor() {
    this.reviewRepository = new ReviewRepository();
    this.emailService = new EmailService();
  }

  async execute(adminUser, reviewId, reason) {
    await assertAdminPermission(adminUser, "orderReviews.delete");

    const review = await this.reviewRepository.findOne({ _id: reviewId });

    if (!review) {
      throw new AppError("Review not found", 404);
    }

    const userEmail = review.user?.email;
    const userName = review.user?.name ?? "Customer";
    const reviewComment = review.comment;
    const reviewRating = review.rating;

    await this.reviewRepository.deleteOne({ _id: reviewId });

    if (review.published) {
      await syncProductRating(review.product);
    }

    if (userEmail) {
      await this.emailService.sendEmail(
        userEmail,
        "Your review has been removed",
        deletedReviewTemplate(userName, reviewRating, reviewComment, reason),
      );
    }
  }
}

module.exports = AdminDeleteReviewUseCase;
