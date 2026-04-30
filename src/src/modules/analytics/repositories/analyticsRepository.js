const Order = require("../../orders/models/orderModel");
const User = require("../../users/models/userModel");

class AnalyticsRepository {
  async countOrdersByStatus(status) {
    if (Array.isArray(status)) {
      return await Order.countDocuments({ status: { $in: status } });
    }
    return await Order.countDocuments({ status });
  }

  async countUsers() {
    return await User.countDocuments({ role: "user", isDeleted: false });
  }

  async getProfitByMonth(year) {
    const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
    const endOfYear = new Date(`${year + 1}-01-01T00:00:00.000Z`);

    const results = await Order.aggregate([
      {
        $match: {
          status: "delivered",
          createdAt: { $gte: startOfYear, $lt: endOfYear },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          revenue: { $sum: "$pricing.total" },
          profit: {
            $sum: {
              $subtract: ["$pricing.total", "$pricing.shipping"],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const chart = [];
    for (let month = 1; month <= 12; month++) {
      const found = results.find((r) => r._id === month);
      chart.push({
        month,
        revenue: found ? found.revenue : 0,
        profit: found ? found.profit : 0,
      });
    }

    return chart;
  }

  async getOrdersStatsByDateRange(startDate, endDate) {
    const results = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
        },
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalItemsSold: { $sum: { $sum: "$items.quantity" } },
          totalRevenue: { $sum: "$pricing.total" },
          totalProfit: {
            $sum: {
              $subtract: ["$pricing.total", "$pricing.shipping"],
            },
          },
        },
      },
    ]);

    if (!results.length) {
      return {
        totalOrders: 0,
        totalItemsSold: 0,
        totalRevenue: 0,
        totalProfit: 0,
      };
    }

    const { totalOrders, totalItemsSold, totalRevenue, totalProfit } =
      results[0];
    return { totalOrders, totalItemsSold, totalRevenue, totalProfit };
  }

  async getUsersOrderStats(
    sortField = "completedOrders",
    sortOrder = -1,
    page = 1,
    limit = 10,
  ) {
    const ACTIVE_STATUSES = ["pending", "confirmed", "processing", "shipped"];
    const skip = (page - 1) * limit;

    const pipelineCount = [
      {
        $group: {
          _id: "$user",
        },
      },
      { $count: "total" },
    ];

    const pipelineData = [
      {
        $group: {
          _id: "$user",
          activeOrders: {
            $sum: { $cond: [{ $in: ["$status", ACTIVE_STATUSES] }, 1, 0] },
          },
          completedOrders: {
            $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] },
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
          },
          totalSpent: {
            $sum: {
              $cond: [{ $eq: ["$status", "delivered"] }, "$pricing.total", 0],
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 0,
          user: { _id: "$user._id", name: "$user.name", email: "$user.email" },
          activeOrders: 1,
          completedOrders: 1,
          cancelledOrders: 1,
          totalSpent: 1,
        },
      },
      { $sort: { [sortField]: sortOrder } },
      { $skip: skip },
      { $limit: limit },
    ];

    const [countResult, dataResult] = await Promise.all([
      Order.aggregate(pipelineCount),
      Order.aggregate(pipelineData),
    ]);

    const total = countResult[0] ? countResult[0].total : 0;

    return {
      total,
      customers: dataResult,
    };
  }

  async getProductsStats(
    sortField = "soldCount",
    sortOrder = -1,
    page = 1,
    limit = 10,
  ) {
    const skip = (page - 1) * limit;

    const pipelineCount = [
      { $match: { status: "delivered" } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "productvariants",
          localField: "items.variant",
          foreignField: "_id",
          as: "variantDoc",
        },
      },
      { $unwind: { path: "$variantDoc", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: {
            $cond: [
              { $ifNull: ["$variantDoc.product", false] },
              "$variantDoc.product",
              "unknown_product",
            ],
          },
        },
      },
      { $match: { _id: { $ne: "unknown_product" } } },
      { $count: "total" },
    ];

    const pipelineData = [
      { $match: { status: "delivered" } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "productvariants",
          localField: "items.variant",
          foreignField: "_id",
          as: "variantDoc",
        },
      },
      { $unwind: { path: "$variantDoc", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: {
            $cond: [
              { $ifNull: ["$variantDoc.product", false] },
              "$variantDoc.product",
              "unknown_product",
            ],
          },
          soldCount: { $sum: "$items.quantity" },
          revenue: { $sum: "$items.total" },
        },
      },
      { $match: { _id: { $ne: "unknown_product" } } },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDoc",
        },
      },
      { $unwind: { path: "$productDoc", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          productId: "$_id",
          name: "$productDoc.name",
          image: { $arrayElemAt: ["$productDoc.images", 0] },
          soldCount: 1,
          revenue: 1,
        },
      },
      { $sort: { [sortField]: sortOrder } },
      { $skip: skip },
      { $limit: limit },
    ];

    const [countResult, dataResult] = await Promise.all([
      Order.aggregate(pipelineCount),
      Order.aggregate(pipelineData),
    ]);

    const total = countResult[0] ? countResult[0].total : 0;

    return {
      total,
      products: dataResult,
    };
  }

  async getCouponsStats(
    sortField = "usedCount",
    sortOrder = -1,
    page = 1,
    limit = 10,
  ) {
    const skip = (page - 1) * limit;

    const pipelineCount = [
      {
        $match: {
          status: "delivered",
          "coupon.code": { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: "$coupon.code",
        },
      },
      { $count: "total" },
    ];

    const pipelineData = [
      {
        $match: {
          status: "delivered",
          "coupon.code": { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: "$coupon.code",
          usedCount: { $sum: 1 },
          totalDiscount: { $sum: "$pricing.discount" },
        },
      },
      {
        $lookup: {
          from: "coupons",
          localField: "_id",
          foreignField: "code",
          as: "couponDoc",
        },
      },
      { $unwind: { path: "$couponDoc", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          code: "$_id",
          discountType: "$couponDoc.discountType",
          discountValue: "$couponDoc.discountValue",
          usedCount: 1,
          totalDiscount: 1,
        },
      },
      { $sort: { [sortField]: sortOrder } },
      { $skip: skip },
      { $limit: limit },
    ];

    const [countResult, dataResult] = await Promise.all([
      Order.aggregate(pipelineCount),
      Order.aggregate(pipelineData),
    ]);

    const total = countResult[0] ? countResult[0].total : 0;

    return {
      total,
      coupons: dataResult,
    };
  }
}

module.exports = AnalyticsRepository;
