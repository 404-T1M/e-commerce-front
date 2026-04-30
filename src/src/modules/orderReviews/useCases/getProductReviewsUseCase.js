const ReviewRepository = require("../repositories/reviewRepository");
const OrderRepository = require("../../orders/repositories/orderRepository");

class GetProductReviewsUseCase {
  constructor() {
    this.reviewRepository = new ReviewRepository();
    this.orderRepository = new OrderRepository();
  }

  async execute(productId, loggedInUser, page = 1, limit = 10) {
    const { reviews, total } = await this.reviewRepository.find(
      { product: productId, published: true },
      page,
      limit,
    );

    let canReview = false;
    let hasReviewed = false;
    let userReview = null;

    if (loggedInUser) {
      const userId = loggedInUser.id;

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

      canReview = userOrderWithProduct !== undefined;
      hasReviewed = existingReview !== null;
      userReview = existingReview;
    }

    return {
      canReview,
      hasReviewed,
      userReview,
      reviews,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }
}

module.exports = GetProductReviewsUseCase;
