const AppError = require("../../../core/errors/appError");
const WalletRepository = require("../repositories/walletRepository");
const WalletTransactionRepository = require("../repositories/walletTransactionRepository");

class DebitWalletUseCase {
  constructor() {
    this.walletRepository = new WalletRepository();
    this.transactionRepository = new WalletTransactionRepository();
  }

  async execute(userId, { amount, referenceId, note }) {
    const walletBefore = await this.walletRepository.findOne({ user: userId });
    if (!walletBefore) {
      throw new AppError("Wallet not found", 404);
    }

    if (walletBefore.balance < amount) {
      throw new AppError("Insufficient wallet balance", 400);
    }

    const wallet = await this.walletRepository.debit(userId, amount);
    if (!wallet) {
      throw new AppError("Insufficient wallet balance", 400);
    }

    const transaction = await this.transactionRepository.create({
      wallet: wallet._id,
      user: userId,
      type: "purchase",
      amount,
      balanceBefore: walletBefore.balance,
      balanceAfter: wallet.balance,
      status: "completed",
      paymentMethod: "wallet",
      referenceId,
      note: note ?? "Order payment",
      performedBy: userId,
    });

    return { wallet, transaction };
  }
}

module.exports = DebitWalletUseCase;
