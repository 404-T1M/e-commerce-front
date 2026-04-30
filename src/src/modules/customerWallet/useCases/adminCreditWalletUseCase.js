const AppError = require("../../../core/errors/appError");
const WalletRepository = require("../repositories/walletRepository");
const WalletTransactionRepository = require("../repositories/walletTransactionRepository");
const userRepository = require("../../users/repositories/userRepository");
const {
  assertAdminPermission,
} = require("../../../core/authorization/checkAdminAndHisPermission");

class AdminCreditWalletUseCase {
  constructor() {
    this.walletRepository = new WalletRepository();
    this.transactionRepository = new WalletTransactionRepository();
    this.userRepository = new userRepository();
  }

  async execute(adminUser, { userId, amount, note }) {
    await assertAdminPermission(adminUser, "wallet.credit");

    if (!amount || amount <= 0) {
      throw new AppError("Amount must be greater than 0", 400);
    }

    const targetUser = await this.userRepository.findOne({
      _id: userId,
      isDeleted: false,
    });
    if (!targetUser) {
      throw new AppError("User not found", 404);
    }

    let walletBefore = await this.walletRepository.findOne({ user: userId });
    if (!walletBefore) {
      walletBefore = await this.walletRepository.Create(userId);
    }

    const wallet = await this.walletRepository.credit(userId, amount);

    const transaction = await this.transactionRepository.create({
      wallet: wallet._id,
      user: userId,
      type: "bonus",
      amount,
      balanceBefore: walletBefore.balance,
      balanceAfter: wallet.balance,
      status: "completed",
      paymentMethod: "admin",
      note: note ?? "Admin credit",
      performedBy: adminUser.id,
    });

    return { wallet, transaction };
  }
}

module.exports = AdminCreditWalletUseCase;
