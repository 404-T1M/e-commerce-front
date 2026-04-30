class ProfitChartMonthDTO {
  constructor(monthData) {
    this.month = monthData.month;
    this.revenue = monthData.revenue;
    this.profit = monthData.profit;
  }
}

class ProfitChartDTO {
  constructor(data) {
    this.year = data.year;
    this.chart = data.chart.map((m) => new ProfitChartMonthDTO(m));
  }
}

module.exports = ProfitChartDTO;
