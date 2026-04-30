const WalletTransaction = require("../model/walletTransactionModel");

class WalletTransactionRepository {
  async create(data) {
    return await WalletTransaction.create(data);
  }

  async findOne(filter) {
    return await WalletTransaction.findOne(filter).populate(
      "performedBy",
      "name email",
    );
  }

  async find(filter, type, page = 1, limit = 10) {
    const query = filter;
    if (type) query.type = type;

    const skip = (page - 1) * limit;
    const [transactions, total] = await Promise.all([
      WalletTransaction.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("performedBy", "name email"),
      WalletTransaction.countDocuments(query),
    ]);
    return { transactions, total };
  }

  async updateStatus(id, status) {
    return await WalletTransaction.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );
  }
}

module.exports = WalletTransactionRepository;
