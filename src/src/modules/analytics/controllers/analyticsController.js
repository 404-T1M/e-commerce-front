const catchAsync = require("../../../shared/utils/catchAsync");
const GetOverviewUseCase = require("../useCases/getOverviewUseCase");
const GetProfitChartUseCase = require("../useCases/getProfitChartUseCase");
const GetDailyReportUseCase = require("../useCases/getDailyReportUseCase");
const GetProfitReportUseCase = require("../useCases/getProfitReportUseCase");
const GetCustomerReportUseCase = require("../useCases/getCustomerReportUseCase");
const GetProductStatesUseCase = require("../useCases/getProductStatesUseCase");
const GetCouponsStatesUseCase = require("../useCases/getCouponsStatesUseCase");
const OverviewDTO = require("../DTO/overviewDTO");
const ProfitChartDTO = require("../DTO/profitChartDTO");
const OrderStatsReportDTO = require("../DTO/orderStatsReportDTO");
const CustomerReportDTO = require("../DTO/customerReportDTO");

class AnalyticsController {
  constructor() {
    this.getOverviewUseCase = new GetOverviewUseCase();
    this.getProfitChartUseCase = new GetProfitChartUseCase();
    this.getDailyReportUseCase = new GetDailyReportUseCase();
    this.getProfitReportUseCase = new GetProfitReportUseCase();
    this.getCustomerReportUseCase = new GetCustomerReportUseCase();
    this.getProductStatesUseCase = new GetProductStatesUseCase();
    this.getCouponsStatesUseCase = new GetCouponsStatesUseCase();
  }

  getOverview = catchAsync(async (req, res, next) => {
    const data = await this.getOverviewUseCase.execute(req.user);
    res.status(200).json({ message: "Success", ...new OverviewDTO(data) });
  });

  getProfitChart = catchAsync(async (req, res, next) => {
    const data = await this.getProfitChartUseCase.execute(req.user, req.query);
    res.status(200).json({ message: "Success", ...new ProfitChartDTO(data) });
  });

  getDailyReport = catchAsync(async (req, res, next) => {
    const data = await this.getDailyReportUseCase.execute(req.user);
    res.status(200).json({ message: "Success", ...new OrderStatsReportDTO(data) });
  });

  getProfitReport = catchAsync(async (req, res, next) => {
    const data = await this.getProfitReportUseCase.execute(req.user, req.query);
    res.status(200).json({ message: "Success", ...new OrderStatsReportDTO(data) });
  });

  getCustomerReport = catchAsync(async (req, res, next) => {
    const data = await this.getCustomerReportUseCase.execute(
      req.user,
      req.query
    );
    res.status(200).json({ message: "Success", ...new CustomerReportDTO(data) });
  });

  getProductStats = catchAsync(async (req, res, next) => {
    const data = await this.getProductStatesUseCase.execute(
      req.user,
      req.query
    );
    res.status(200).json({ message: "Success", data });
  });

  getCouponStats = catchAsync(async (req, res, next) => {
    const data = await this.getCouponsStatesUseCase.execute(
      req.user,
      req.query
    );
    res.status(200).json({ message: "Success", data });
  });
}

module.exports = AnalyticsController;
