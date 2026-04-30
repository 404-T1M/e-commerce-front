const catchAsync = require("../../../shared/utils/catchAsync");
const GetMyWalletUseCase = require("../useCases/getMyWalletUseCase");
const GetMyTransactionsUseCase = require("../useCases/getMyTransactionsUseCase");
const InitiateTopUpUseCase = require("../useCases/initiateTopUpUseCase");
const AdminCreditWalletUseCase = require("../useCases/adminCreditWalletUseCase");
const AdminGetUserTransactionsUseCase = require("../useCases/adminGetUserTransactionsUseCase");
const WalletResponseDTO = require("../DTO/walletResponseDTO");
const TransactionResponseDTO = require("../DTO/transactionResponseDTO");

class WalletController {
  constructor() {
    this.getMyWalletUseCase = new GetMyWalletUseCase();
    this.getMyTransactionsUseCase = new GetMyTransactionsUseCase();
    this.initiateTopUpUseCase = new InitiateTopUpUseCase();
    this.adminCreditWalletUseCase = new AdminCreditWalletUseCase();
    this.adminGetUserTransactionsUseCase =
      new AdminGetUserTransactionsUseCase();
  }

  getMyWallet = catchAsync(async (req, res) => {
    const wallet = await this.getMyWalletUseCase.execute(req.user);

    res.status(200).json({
      message: "Success",
      wallet: new WalletResponseDTO(wallet),
    });
  });

  getMyTransactions = catchAsync(async (req, res) => {
    const { page = 1, limit = 10, type } = req.query;

    const result = await this.getMyTransactionsUseCase.execute(
      req.user,
      Number(page),
      Number(limit),
      type,
    );

    res.status(200).json({
      message: "Success",
      ...result,
      transactions: result.transactions.map(
        (t) => new TransactionResponseDTO(t),
      ),
    });
  });

  initiateTopUp = catchAsync(async (req, res) => {
    const { amount, paymentMethod } = req.body;

    const { transaction, wallet } = await this.initiateTopUpUseCase.execute(
      req.user,
      { amount, paymentMethod },
    );

    res.status(201).json({
      message: "Top-up initiated. Complete payment to credit your wallet.",
      transaction: new TransactionResponseDTO(transaction),
      wallet: new WalletResponseDTO(wallet),
    });
  });

  adminGetUserTransactions = catchAsync(async (req, res) => {
    const { userId } = req.params;
    const { page = 1, limit = 10, type } = req.query;

    const result = await this.adminGetUserTransactionsUseCase.execute(req.user, userId, {
      type,
      page: Number(page),
      limit: Number(limit),
    });

    res.status(200).json({
      message: "Success",
      ...result,
      transactions: result.transactions.map(
        (t) => new TransactionResponseDTO(t),
      ),
    });
  });

  adminCreditWallet = catchAsync(async (req, res) => {
    const { userId, amount, note } = req.body;

    const { wallet, transaction } = await this.adminCreditWalletUseCase.execute(
      req.user,
      {
        userId,
        amount,
        note,
      },
    );

    res.status(200).json({
      message: "Wallet credited successfully",
      wallet: new WalletResponseDTO(wallet),
      transaction: new TransactionResponseDTO(transaction),
    });
  });
}

module.exports = WalletController;
