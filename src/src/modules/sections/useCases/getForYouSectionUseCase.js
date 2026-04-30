const SectionRepository = require("../repository/sectionRepository");
const CartRepository = require("../../cart/repositories/cartRepository");
const OrderRepository = require("../../orders/repositories/orderRepository");
const ProductRepository = require("../../products/repositories/productRepository");
const SectionResponseDTO = require("../DTO/sectionResponseDTO");
const AppError = require("../../../core/errors/appError");
class GetForYouSectionUseCase {
  constructor() {
    this.sectionsRepository = new SectionRepository();
    this.cartRepository = new CartRepository();
    this.orderRepository = new OrderRepository();
    this.productRepository = new ProductRepository();
  }
  async execute(loggedInUser) {
    const section = await this.sectionsRepository.findOne({
      type: "forYouRecommendations",
      isActive: true,
    });
    if (!section) {
      throw new AppError("For You Recommendations section not found", 404);
    }

    if (!loggedInUser) {
      section.data = section.data ?? {};
      section.data.productIds = [];
      return new SectionResponseDTO(section);
    }

    const userId = loggedInUser.id ?? loggedInUser._id;

    const userCart = await this.cartRepository.findByUser(userId);
    const { orders: userOrders } = await this.orderRepository.find({
      user: userId,
    });

    let items = userCart ? [...userCart.items] : [];
    userOrders.forEach((order) => {
      items.push(...order.items);
    });
    const productIds = items
      .map((item) => item?.variant?.product?._id ?? item?.variant?.product)
      .filter(Boolean);

    let categories = items
      .map((item) => item?.variant?.product?.category)
      .filter(Boolean);

    if (items.length === 0) {
      section.data = section.data ?? {};
      section.data.productIds = [];
      return new SectionResponseDTO(section);
    }

    if (categories.length === 0 && productIds.length > 0) {
      const products = await this.productRepository.find(
        { _id: { $in: productIds }, published: true, isDeleted: false },
        { page: 1, limit: productIds.length },
        {},
      );
      categories = products.map((product) => product.category).filter(Boolean);
    }

    const similarProducts = await this.productRepository.find(
      {
        category: { $in: categories },
        _id: { $nin: productIds },
        published: true,
        isDeleted: false,
      },
      { page: 1, limit: section.limit },
      {},
    );
    section.data = section.data ?? {};
    section.data.productIds = similarProducts;

    return new SectionResponseDTO(section);
  }
}
module.exports = GetForYouSectionUseCase;
