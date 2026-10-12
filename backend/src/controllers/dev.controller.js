const clock = require('../utils/clock');

exports.getTime = (req, res) => res.json({ success: true, serverTime: clock.now(), offsetMs: clock.getOffset() });

exports.timeTravel = (req, res) => {
  clock.setOffset(clock.getOffset() + Number(req.body.hours) * 60 * 60 * 1000);
  res.json({ success: true, serverTime: clock.now(), offsetMs: clock.getOffset() });
};

exports.resetTime = (req, res) => {
  clock.setOffset(0);
  res.json({ success: true, serverTime: clock.now(), offsetMs: 0 });
};
