const { buildImageUrl } = require("../../../shared/utils/imageUrlBuilder");

class ShippingMethodResponseDTO {
  constructor(shippingMethod) {
    this.id = shippingMethod._id;
    this.name = shippingMethod.name;
    this.description = shippingMethod.description ?? null;
    this.price = shippingMethod.price;
    this.estimatedDeliveryDays = shippingMethod.estimatedDeliveryDays ?? null;

    const img = shippingMethod.image;
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

    this.isActive = shippingMethod.isActive;

    this.createdBy =
      shippingMethod.createdBy && typeof shippingMethod.createdBy === "object"
        ? {
            id: shippingMethod.createdBy._id,
            name: shippingMethod.createdBy.name,
            email: shippingMethod.createdBy.email,
          }
        : shippingMethod.createdBy;

    this.createdAt = shippingMethod.createdAt;
    this.updatedAt = shippingMethod.updatedAt;
  }
}

module.exports = ShippingMethodResponseDTO;
