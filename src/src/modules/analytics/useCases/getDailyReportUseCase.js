const {
  assertAdminPermission,
} = require("../../../core/authorization/checkAdminAndHisPermission");
const AnalyticsRepository = require("../repositories/analyticsRepository");

class GetDailyReportUseCase {
  constructor() {
    this.analyticsRepository = new AnalyticsRepository();
  }

  async execute(loggedInUser) {
    await assertAdminPermission(loggedInUser, "reports.daily");

    const now = new Date();
    const startOfDay = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0)
    );
    const endOfDay = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999)
    );

    const stats = await this.analyticsRepository.getOrdersStatsByDateRange(
      startOfDay,
      endOfDay
    );

    return {
      date: now.toISOString().split("T")[0],
      ...stats,
    };
  }
}

module.exports = GetDailyReportUseCase;
