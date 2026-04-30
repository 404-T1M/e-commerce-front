const { buildImageUrl } = require("../../../shared/utils/imageUrlBuilder");

class BannerResponseDTO {
  constructor(banner) {
    this.id = banner._id;
    this.title = banner.title;
    this.image = banner.image
      ? {
          fileName: banner.image.fileName,
          size: banner.image.size,
          url: buildImageUrl(banner.image.fileName),
        }
      : null;

    this.link = banner.link;
    this.order = banner.order;
    this.isActive = banner.isActive;
    this.createdBy = banner.createdBy;
    this.updatedBy = banner.updatedBy;
  }
}

module.exports = BannerResponseDTO;
