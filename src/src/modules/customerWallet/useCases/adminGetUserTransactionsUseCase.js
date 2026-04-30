const AppError = require("../../../core/errors/appError");
const WalletTransactionRepository = require("../repositories/walletTransactionRepository");
const userRepository = require("../../users/repositories/userRepository");
const {
  assertAdminPermission,
} = require("../../../core/authorization/checkAdminAndHisPermission");

class AdminGetUserTransactionsUseCase {
  constructor() {
    this.transactionRepository = new WalletTransactionRepository();
    this.userRepository = new userRepository();
  }

  async execute(adminUser, userId, { type, page = 1, limit = 10 }) {
    await assertAdminPermission(adminUser, "customerWallet.list");

    const user = await this.userRepository.findOne({
      _id: userId,
      isDeleted: false,
    });
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const { transactions, total } = await this.transactionRepository.find(
      { user: userId },
      type,
      page,
      limit,
    );

    return {
      transactions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }
}

module.exports = AdminGetUserTransactionsUseCase;
