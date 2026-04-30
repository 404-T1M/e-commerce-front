const cartRepository = require("../repositories/cartRepository");
const CartResponseDTO = require("../DTO/cartResponseDTO");

class GetCartUseCase {
  constructor() {
    this.cartRepo = new cartRepository();
  }

  async execute(loggedInUser) {
    const cart = await this.cartRepo.findByUser(loggedInUser.id);

    if (!cart) {
      return null;
    }

    return new CartResponseDTO(cart);
  }
}

module.exports = GetCartUseCase;
