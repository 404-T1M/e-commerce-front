const { buildImageUrl } = require("../../../shared/utils/imageUrlBuilder");

class UserLoginDTO {
  constructor(user, token) {
    this.id = user._id;
    this.name = user.name;
    this.email = user.email;
    this.mobilePhone = user.mobilePhone;
    this.role = user.role;
    this.emailVerified = user.emailVerified;
    this.status = user.status;
    this.adminGroup = user.adminGroup;
    this.createdAt = user.createdAt;
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
    this.token = token;
  }
}

module.exports = UserLoginDTO;
