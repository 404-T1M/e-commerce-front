const AppError = require("../../../core/errors/appError");
const WalletRepository = require("../repositories/walletRepository");
const WalletTransactionRepository = require("../repositories/walletTransactionRepository");

class RefundWalletUseCase {
  constructor() {
    this.walletRepository = new WalletRepository();
    this.transactionRepository = new WalletTransactionRepository();
  }

  async execute(userId, { amount, referenceId, note, performedBy }) {
    if (!amount || amount <= 0) {
      throw new AppError("Refund amount must be greater than 0", 400);
    }

    let walletBefore = await this.walletRepository.findOne({ user: userId });
    if (!walletBefore) {
      walletBefore = await this.walletRepository.Create(userId);
    }

    const wallet = await this.walletRepository.credit(userId, amount);

    const transaction = await this.transactionRepository.create({
      wallet: wallet._id,
      user: userId,
      type: "refund",
      amount,
      balanceBefore: walletBefore.balance,
      balanceAfter: wallet.balance,
      status: "completed",
      paymentMethod: "wallet",
      referenceId,
      note: note ?? "Order refund",
      performedBy,
    });

    return { wallet, transaction };
  }
}

module.exports = RefundWalletUseCase;
