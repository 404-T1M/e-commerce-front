class OrderStatsReportDTO {
  constructor(data) {
    this.date = data.date ?? null;
    this.startDate = data.startDate ?? null;
    this.endDate = data.endDate ?? null;
    this.totalOrders = data.totalOrders;
    this.totalItemsSold = data.totalItemsSold;
    this.totalRevenue = data.totalRevenue;
    this.totalProfit = data.totalProfit;
  }
}

module.exports = OrderStatsReportDTO;
