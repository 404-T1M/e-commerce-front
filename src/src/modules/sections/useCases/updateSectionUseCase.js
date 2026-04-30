const AppError = require("../../../core/errors/appError");
const SectionRepository = require("../repository/sectionRepository");
const BannerRepository = require("../../banners/repository/bannerRepository");
const CategoryRepository = require("../../categories/repositories/categoryRepository");
const ProductRepository = require("../../products/repositories/productRepository");
const {
  assertAdminPermission,
} = require("../../../core/authorization/checkAdminAndHisPermission");
const SectionResponseDTO = require("../DTO/sectionResponseDTO");

class UpdateSectionUseCase {
  constructor() {
    this.sectionRepository = new SectionRepository();
    this.bannerRepo = new BannerRepository();
    this.categoryRepo = new CategoryRepository();
    this.productRepo = new ProductRepository();
  }

  async execute(loggedInUser, sectionId, body) {
    await assertAdminPermission(loggedInUser, "sections.update");

    const section = await this.sectionRepository.findOne({ _id: sectionId });
    if (!section) {
      throw new AppError("Section not found", 404);
    }

    const allowedTypes = [
      "hero_banner",
      "slider",
      "categories",
      "customCategoriesSection",
      "customProductsSection",
      "mostSellingProducts",
      "productsWithOffers",
      "newArrivals",
      "topRatedProducts",
      "forYouRecommendations",
      "similarProducts",
    ];

    const nextType = body.type ?? section.type;
    if (!allowedTypes.includes(nextType)) {
      throw new AppError("Invalid section type", 400);
    }

    const nextData = body.data ?? section.data ?? {};
    let bannerIds = [];
    let categoryIds = [];
    let productIds = [];

    if (
      (nextType === "hero_banner" ||
        nextType === "slider" ||
        nextType === "customCategoriesSection" ||
        nextType === "customProductsSection") &&
      (!nextData || Object.keys(nextData).length === 0)
    ) {
      throw new AppError(
        "Data field is required for the selected section type and cannot be empty",
        400,
      );
    }

    switch (nextType) {
      case "hero_banner":
        if (!nextData.bannerIds || nextData.bannerIds.length === 0) {
          throw new AppError(
            "Data field must include bannerIds for hero_banner section type",
            400,
          );
        }
        const heroBannerCount = await this.bannerRepo.count({
          _id: { $in: nextData.bannerIds },
          isActive: true,
        });
        if (heroBannerCount !== nextData.bannerIds.length) {
          throw new AppError(
            "One or more banners in bannerIds do not exist or not active",
            400,
          );
        }
        bannerIds = nextData.bannerIds;
        break;

      case "slider":
        if (!nextData.bannerIds || nextData.bannerIds.length === 0) {
          throw new AppError(
            "Data field must include bannerIds for slider section type",
            400,
          );
        }
        const sliderBannerCount = await this.bannerRepo.count({
          _id: { $in: nextData.bannerIds },
          isActive: true,
        });
        if (sliderBannerCount !== nextData.bannerIds.length) {
          throw new AppError(
            "One or more banners in bannerIds do not exist or not active",
            400,
          );
        }
        bannerIds = nextData.bannerIds;
        break;

      case "customCategoriesSection":
        if (!nextData.categoryIds || nextData.categoryIds.length === 0) {
          throw new AppError(
            "Data field must include categoryIds for categories or customCategoriesSection section type",
            400,
          );
        }
        const categoriesCount = await this.categoryRepo.count({
          _id: { $in: nextData.categoryIds },
          published: true,
          isDeleted: false,
        });
        if (categoriesCount !== nextData.categoryIds.length) {
          throw new AppError(
            "One or more categories in categoryIds do not exist or not active",
            400,
          );
        }
        categoryIds = nextData.categoryIds;
        break;

      case "customProductsSection":
        if (!nextData.productIds || nextData.productIds.length === 0) {
          throw new AppError(
            "Data field must include productIds for products or customProductsSection section type",
            400,
          );
        }
        const productsCount = await this.productRepo.count({
          _id: { $in: nextData.productIds },
          published: true,
          isDeleted: false,
        });
        if (productsCount !== nextData.productIds.length) {
          throw new AppError(
            "One or more products in productIds do not exist or not active",
            400,
          );
        }
        productIds = nextData.productIds;
        break;
    }

    const updatedSection = await this.sectionRepository.updateOne(
      { _id: sectionId },
      {
        title: {
          en: body.titleEn ?? section.title.en,
          ar: body.titleAr ?? section.title.ar,
        },
        description: {
          en: body.descriptionEn ?? section.description.en,
          ar: body.descriptionAr ?? section.description.ar,
        },
        type: nextType,
        data: {
          bannerIds,
          categoryIds,
          productIds,
        },
        order: body.order !== undefined ? Number(body.order) : section.order,
        limit: body.limit !== undefined ? Number(body.limit) : section.limit,
        isActive:
          body.isActive !== undefined
            ? Boolean(body.isActive === "true" || body.isActive === true)
            : section.isActive,
      },
    );

    return new SectionResponseDTO(updatedSection);
  }
}

module.exports = UpdateSectionUseCase;
