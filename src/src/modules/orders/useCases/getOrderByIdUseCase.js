const AppError = require("../../../core/errors/appError");
const OrderRepository = require("../repositories/orderRepository");

class GetOrderByIdUseCase {
  constructor() {
    this.orderRepository = new OrderRepository();
  }

  async execute(loggedInUser, orderId) {
    const order = await this.orderRepository.findByIdAndUser(
      orderId,
      loggedInUser.id,
    );

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    return order;
  }
}

module.exports = GetOrderByIdUseCase;
