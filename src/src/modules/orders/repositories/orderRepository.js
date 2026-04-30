const Order = require("../models/orderModel");

const CUSTOMER_POPULATE = [{ path: "user", select: "name email mobilePhone" }];

const ITEMS_POPULATE = [{ path: "items.variant", select: "product" }];

class OrderRepository {
  async create(orderData) {
    return await Order.create(orderData);
  }

  async findById(id) {
    return await Order.findById(id).populate(CUSTOMER_POPULATE);
  }

  async findByIdAndUser(id, userId) {
    return await Order.findOne({ _id: id, user: userId }).populate(
      CUSTOMER_POPULATE,
    ).populate(ITEMS_POPULATE);
  }

  async findByUser(userId, page = 1, limit = 10, sort = { createdAt: -1 }) {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      Order.find({ user: userId })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate(CUSTOMER_POPULATE),
      Order.countDocuments({ user: userId }),
    ]);
    return { orders, total };
  }

  async find(filter = {}, page = 1, limit = 10, sort = { createdAt: -1 }) {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate(CUSTOMER_POPULATE)
        .populate(ITEMS_POPULATE),
      Order.countDocuments(filter),
    ]);
    return { orders, total };
  }

  async updateStatus(id, status) {
    return await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true },
    ).populate(CUSTOMER_POPULATE);
  }

  async save(order) {
    return await order.save();
  }

  async existsByUserAndCoupon(userId, couponCode) {
    return await Order.exists({
      user: userId,
      "coupon.code": couponCode,
      status: { $nin: ["cancelled"] },
    });
  }
}

module.exports = OrderRepository;
