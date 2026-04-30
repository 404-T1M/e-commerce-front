const AppError = require("../../../core/errors/appError");
const {
  assertAdminPermission,
} = require("../../../core/authorization/checkAdminAndHisPermission");
const AnalyticsRepository = require("../repositories/analyticsRepository");

const VALID_SORTS = {
  active_asc: { field: "activeOrders", order: 1 },
  active_desc: { field: "activeOrders", order: -1 },
  cancelled_asc: { field: "cancelledOrders", order: 1 },
  cancelled_desc: { field: "cancelledOrders", order: -1 },
  completed_asc: { field: "completedOrders", order: 1 },
  completed_desc: { field: "completedOrders", order: -1 },
  spent_asc: { field: "totalSpent", order: 1 },
  spent_desc: { field: "totalSpent", order: -1 },
};

class GetCustomerReportUseCase {
  constructor() {
    this.analyticsRepository = new AnalyticsRepository();
  }

  async execute(loggedInUser, { sort, page = 1, limit = 10 } = {}) {
    await assertAdminPermission(loggedInUser, "reports.customers");

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 10);

    let sortField = "totalSpent";
    let sortOrder = -1;

    if (sort) {
      if (!VALID_SORTS[sort]) {
        throw new AppError(
          `Invalid sort value. Valid options: ${Object.keys(VALID_SORTS).join(", ")}`,
          400
        );
      }
      sortField = VALID_SORTS[sort].field;
      sortOrder = VALID_SORTS[sort].order;
    }

    const { total, customers } = await this.analyticsRepository.getUsersOrderStats(
      sortField,
      sortOrder,
      pageNum,
      limitNum
    );

    return { total, page: pageNum, limit: limitNum, customers };
  }
}

module.exports = GetCustomerReportUseCase;
