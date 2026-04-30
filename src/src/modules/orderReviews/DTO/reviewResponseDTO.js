const { buildImageUrl } = require("../../../shared/utils/imageUrlBuilder");

class ReviewResponseDTO {
  constructor(review) {
    this.id = review._id;
    this.rating = review.rating;
    this.comment = review.comment;
    this.published = review.published;
    this.user = review.user
      ? { id: review.user._id, name: review.user.name }
      : review.user;
    if (review.product && typeof review.product === "object") {
      const firstImage = review.product.images?.[0];
      this.product = {
        id: review.product._id,
        name: review.product.name,
        image: firstImage?.fileName
          ? {
              fileName: firstImage.fileName,
              imageSize: firstImage.size,
              imageUrl: buildImageUrl(firstImage.fileName, {
                crop: "fill",
                quality: "auto",
                fetch_format: "auto",
              }),
            }
          : null,
      };
    } else {
      this.product = review.product;
    }
    this.createdAt = review.createdAt;
    this.updatedAt = review.updatedAt;
  }
}

module.exports = ReviewResponseDTO;
