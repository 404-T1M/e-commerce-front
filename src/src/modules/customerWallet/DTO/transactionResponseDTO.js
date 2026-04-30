class TransactionResponseDTO {
  constructor(tx) {
    this.id = tx._id;
    this.type = tx.type;
    this.amount = tx.amount;
    this.balanceBefore = tx.balanceBefore;
    this.balanceAfter = tx.balanceAfter;
    this.status = tx.status;
    this.paymentMethod = tx.paymentMethod ?? null;
    this.referenceId = tx.referenceId ?? null;
    this.note = tx.note ?? null;
    this.performedBy = tx.performedBy
      ? {
          id: tx.performedBy._id ?? tx.performedBy,
          name: tx.performedBy.name ?? null,
        }
      : null;
    this.createdAt = tx.createdAt;
  }
}

module.exports = TransactionResponseDTO;
