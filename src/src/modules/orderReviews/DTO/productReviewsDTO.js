const ReviewResponseDTO = require("./reviewResponseDTO");

class ProductReviewsDTO {
  constructor(reviews, canReview, hasReviewed, userReview, pagination) {
    this.canReview = canReview;
    this.hasReviewed = hasReviewed;
    this.userReview = userReview ? new ReviewResponseDTO(userReview) : null;
    this.reviews = reviews.map((r) => new ReviewResponseDTO(r));
    this.pagination = pagination;
  }
}

module.exports = ProductReviewsDTO;
