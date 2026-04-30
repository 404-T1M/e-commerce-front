const catchAsync = require("../../../shared/utils/catchAsync");
const AddToCartUseCase = require("../useCases/addToCartUseCase");
const GetCartUseCase = require("../useCases/getCartUseCase");
const UpdateQuantityUseCase = require("../useCases/updateQuantityUseCase");
const DeleteItemUseCase = require("../useCases/deleteItemUseCase");
const ApplyCouponUseCase = require("../useCases/applyCouponUseCase");

class CartController {
  constructor() {
    this.addToCartUseCase = new AddToCartUseCase();
    this.getCartUseCase = new GetCartUseCase();
    this.updateQuantityUseCase = new UpdateQuantityUseCase();
    this.deleteItemUseCase = new DeleteItemUseCase();
    this.applyCouponUseCase = new ApplyCouponUseCase();
  }

  addToCart = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const { variantId, quantity } = req.body;

    const item = await this.addToCartUseCase.execute(
      loggedInUser,
      variantId,
      quantity,
    );

    res.status(201).json({
      message: "Item Added To Cart Successfully",
      cart: item,
    });
  });

  updateCart = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const { variantId, quantity } = req.body;

    const cart = await this.updateQuantityUseCase.execute(
      loggedInUser,
      variantId,
      quantity,
    );

    res.status(201).json({
      message: "Item updated in cart successfully",
      cart,
    });
  });

  deleteItem = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const { variantId } = req.body;

    const cart = await this.deleteItemUseCase.execute(loggedInUser, variantId);

    res.status(201).json({
      message: "Item Deleted from Cart Successfully",
      cart,
    });
  });

  getCart = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;

    const cart = await this.getCartUseCase.execute(loggedInUser);

    res.status(201).json({
      message: "Success",
      cart,
    });
  });

  applyCoupon = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const { couponCode } = req.body;

    const result = await this.applyCouponUseCase.execute(
      loggedInUser,
      couponCode,
    );

    res.status(200).json({
      message: "Coupon Applied Successfully",
      result,
    });
  });
}

module.exports = CartController;
