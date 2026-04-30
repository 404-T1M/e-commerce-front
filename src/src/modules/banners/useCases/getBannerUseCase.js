const BannerRepository = require("../repository/bannerRepository");
const AppError = require("../../../core/errors/appError");
const BannerResponseDTO = require("../DTO/bannerResponseDTO");

const {
  assertAdminPermission,
} = require("../../../core/authorization/checkAdminAndHisPermission");
class GetBannerUseCase {
  constructor() {
    this.bannerRepo = new BannerRepository();
  }

  async execute(loggedInUser, bannerId) {
    await assertAdminPermission(loggedInUser, "banners.list");

    const banner = await this.bannerRepo.findOne({ _id: bannerId });
    if (!banner) {
      throw new AppError("Banner Not Found", 404);
    }

    return new BannerResponseDTO(banner);
  }
}

module.exports = GetBannerUseCase;
