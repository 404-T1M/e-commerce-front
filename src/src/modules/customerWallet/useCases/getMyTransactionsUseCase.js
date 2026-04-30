const WalletRepository = require("../repositories/walletRepository");
const WalletTransactionRepository = require("../repositories/walletTransactionRepository");

class GetMyTransactionsUseCase {
  constructor() {
    this.walletRepository = new WalletRepository();
    this.transactionRepository = new WalletTransactionRepository();
  }

  async execute(loggedInUser, page = 1, limit = 10, type) {
    const { transactions, total } = await this.transactionRepository.find(
      { user: loggedInUser.id },
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

module.exports = GetMyTransactionsUseCase;
