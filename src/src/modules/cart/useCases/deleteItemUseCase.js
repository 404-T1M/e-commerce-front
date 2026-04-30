const AppError = require("../../../core/errors/appError");
const cartRepository = require("../repositories/cartRepository");
const CartResponseDTO = require("../DTO/cartResponseDTO");

class DeleteItemUseCase {
  constructor() {
    this.cartRepo = new cartRepository();
  }

  async execute(loggedInUser, variantId) {
    if (!variantId) {
      throw new AppError("Variant is Required");
    }

    const cart = await this.cartRepo.findByUser(loggedInUser.id);
    if (!cart) throw new AppError("Cart is empty", 404);

    const itemIndex = cart.items.findIndex(
      (item) => item.variant._id.toString() === variantId,
    );
    if (itemIndex === -1) {
      throw new AppError("Item not found in cart", 404);
    }
    cart.items.splice(itemIndex, 1);
    const savedItems = await this.cartRepo.save(cart, {
      populateProduct: true,
    });
    return new CartResponseDTO(savedItems);
  }
}
module.exports = DeleteItemUseCase;
