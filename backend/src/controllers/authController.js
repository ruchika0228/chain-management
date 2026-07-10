const authService = require('../services/authService');

const STAFF_ROLES    = ['admin', 'super_admin', 'moderator'];
const EMPLOYEE_ROLES = ['employee'];

/* ── Generic handler (used internally) ─── */
const _doLogin = async (res, next, email, password, allowedRoles) => {
  try {
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    const result = await authService.login(email, password, allowedRoles);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

/* ── Staff portal login (admin / super_admin / moderator) ─── */
const staffLogin = (req, res, next) =>
  _doLogin(res, next, req.body.email, req.body.password, STAFF_ROLES);

/* ── Employee portal login (employee only) ─── */
const employeeLogin = (req, res, next) =>
  _doLogin(res, next, req.body.email, req.body.password, EMPLOYEE_ROLES);

/* ── /auth/me ─── */
const me = (req, res) => res.json({ success: true, user: req.user });

/* ── Update Password ─── */
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All password fields are required.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'New password and confirmation do not match.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
    }

    const result = await authService.updatePassword(req.user.id, currentPassword, newPassword);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = { staffLogin, employeeLogin, me, updatePassword };

