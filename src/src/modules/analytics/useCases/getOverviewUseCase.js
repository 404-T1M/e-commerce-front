const {
  assertAdminPermission,
} = require("../../../core/authorization/checkAdminAndHisPermission");
const AnalyticsRepository = require("../repositories/analyticsRepository");

const ACTIVE_STATUSES = ["confirmed", "processing", "shipped"];

class GetOverviewUseCase {
  constructor() {
    this.analyticsRepository = new AnalyticsRepository();
  }

  async execute(loggedInUser) {
    await assertAdminPermission(loggedInUser, "reports.overview");

    const [newOrders, activeOrders, completedOrders, totalCustomers, topSpenders] =
      await Promise.all([
        this.analyticsRepository.countOrdersByStatus("pending"),
        this.analyticsRepository.countOrdersByStatus(ACTIVE_STATUSES),
        this.analyticsRepository.countOrdersByStatus("delivered"),
        this.analyticsRepository.countUsers(),
        this.analyticsRepository.getUsersOrderStats("totalSpent", -1, 1, 5),
      ]);

    return {
      newOrders,
      activeOrders,
      completedOrders,
      totalCustomers,
      incomingMessages: 0,
      topCustomers: topSpenders.customers,
    };
  }
}

module.exports = GetOverviewUseCase;
