const approvalService = require('../services/approvalService');

const approve = async (req, res, next) => {
  try {
    await approvalService.approve(req.params.id, req.user, req.body.comments);
    res.json({ success: true, message: 'Form approved successfully.' });
  } catch (err) { next(err); }
};

const reject = async (req, res, next) => {
  try {
    if (!req.body.comments?.trim())
      return res.status(400).json({ success: false, message: 'Comments are required when rejecting.' });
    await approvalService.reject(req.params.id, req.user, req.body.comments);
    res.json({ success: true, message: 'Form rejected.' });
  } catch (err) { next(err); }
};

module.exports = { approve, reject };
