const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const login = async (email, password, allowedRoles = null) => {
  const [rows] = await pool.execute(
    'SELECT * FROM users WHERE email = ? AND is_active = 1',
    [email.toLowerCase().trim()]
  );
  if (!rows.length) throw { status: 401, message: 'Invalid email or password.' };

  const user = rows[0];

  // Role gate — must be checked BEFORE password to avoid role enumeration
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    throw {
      status: 403,
      message: 'Access denied. This portal is not available for your account type.',
    };
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw { status: 401, message: 'Invalid email or password.' };

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  });

  const { password: _, ...safeUser } = user;
  return { token, user: safeUser };
};

const updatePassword = async (userId, currentPassword, newPassword) => {
  const [rows] = await pool.execute(
    'SELECT password FROM users WHERE id = ? AND is_active = 1',
    [userId]
  );
  if (!rows.length) throw { status: 404, message: 'User not found or inactive.' };

  const match = await bcrypt.compare(currentPassword, rows[0].password);
  if (!match) throw { status: 400, message: 'Incorrect current password.' };

  const hash = await bcrypt.hash(newPassword, 10);
  await pool.execute('UPDATE users SET password = ? WHERE id = ?', [hash, userId]);
  return { success: true, message: 'Password updated successfully.' };
};

module.exports = { login, updatePassword };

