const ImageService = require("../../../shared/services/imageUploadService");

class UpdateProfileImageUseCase {
  async execute(customer, image) {
    let oldImage = customer.profileImage.fileName;
    const result = await ImageService.uploadSingle({
      file: image,
      folder: "profileImages",
    });
    customer.profileImage.fileName = result.publicId;
    customer.profileImage.size = result.size;
    if (oldImage !== "default-avatar_edu8jh") {
      await ImageService.delete(oldImage);
    }
    return customer;
  }
}

module.exports = UpdateProfileImageUseCase;
