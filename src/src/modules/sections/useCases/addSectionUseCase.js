const AppError = require("../../../core/errors/appError");
const SectionRepository = require("../repository/sectionRepository");
const BannerRepository = require("../../banners/repository/bannerRepository");
const CategoryRepository = require("../../categories/repositories/categoryRepository");
const ProductRepository = require("../../products/repositories/productRepository");
const {
  assertAdminPermission,
} = require("../../../core/authorization/checkAdminAndHisPermission");
const SectionResponseDTO = require("../DTO/sectionResponseDTO");
class AddSectionUseCase {
  constructor() {
    this.sectionRepository = new SectionRepository();
    this.bannerRepo = new BannerRepository();
    this.categoryRepo = new CategoryRepository();
    this.productRepo = new ProductRepository();
  }

  async execute(loggedInUser, body) {
    await assertAdminPermission(loggedInUser, "sections.create");

    const {
      titleEn,
      titleAr,
      descriptionEn,
      descriptionAr,
      type,
      data,
      order,
    } = body;

    if (
      !titleEn ||
      !titleAr ||
      !descriptionEn ||
      !descriptionAr ||
      !type ||
      order === undefined ||
      order === null
    ) {
      throw new AppError("All fields are required", 400);
    }

    if (
      ![
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
      ].includes(type)
    ) {
      throw new AppError("Invalid section type", 400);
    }

    let bannerIds = [];
    let categoryIds = [];
    let productIds = [];

    if (
      (type === "hero_banner" ||
        type === "slider" ||
        type === "customCategoriesSection" ||
        type === "customProductsSection") &&
      (!data || Object.keys(data).length === 0)
    ) {
      throw new AppError(
        "Data field is required for the selected section type and cannot be empty",
        400,
      );
    }

    switch (type) {
      case "hero_banner":
        if (!data.bannerIds || data.bannerIds.length === 0) {
          throw new AppError(
            "Data field must include bannerIds for hero_banner section type",
            400,
          );
        }
        const heroBannerCount = await this.bannerRepo.count({
          _id: { $in: data.bannerIds },
          isActive: true,
        });
        if (heroBannerCount !== data.bannerIds.length) {
          throw new AppError(
            "One or more banners in bannerIds do not exist or not active",
            400,
          );
        }
        bannerIds = data.bannerIds;
        break;

      case "slider":
        if (!data.bannerIds || data.bannerIds.length === 0) {
          throw new AppError(
            "Data field must include bannerIds for slider section type",
            400,
          );
        }
        const sliderBannerCount = await this.bannerRepo.count({
          _id: { $in: data.bannerIds },
          isActive: true,
        });
        if (sliderBannerCount !== data.bannerIds.length) {
          throw new AppError(
            "One or more banners in bannerIds do not exist or not active",
            400,
          );
        }
        bannerIds = data.bannerIds;
        break;

      case "customCategoriesSection":
        if (!data.categoryIds || data.categoryIds.length === 0) {
          throw new AppError(
            "Data field must include categoryIds for categories or customCategoriesSection section type",
            400,
          );
        }
        const customCategoriesCount = await this.categoryRepo.count({
          _id: { $in: data.categoryIds },
          published: true,
          isDeleted: false,
        });
        if (customCategoriesCount !== data.categoryIds.length) {
          throw new AppError(
            "One or more categories in categoryIds do not exist or not active",
            400,
          );
        }
        categoryIds = data.categoryIds;
        break;

      case "customProductsSection":
        if (!data.productIds || data.productIds.length === 0) {
          throw new AppError(
            "Data field must include productIds for products or customProductsSection section type",
            400,
          );
        }
        const customProductsCount = await this.productRepo.count({
          _id: { $in: data.productIds },
          published: true,
          isDeleted: false,
        });
        if (customProductsCount !== data.productIds.length) {
          throw new AppError(
            "One or more products in productIds do not exist or not active",
            400,
          );
        }
        productIds = data.productIds;
        break;
    }

    const newSection = await this.sectionRepository.create({
      title: { en: titleEn, ar: titleAr },
      description: { en: descriptionEn, ar: descriptionAr },
      type,
      data: { bannerIds, categoryIds, productIds },
      order,
      limit: body.limit || 10,
      isActive:
        body.isActive !== undefined
          ? Boolean(body.isActive === "true" || body.isActive === true)
          : true,
      createdBy: loggedInUser._id,
    });

    return new SectionResponseDTO(newSection);
  }
}

module.exports = AddSectionUseCase;
