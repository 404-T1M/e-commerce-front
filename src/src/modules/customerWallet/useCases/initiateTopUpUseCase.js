const AppError = require("../../../core/errors/appError");
const WalletRepository = require("../repositories/walletRepository");
const WalletTransactionRepository = require("../repositories/walletTransactionRepository");

const VALID_METHODS = ["fawry", "visa", "vodafone_cash", "instapay"];
const MIN_TOP_UP = 1;

class InitiateTopUpUseCase {
  constructor() {
    this.walletRepository = new WalletRepository();
    this.transactionRepository = new WalletTransactionRepository();
  }

  async execute(loggedInUser, { amount, paymentMethod }) {
    if (!amount || amount < MIN_TOP_UP) {
      throw new AppError(`Minimum top-up amount is ${MIN_TOP_UP}`, 400);
    }

    if (!VALID_METHODS.includes(paymentMethod)) {
      throw new AppError(
        `Invalid payment method. Allowed: ${VALID_METHODS.join(", ")}`,
        400,
      );
    }

    let wallet = await this.walletRepository.findOne({ user: loggedInUser.id });
    if (!wallet) {
      wallet = await this.walletRepository.Create(loggedInUser.id);
    }

    const transaction = await this.transactionRepository.create({
      wallet: wallet._id,
      user: loggedInUser.id,
      type: "topUp",
      amount,
      balanceBefore: wallet.balance,
      balanceAfter: wallet.balance + amount,
      status: "pending",
      paymentMethod,
      performedBy: loggedInUser.id,
    });

    return { transaction, wallet };
  }
}

module.exports = InitiateTopUpUseCase;
