const AppError = require("../../../core/errors/appError");
const ReviewRepository = require("../repositories/reviewRepository");
const OrderRepository = require("../../orders/repositories/orderRepository");
const ProductRepository = require("../../products/repositories/productRepository");

class AddReviewUseCase {
  constructor() {
    this.reviewRepository = new ReviewRepository();
    this.orderRepository = new OrderRepository();
    this.productRepository = new ProductRepository();
  }

  async execute(userId, productId, { rating, comment }) {
    const product = await this.productRepository.findOne({
      _id: productId,
      isDeleted: false,
      published: true,
    });
    if (!product) {
      throw new AppError("Product not found", 404);
    }

    const [deliveredOrders, existingReview] = await Promise.all([
      this.orderRepository.find(
        {
          user: userId,
          status: "delivered",
        },
        1,
        1000,
      ),
      this.reviewRepository.findOne({
        user: userId,
        product: productId,
      }),
    ]);

    const userOrderWithProduct = deliveredOrders.orders.find((order) =>
      order.items?.some((item) => {
        const variantProductId = item?.variant?.product;
        return (
          variantProductId &&
          variantProductId.toString() === productId.toString()
        );
      }),
    );

    if (!userOrderWithProduct) {
      throw new AppError(
        "You can only review products you have purchased and received",
        403,
      );
    }

    if (existingReview) {
      throw new AppError(
        "You have already reviewed this product. You can edit your existing review.",
        400,
      );
    }

    const review = await this.reviewRepository.create({
      user: userId,
      product: productId,
      order: userOrderWithProduct._id,
      rating,
      comment,
      published: false,
    });

    return review;
  }
}

module.exports = AddReviewUseCase;
