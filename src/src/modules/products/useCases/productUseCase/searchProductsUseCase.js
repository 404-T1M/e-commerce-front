const AppError = require("../../../../core/errors/appError");
const ProductRepository = require("../../repositories/productRepository");
const ProductResponseDTO = require("../../DTO/productResponseDTO");

class SearchProductsUseCase {
  constructor() {
    this.productRepo = new ProductRepository();
  }

  async execute(term, options = {}) {
    if (!term || term.trim().length < 2) {
      throw new AppError("Search term must be at least 2 characters", 400);
    }

    const products = await this.productRepo.search(term.trim(), {
      limit: options.limit ?? 10,
    });

    return products.map((p) => new ProductResponseDTO(p));
  }
}

module.exports = SearchProductsUseCase;
