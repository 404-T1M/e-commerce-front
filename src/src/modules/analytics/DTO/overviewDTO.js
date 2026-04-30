class OverviewDTO {
  constructor(data) {
    this.newOrders = data.newOrders;
    this.activeOrders = data.activeOrders;
    this.completedOrders = data.completedOrders;
    this.totalCustomers = data.totalCustomers;
    this.incomingMessages = data.incomingMessages;
    this.topCustomers = data.topCustomers;
  }
}

module.exports = OverviewDTO;
