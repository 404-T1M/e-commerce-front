const BannerRepository = require("../repository/bannerRepository");
const ImageService = require("../../../shared/services/imageUploadService");
const AppError = require("../../../core/errors/appError");

const {
  assertAdminPermission,
} = require("../../../core/authorization/checkAdminAndHisPermission");
class DeleteBannerUseCase {
  constructor() {
    this.bannerRepo = new BannerRepository();
  }

  async execute(loggedInUser, bannerId) {
    await assertAdminPermission(loggedInUser, "banners.delete");

    const banner = await this.bannerRepo.findOne({ _id: bannerId });
    if (!banner) {
      throw new AppError("Banner Not Found", 404);
    }

    await this.bannerRepo.delete({ _id: bannerId });
    if (banner.image?.fileName) {
      await ImageService.delete(banner.image.fileName);
    }
  }
}

module.exports = DeleteBannerUseCase;
