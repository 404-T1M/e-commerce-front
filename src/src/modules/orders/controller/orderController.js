const catchAsync = require("../../../shared/utils/catchAsync");
const PlaceOrderUseCase = require("../useCases/placeOrderUseCase");
const GetUserOrdersUseCase = require("../useCases/getUserOrdersUseCase");
const GetOrderByIdUseCase = require("../useCases/getOrderByIdUseCase");
const CancelOrderUseCase = require("../useCases/cancelOrderUseCase");
const GetAllOrdersUseCase = require("../useCases/getAllOrdersUseCase");
const UpdateOrderStatusUseCase = require("../useCases/updateOrderStatusUseCase");
const OrderResponseDTO = require("../DTO/orderResponseDTO");

class OrderController {
  constructor() {
    this.placeOrderUseCase = new PlaceOrderUseCase();
    this.getUserOrdersUseCase = new GetUserOrdersUseCase();
    this.getOrderByIdUseCase = new GetOrderByIdUseCase();
    this.cancelOrderUseCase = new CancelOrderUseCase();
    this.getAllOrdersUseCase = new GetAllOrdersUseCase();
    this.updateOrderStatusUseCase = new UpdateOrderStatusUseCase();
  }

  placeOrder = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const { addressId, shippingMethodId, paymentMethodId } = req.body;

    const order = await this.placeOrderUseCase.execute(loggedInUser, {
      addressId,
      shippingMethodId,
      paymentMethodId,
    });

    res.status(201).json({
      message: "Order placed successfully",
      order: new OrderResponseDTO(order),
    });
  });

  getMyOrders = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;

    const result = await this.getUserOrdersUseCase.execute(
      loggedInUser,
      req.query,
    );

    res.status(200).json({
      message: "Success",
      ...result,
      orders: result.orders.map((o) => new OrderResponseDTO(o)),
    });
  });

  getOrderById = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const { id } = req.params;

    const order = await this.getOrderByIdUseCase.execute(loggedInUser, id);

    res.status(200).json({
      message: "Success",
      order: new OrderResponseDTO(order),
    });
  });

  cancelOrder = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const { id } = req.params;

    const order = await this.cancelOrderUseCase.execute(loggedInUser, id);

    res.status(200).json({
      message: "Order cancelled successfully",
      order: new OrderResponseDTO(order),
    });
  });

  getAllOrders = catchAsync(async (req, res, next) => {
    const result = await this.getAllOrdersUseCase.execute(req.user, req.query);

    res.status(200).json({
      message: "Success",
      ...result,
      orders: result.orders.map((o) => new OrderResponseDTO(o)),
    });
  });

  updateOrderStatus = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;

    const order = await this.updateOrderStatusUseCase.execute(
      req.user,
      id,
      status,
    );

    res.status(200).json({
      message: "Order status updated successfully",
      order: new OrderResponseDTO(order),
    });
  });
}

module.exports = OrderController;
