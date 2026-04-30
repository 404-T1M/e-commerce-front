const AppError = require("../../../core/errors/appError");
const cartRepository = require("../repositories/cartRepository");
const variantRepository = require("../../products/repositories/productVariantRepository");
const CartResponseDTO = require("../DTO/cartResponseDTO");

class AddToCartUseCase {
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
    const variant = await this.variantRepo.findOne(
      {
        _id: variantId,
        published: true,
        isDeleted: false,
      },
      { populateProduct: true },
    );
    console.log(variant);

    if (!variant) {
      throw new AppError("Variant Not Available", 404);
    }
    if (!variant.product.published || variant.product.isDeleted) {
      throw new AppError("Product Not Available", 404);
    }

    if (quantity > variant.stock) {
      throw new AppError(`Stock Just Has a ${variant.stock} item`);
    }

    let userCart = await this.cartRepo.findByUser(loggedInUser.id);
    if (!userCart) {
      userCart = await this.cartRepo.create({
        user: loggedInUser.id,
        items: [],
      });
    }

    const itemIndex = userCart.items.findIndex(
      (item) => item.variant._id.toString() === variantId,
    );
    if (itemIndex > -1) {
      const newQuantity = userCart.items[itemIndex].quantity + quantity;

      if (newQuantity > variant.stock) {
        throw new AppError("Not Enough Stock", 400);
      }
      userCart.items[itemIndex].quantity = newQuantity;
    } else {
      userCart.items.push({
        variant: variant._id,
        quantity,
        priceSnapshot: variant.price.finalPrice,
      });
    }
    const savedItems = await this.cartRepo.save(userCart, {
      populateProduct: true,
    });
    return new CartResponseDTO(savedItems);
  }
}
module.exports = AddToCartUseCase;
