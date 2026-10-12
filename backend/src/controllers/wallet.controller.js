const wallet = require('../services/wallet.service');
const transactions = require('../services/transaction.service');

exports.getWallet = async (req, res) => {
  const w = await wallet.getOrCreateWallet(req.user._id);
  res.json({ success: true, wallet: wallet.toPublicWallet(w) });
};

exports.listTransactions = async (req, res) => {
  const data = await transactions.listForUser(req.user._id, { page: req.query.page || 1, limit: req.query.limit || 20 });
  res.json({ success: true, ...data });
};
