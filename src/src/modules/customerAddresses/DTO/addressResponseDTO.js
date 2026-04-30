const { buildImageUrl } = require("../../../shared/utils/imageUrlBuilder");

class AddressResponseDTO {
  constructor(address) {
    this.id = address._id;

    this.user =
      typeof address.user === "object"
        ? {
            name: address.user.name,
            email: address.user.email,
            mobilePhone: address.user.mobilePhone,
            image: address.user.image
              ? {
                  fileName: address.user.image.fileName,
                  size: address.user.image.size,
                  imageUrl: buildImageUrl(address.user.image.fileName, {
                    crop: "fill",
                    quality: "auto",
                    fetch_format: "auto",
                  }),
                }
              : null,
          }
        : address.user;

    this.country = address.country;
    this.governorate = address.governorate;
    this.recipientMobilePhone = address.recipientMobilePhone;
    this.recipientName = address.recipientName;
    this.address = address.address;
    this.isPrimary = address.isPrimary;
    this.createdAt = address.createdAt;
  }
}

module.exports = AddressResponseDTO;
