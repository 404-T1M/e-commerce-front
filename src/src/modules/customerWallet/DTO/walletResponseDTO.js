class WalletResponseDTO {
  constructor(wallet) {
    this.id = wallet._id;
    this.balance = wallet.balance;
    this.updatedAt = wallet.updatedAt;
  }
}

module.exports = WalletResponseDTO;
