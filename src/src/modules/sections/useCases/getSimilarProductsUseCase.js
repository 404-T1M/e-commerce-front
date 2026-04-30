const SectionRepository = require("../repository/sectionRepository");
const SectionResponseDTO = require("../DTO/sectionResponseDTO");
const AppError = require("../../../core/errors/appError");
const ProductRepository = require("../../products/repositories/productRepository");

class GetSimilarProductsUseCase {
  constructor() {
    this.sectionRepo = new SectionRepository();
    this.productRepo = new ProductRepository();
  }

  async execute(productId) {
    const section = await this.sectionRepo.findOne({
      type: "similarProducts",
      isActive: true,
    });
    if (!section) {
      return [];
    }
    const product = await this.productRepo.findOne({
      _id: productId,
      published: true,
      isDeleted: false,
    });
    if (!product) {
      throw new AppError("Product not found", 404);
    }

    const similarProducts = await this.productRepo.find(
      {
        category: product.category,
        _id: { $ne: productId },
        published: true,
        isDeleted: false,
      },
      { page: 1, limit: section.limit },
      {},
    );
    section.data = section.data ?? {};
    section.data.productIds = similarProducts;
    return new SectionResponseDTO(section);
  }
}

module.exports = GetSimilarProductsUseCase;
