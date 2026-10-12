const { Wallet } = require('../models');

const balanceField = (currency) => (currency === 'INR' ? 'giftCardBalanceINR' : 'vesBalance');

async function getOrCreateWallet(userId) {
  return Wallet.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();
}

// Atomic credit inside the caller's transaction. Returns { before, after }.
async function credit(userId, currency, amount, session) {
  const field = balanceField(currency);
  const wallet = await Wallet.findOneAndUpdate(
    { userId },
    { $inc: { [field]: amount } },
    { upsert: true, new: true, setDefaultsOnInsert: true, session }
  );
  const after = wallet[field];
  return { before: after - amount, after };
}

const toPublicWallet = (w) => ({ ves: w ? w.vesBalance : 0, giftCardINR: w ? w.giftCardBalanceINR : 0 });

module.exports = { getOrCreateWallet, credit, toPublicWallet, balanceField };
