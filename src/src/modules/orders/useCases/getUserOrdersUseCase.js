const OrderRepository = require("../repositories/orderRepository");

class GetUserOrdersUseCase {
  constructor() {
    this.orderRepository = new OrderRepository();
  }

  async execute(loggedInUser, { page = 1, limit = 10, sort: sortParam, status }) {
    const filter = { user: loggedInUser.id };
    if (status) filter.status = status;

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 10);

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
    };
    const sort = sortMap[sortParam] || { createdAt: -1 };

    const { orders, total } = await this.orderRepository.find(
      filter,
      pageNum,
      limitNum,
      sort,
    );

    return {
      orders,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    };
  }
}

module.exports = GetUserOrdersUseCase;
