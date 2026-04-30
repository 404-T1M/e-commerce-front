const ProductRepository = require("../../repositories/productRepository");
const ProductVariantRepository = require("../../repositories/productVariantRepository");
const AppError = require("../../../../core/errors/appError");
const ProductResponseDTO = require("../../DTO/productResponseDTO");
const ProductVariantResponseDTO = require("../../DTO/productVariantResponseDTO");
const {
  assertAdminPermission,
} = require("../../../../core/authorization/checkAdminAndHisPermission");

class GetProductUseCase {
  constructor() {
    this.productRepo = new ProductRepository();
    this.productVariantRepo = new ProductVariantRepository();
  }
  async execute(loggedInUser, filter) {
    if (loggedInUser?.role === "admin") {
      await assertAdminPermission(loggedInUser, "products.list");
    }
    const product = await this.productRepo.findOne(filter, {
      populateCategory: true,
      populateCreatedBy: true,
    });
    if (!product) {
      throw new AppError("Product Not Found", 404);
    }

    const variantFilter = { ...filter, product: product._id };
    delete variantFilter._id;

    const variants = await this.productVariantRepo.find(variantFilter, {
      populateProduct: true,
      populateAttributes: true,
      populateCreatedBy: true,
    });

    return {
      product: new ProductResponseDTO(product),
      variants: variants.map(
        (variant) => new ProductVariantResponseDTO(variant),
      ),
    };
  }
}

module.exports = GetProductUseCase;
