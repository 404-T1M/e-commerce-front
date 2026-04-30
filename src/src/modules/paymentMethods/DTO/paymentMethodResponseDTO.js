const { buildImageUrl } = require("../../../shared/utils/imageUrlBuilder");

class PaymentMethodResponseDTO {
  constructor(paymentMethod) {
    this.id = paymentMethod._id;

    this.name = {
      en: paymentMethod.name?.en || null,
      ar: paymentMethod.name?.ar || null,
    };

    this.description = {
      en: paymentMethod.description?.en || null,
      ar: paymentMethod.description?.ar || null,
    };

    const img = paymentMethod.image;
    this.image =
      img && img.fileName
        ? {
            fileName: img.fileName,
            size: img.size,
            imageUrl: buildImageUrl(img.fileName, {
              crop: "fill",
              quality: "auto",
              fetch_format: "auto",
            }),
          }
        : null;

    this.isActive = paymentMethod.isActive;

    this.createdBy =
      paymentMethod.createdBy &&
      typeof paymentMethod.createdBy === "object"
        ? {
            id: paymentMethod.createdBy._id,
            name: paymentMethod.createdBy.name,
            email: paymentMethod.createdBy.email,
          }
        : paymentMethod.createdBy;

    this.createdAt = paymentMethod.createdAt;
    this.updatedAt = paymentMethod.updatedAt;
  }
}

module.exports = PaymentMethodResponseDTO;
