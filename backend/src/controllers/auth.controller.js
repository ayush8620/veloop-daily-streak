const auth = require('../services/auth.service');

const ctx = (req) => ({ ip: req.ip, userAgent: req.get('user-agent') });

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  const data = await auth.register({ name, email, password }, ctx(req));
  res.status(201).json({ success: true, ...data });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const data = await auth.login({ email, password }, ctx(req));
  res.json({ success: true, ...data });
};

exports.me = async (req, res) => {
  res.json({ success: true, user: req.user.toPublic() });
};
