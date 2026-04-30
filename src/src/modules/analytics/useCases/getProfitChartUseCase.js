const {
  assertAdminPermission,
} = require("../../../core/authorization/checkAdminAndHisPermission");
const AnalyticsRepository = require("../repositories/analyticsRepository");

class GetProfitChartUseCase {
  constructor() {
    this.analyticsRepository = new AnalyticsRepository();
  }

  async execute(loggedInUser, { year } = {}) {
    await assertAdminPermission(loggedInUser, "reports.profit");

    const targetYear = Number(year) || new Date().getFullYear();

    const chart = await this.analyticsRepository.getProfitByMonth(targetYear);

    return { year: targetYear, chart };
  }
}

module.exports = GetProfitChartUseCase;
