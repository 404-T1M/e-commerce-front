const WalletRepository = require("../repositories/walletRepository");

class GetMyWalletUseCase {
  constructor() {
    this.walletRepository = new WalletRepository();
  }

  async execute(loggedInUser) {
    let wallet = await this.walletRepository.findOne({ user: loggedInUser.id });
    if (!wallet) {
      wallet = await this.walletRepository.Create(loggedInUser.id);
    }
    return wallet;
  }
}

module.exports = GetMyWalletUseCase;
