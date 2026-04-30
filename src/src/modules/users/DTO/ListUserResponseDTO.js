const { buildImageUrl } = require("../../../shared/utils/imageUrlBuilder");
class ListUserResponseDTO {
  constructor(user) {
    this.id = user._id;
    this.name = user.name;
    this.email = user.email;
    this.mobilePhone = user.mobilePhone;
    this.role = user.role;
    this.adminGroup = user.adminGroup;
    this.profileImage = user.profileImage
      ? {
          fileName: user.profileImage.fileName,
          imageSize: user.profileImage.size,
          imageUrl: buildImageUrl(user.profileImage.fileName, {
            crop: "fill",
            quality: "auto",
            fetch_format: "auto",
          }),
        }
      : null;
    this.emailVerified = user.emailVerified;
    this.status = user.status;
    this.createdAt = user.createdAt;
  }
}

module.exports = ListUserResponseDTO;
