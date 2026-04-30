const AppError = require("../../../core/errors/appError");
const cartRepository = require("../repositories/cartRepository");
const variantRepository = require("../../products/repositories/productVariantRepository");
const CartResponseDTO = require("../DTO/cartResponseDTO");

class UpdateQuantityUseCase {
  constructor() {
    this.cartRepo = new cartRepository();
    this.variantRepo = new variantRepository();
  }

  async execute(loggedInUser, variantId, quantity) {
    if (!variantId || quantity === undefined || quantity < 1) {
      throw new AppError(
        "Variant and Quantity are Required and Quantity Must Be more than 0",
      );
    }

    const cart = await this.cartRepo.findByUser(loggedInUser.id);
    if (!cart) throw new AppError("Cart is empty", 404);

    const itemIndex = cart.items.findIndex(
      (item) => item.variant._id.toString() === variantId,
    );
    if (itemIndex === -1) {
      throw new AppError("Item not found in cart", 404);
    }

    const variant = await this.variantRepo.findOne(
      { _id: variantId, published: true, isDeleted: false },
      { populateProduct: true },
    );
    if (
      !variant ||
      !variant.product ||
      !variant.product.published ||
      variant.product.isDeleted
    ) {
      throw new AppError("Variant not available", 400);
    }

    if (quantity > variant.stock) {
      throw new AppError("Not Enough Stock");
    }
    cart.items[itemIndex].quantity = quantity;

    const savedItems = await this.cartRepo.save(cart, {
      populateProduct: true,
    });
    return new CartResponseDTO(savedItems);
  }
}
module.exports = UpdateQuantityUseCase;
