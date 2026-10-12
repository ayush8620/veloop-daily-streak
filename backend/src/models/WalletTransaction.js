const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema(
  {
    transactionId: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    rewardType: { type: String, enum: ['VES', 'GIFT_CARD'], required: true },
    currency: { type: String, enum: ['VES', 'INR'], required: true },
    type: { type: String, enum: ['CREDIT', 'DEBIT'], default: 'CREDIT' },
    amount: { type: Number, required: true },
    source: { type: String, default: 'DAILY_STREAK' },
    streakDay: { type: Number },
    cycleId: { type: String },
    referenceId: { type: String, required: true, unique: true },
    balanceBefore: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    status: { type: String, enum: ['SUCCESS', 'FAILED'], default: 'SUCCESS' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WalletTransaction', walletTransactionSchema);
