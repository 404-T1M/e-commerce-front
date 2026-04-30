const BannerRepository = require("../repository/bannerRepository");
const ImageService = require("../../../shared/services/imageUploadService");
const BannerResponseDTO = require("../DTO/bannerResponseDTO");
const AppError = require("../../../core/errors/appError");
const {
  assertAdminPermission,
} = require("../../../core/authorization/checkAdminAndHisPermission");
class AddBannerUseCase {
  constructor() {
    this.bannerRepo = new BannerRepository();
  }

  async execute(loggedInUser, body, imageFile) {
    await assertAdminPermission(loggedInUser, "banners.create");
    const { titleEn, titleAr, order, link, isActive } = body;

    if (!titleEn || !titleAr) {
      throw new AppError("Title in both English and Arabic is required", 400);
    }

    let normalizedOrder;
    if (order !== undefined && order !== "") {
      normalizedOrder = Number(order);
      if (!Number.isFinite(normalizedOrder)) {
        throw new AppError("Invalid order value", 400);
      }
    }

    let normalizedIsActive;
    if (isActive !== undefined && isActive !== "") {
      if (isActive === true || isActive === "true") {
        normalizedIsActive = true;
      } else if (isActive === false || isActive === "false") {
        normalizedIsActive = false;
      } else {
        throw new AppError("Invalid isActive value", 400);
      }
    }

    let imageData = null;
    try {
      if (imageFile) {
        imageData = await ImageService.uploadSingle({
          file: imageFile,
          folder: "banners",
        });
      }

      const banner = await this.bannerRepo.create({
        title: { en: titleEn, ar: titleAr },
        link,
        image: imageData
          ? {
              fileName: imageData.publicId,
              size: imageData.size,
            }
          : null,
        ...(normalizedOrder !== undefined ? { order: normalizedOrder } : {}),
        isActive: normalizedIsActive !== undefined ? normalizedIsActive : true,
        createdBy: loggedInUser.id,
      });

      return new BannerResponseDTO(banner);
    } catch (error) {
      if (imageData?.publicId) {
        await ImageService.delete(imageData.publicId);
      }
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Image upload failed: " + error.message, 500);
    }
  }
}

module.exports = AddBannerUseCase;
