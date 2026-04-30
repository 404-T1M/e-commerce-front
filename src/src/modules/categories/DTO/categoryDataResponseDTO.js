const { buildImageUrl } = require("../../../shared/utils/imageUrlBuilder");
class categoryDataResponseDTO {
  constructor(category) {
    this.id = category._id;
    this.name = category.name;
    this.slug = category.slug;
    this.description = category.description;
    this.parent = category.parent;
    this.published = category.published;
    this.image = category.image
      ? {
        fileName: category.image.fileName,
        imageSize: category.image.size,
        imageUrl: buildImageUrl(category.image.fileName, {
          crop: "fill",
          quality: "auto",
          fetch_format: "auto",
        }),
      }
      : null;
    this.isFeatured = category.isFeatured;
    this.createdBy = category.createdBy;
    this.createdAt = category.createdAt;
    this.attributes = (category.attributes || []).map((a) => ({
      attribute: a.attribute,
      required: a.required,
    }));
  }
}

module.exports = categoryDataResponseDTO;
