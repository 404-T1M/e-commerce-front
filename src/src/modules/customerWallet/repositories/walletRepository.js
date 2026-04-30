const Wallet = require("../model/customerWalletModel");

class WalletRepository {
  async findOne(filter) {
    return await Wallet.findOne(filter).populate("user", "name email");
  }

  async Create(userId) {
    return await Wallet.create({ user: userId });
  }

  async credit(userId, amount) {
    return await Wallet.findOneAndUpdate(
      { user: userId },
      { $inc: { balance: amount } },
      { new: true, upsert: true },
    );
  }

  async debit(userId, amount) {
    return await Wallet.findOneAndUpdate(
      { user: userId, balance: { $gte: amount } },
      { $inc: { balance: -amount } },
      { new: true },
    );
  }
}

module.exports = WalletRepository;
