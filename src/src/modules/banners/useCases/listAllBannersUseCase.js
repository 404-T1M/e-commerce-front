const BannerRepository = require("../repository/bannerRepository");
const BannerResponseDTO = require("../DTO/bannerResponseDTO");

const {
  assertAdminPermission,
} = require("../../../core/authorization/checkAdminAndHisPermission");
class ListAllBannersUseCase {
  constructor() {
    this.bannerRepo = new BannerRepository();
  }

  async execute(loggedInUser, filter) {
    await assertAdminPermission(loggedInUser, "banners.list");

    const query = {};
    if (filter?.isActive !== undefined && filter?.isActive !== "") {
      query.isActive = filter.isActive === "true" || filter.isActive === true;
    }

    const page = Number(filter?.page) || 1;
    const limit = Number(filter?.limit) || 10;
    const sort = filter?.sort || { order: 1 };

    const [banners, total] = await Promise.all([
      this.bannerRepo.find(query, page, limit, sort),
      this.bannerRepo.count(query),
    ]);

    return {
      banners: banners.map((banner) => new BannerResponseDTO(banner)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

module.exports = ListAllBannersUseCase;
