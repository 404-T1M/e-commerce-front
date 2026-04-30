const AppError = require("../../../core/errors/appError");
const {
  assertAdminPermission,
} = require("../../../core/authorization/checkAdminAndHisPermission");
const AnalyticsRepository = require("../repositories/analyticsRepository");

class GetProfitReportUseCase {
  constructor() {
    this.analyticsRepository = new AnalyticsRepository();
  }

  async execute(loggedInUser, { startDate, endDate } = {}) {
    await assertAdminPermission(loggedInUser, "reports.profit");

    if (!startDate || !endDate) {
      throw new AppError("startDate and endDate are required", 400);
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new AppError("Invalid date format", 400);
    }

    if (start > end) {
      throw new AppError("startDate must be before endDate", 400);
    }

    end.setUTCHours(23, 59, 59, 999);

    const stats = await this.analyticsRepository.getOrdersStatsByDateRange(
      start,
      end
    );

    return {
      startDate: start.toISOString().split("T")[0],
      endDate: new Date(endDate).toISOString().split("T")[0],
      ...stats,
    };
  }
}

module.exports = GetProfitReportUseCase;
