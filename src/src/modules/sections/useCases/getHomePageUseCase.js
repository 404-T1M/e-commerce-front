const SectionRepository = require("../repository/sectionRepository");
const GetForYouSectionUseCase = require("./getForYouSectionUseCase");
const ProductRepository = require("../../products/repositories/productRepository");
const BannerRepository = require("../../banners/repository/bannerRepository");
const CategoryRepository = require("../../categories/repositories/categoryRepository");
const SectionResponseDTO = require("../DTO/sectionResponseDTO");
class GetHomePageUseCase {
  constructor() {
    this.sectionRepo = new SectionRepository();
    this.bannerRepo = new BannerRepository();
    this.categoryRepo = new CategoryRepository();
    this.productRepo = new ProductRepository();
  }

  async execute(loggedInUser) {
    const sections = await this.sectionRepo.find(
      { isActive: true },
      {},
      { order: 1 },
    );
    let sectionDTO = [];

    for (const section of sections) {
      section.data = section.data ?? {};
      switch (section.type) {
        case "hero_banner":
          const existBanners = await this.sectionRepo.checkValidData(
            this.bannerRepo,
            section.data.bannerIds,
            { isActive: true },
          );
          section.data.bannerIds = existBanners;
          await section.populate("data.bannerIds");
          if (section.data.bannerIds.length > 0) {
            sectionDTO.push(new SectionResponseDTO(section));
          }
          break;

        case "slider":
          const existBannersInSlider = await this.sectionRepo.checkValidData(
            this.bannerRepo,
            section.data.bannerIds,
            { isActive: true },
          );
          section.data.bannerIds = existBannersInSlider;
          await section.populate("data.bannerIds");
          if (section.data.bannerIds.length > 0) {
            sectionDTO.push(new SectionResponseDTO(section));
          }
          break;

        case "customCategoriesSection":
          const existCategories = await this.sectionRepo.checkValidData(
            this.categoryRepo,
            section.data.categoryIds,
            { published: true, isDeleted: false },
          );
          section.data.categoryIds = existCategories;
          await section.populate("data.categoryIds");
          if (section.data.categoryIds.length > 0) {
            sectionDTO.push(new SectionResponseDTO(section));
          }
          break;

        case "customProductsSection":
          const existProducts = await this.sectionRepo.checkValidData(
            this.productRepo,
            section.data.productIds,
            { published: true, isDeleted: false },
          );
          section.data.productIds = existProducts;
          await section.populate("data.productIds");
          if (section.data.productIds.length > 0) {
            sectionDTO.push(new SectionResponseDTO(section));
          }
          break;

        case "categories":
          const homepageCategories = await this.categoryRepo.find(
            { published: true, isDeleted: false, parent: null },
            { page: 1, limit: section.limit },
            { createdAt: -1 },
          );
          section.data.categoryIds = homepageCategories;
          if (section.data.categoryIds.length > 0) {
            sectionDTO.push(new SectionResponseDTO(section));
          }
          break;

        case "productsWithOffers":
          const existProductsWithOffers = await this.productRepo.find(
            {
              "discountPrice.active": true,
              published: true,
              isDeleted: false,
            },
            { page: 1, limit: section.limit },
            {},
          );
          section.data.productIds = existProductsWithOffers;

          if (section.data.productIds.length > 0) {
            sectionDTO.push(new SectionResponseDTO(section));
          }
          break;

        case "newArrivals":
          const existNewArrivals = await this.productRepo.find(
            { published: true, isDeleted: false },
            { page: 1, limit: section.limit },
            { createdAt: -1 },
          );
          section.data.productIds = existNewArrivals;

          if (section.data.productIds.length > 0) {
            sectionDTO.push(new SectionResponseDTO(section));
          }
          break;

        case "topRatedProducts":
          const existTopRatedProducts = await this.productRepo.find(
            { published: true, isDeleted: false },
            { page: 1, limit: section.limit },
            { "rating.avg": -1 },
          );
          section.data.productIds = existTopRatedProducts;

          if (section.data.productIds.length > 0) {
            sectionDTO.push(new SectionResponseDTO(section));
          }
          break;

        case "forYouRecommendations":
          const forYouSection = await new GetForYouSectionUseCase().execute(
            loggedInUser,
          );
          if (forYouSection.data.products.length > 0) {
            sectionDTO.push(forYouSection);
          }
          break;

        case "mostSellingProducts":
          const existMostSellingProducts = await this.productRepo.find(
            { published: true, isDeleted: false },
            { page: 1, limit: section.limit },
            { soldCount: -1 },
          );
          section.data.productIds = existMostSellingProducts;
          if (section.data.productIds.length > 0) {
            sectionDTO.push(new SectionResponseDTO(section));
          }
          break;

        default:
          break;
      }
    }
    return sectionDTO;
  }
}

module.exports = GetHomePageUseCase;
