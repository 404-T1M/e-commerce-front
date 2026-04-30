const BannerRepository = require("../repository/bannerRepository");
const ImageService = require("../../../shared/services/imageUploadService");
const BannerResponseDTO = require("../DTO/bannerResponseDTO");

const AppError = require("../../../core/errors/appError");
const {
  assertAdminPermission,
} = require("../../../core/authorization/checkAdminAndHisPermission");
class UpdateBannerUseCase {
  constructor() {
    this.bannerRepo = new BannerRepository();
  }

  async execute(loggedInUser, bannerId, body, imageFile) {
    await assertAdminPermission(loggedInUser, "banners.update");

    const banner = await this.bannerRepo.findOne({ _id: bannerId });
    if (!banner) {
      throw new AppError("Banner Not Found", 404);
    }

    let oldImagePublicId = banner.image?.fileName;
    let newImageData = null;
    let savedBanner = false;

    let normalizedOrder;
    if (body.order !== undefined && body.order !== "") {
      normalizedOrder = Number(body.order);
      if (!Number.isFinite(normalizedOrder)) {
        throw new AppError("Invalid order value", 400);
      }
    }

    let normalizedIsActive;
    if (body.isActive !== undefined && body.isActive !== "") {
      if (body.isActive === true || body.isActive === "true") {
        normalizedIsActive = true;
      } else if (body.isActive === false || body.isActive === "false") {
        normalizedIsActive = false;
      } else {
        throw new AppError("Invalid isActive value", 400);
      }
    }

    try {
      if (imageFile) {
        newImageData = await ImageService.uploadSingle({
          file: imageFile,
          folder: "banners",
        });
        banner.image = newImageData
          ? {
              fileName: newImageData.publicId,
              size: newImageData.size,
            }
          : banner.image;
      }

      if (body.titleEn) {
        banner.title.en = body.titleEn;
      }
      if (body.titleAr) {
        banner.title.ar = body.titleAr;
      }
      if (body.link !== undefined) {
        banner.link = body.link;
      }
      if (normalizedOrder !== undefined) {
        banner.order = normalizedOrder;
      }
      if (normalizedIsActive !== undefined) {
        banner.isActive = normalizedIsActive;
      }
      banner.updatedBy = loggedInUser.id;
      await banner.save();
      savedBanner = true;

      if (newImageData && oldImagePublicId) {
        try {
          await ImageService.delete(oldImagePublicId);
        } catch (cleanupError) {
        }
      }

      return new BannerResponseDTO(banner);
    } catch (error) {
      if (!savedBanner && newImageData?.publicId) {
        await ImageService.delete(newImageData.publicId);
      }
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(error.message, 500);
    }
  }
}

module.exports = UpdateBannerUseCase;
