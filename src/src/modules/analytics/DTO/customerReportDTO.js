class CustomerReportItemDTO {
  constructor(item) {
    this.user = {
      id: item.user._id,
      name: item.user.name,
      email: item.user.email,
    };
    this.activeOrders = item.activeOrders;
    this.completedOrders = item.completedOrders;
    this.cancelledOrders = item.cancelledOrders;
    this.totalSpent = item.totalSpent;
  }
}

class CustomerReportDTO {
  constructor(data) {
    this.total = data.total;
    this.page = data.page;
    this.limit = data.limit;
    this.customers = data.customers.map((c) => new CustomerReportItemDTO(c));
  }
}

module.exports = CustomerReportDTO;
