const AppError = require("../../../core/errors/appError");
const {
  assertAdminPermission,
} = require("../../../core/authorization/checkAdminAndHisPermission");
const AnalyticsRepository = require("../repositories/analyticsRepository");

class GetCouponsStatesUseCase {
  constructor() {
    this.analyticsRepository = new AnalyticsRepository();
  }

  async execute(loggedInUser, queryParams) {
    await assertAdminPermission(loggedInUser, "reports.coupons");

    const allowedSortFields = ["usedCount", "totalDiscount"];
    const sortField = queryParams.sortBy || "usedCount";
    if (!allowedSortFields.includes(sortField)) {
      throw new AppError(
        `Invalid sortBy value: ${sortField}. Allowed values: ${allowedSortFields.join(", ")}`,
        400,
      );
    }

    const sortOrder = queryParams.sortOrder === "asc" ? 1 : -1;
    const page = parseInt(queryParams.page, 10) || 1;
    const limit = parseInt(queryParams.limit, 10) || 10;

    return await this.analyticsRepository.getCouponsStats(
      sortField,
      sortOrder,
      page,
      limit,
    );
  }
}

module.exports = GetCouponsStatesUseCase;
