const AppError = require("../../../core/errors/appError");
const WalletRepository = require("../repositories/walletRepository");
const WalletTransactionRepository = require("../repositories/walletTransactionRepository");

class ConfirmTopUpUseCase {
  constructor() {
    this.walletRepository = new WalletRepository();
    this.transactionRepository = new WalletTransactionRepository();
  }

  async execute(transactionId, referenceId) {
    const transaction = await this.transactionRepository.findOne({
      _id: transactionId,
    });
    if (!transaction) {
      throw new AppError("Transaction not found", 404);
    }

    if (transaction.type !== "topUp") {
      throw new AppError("Transaction is not a top-up", 400);
    }

    if (transaction.status !== "pending") {
      throw new AppError(`Transaction is already ${transaction.status}`, 400);
    }

    const wallet = await this.walletRepository.credit(
      transaction.user,
      transaction.amount,
    );

    transaction.status = "completed";
    transaction.referenceId = referenceId;
    transaction.balanceAfter = wallet.balance;
    await transaction.save();

    return { transaction, wallet };
  }
}

module.exports = ConfirmTopUpUseCase;
