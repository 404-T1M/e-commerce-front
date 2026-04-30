const { buildImageUrl } = require("../../../shared/utils/imageUrlBuilder");
class ProductVariantResponseDTO {
  constructor(variant) {
    this.id = variant._id;
    this.product = variant.product;
    this.image = variant.image
      ? {
          fileName: variant.image.fileName,
          imageSize: variant.image.size,
          imageUrl: buildImageUrl(variant.image.fileName, {
            crop: "fill",
            quality: "auto",
            fetch_format: "auto",
          }),
        }
      : null;
    this.attributes = variant.attributes;
    this.price = variant.price;
    this.published = variant.published;
    this.sku = variant.sku;
    this.stock = variant.stock;
    this.createdBy = variant.createdBy;
    this.updatedBy = variant.updatedBy;
    this.createdAt = variant.createdAt;
  }
}

module.exports = ProductVariantResponseDTO;
