const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

const createEmployee = async (name, email, password) => {
  const hash = await bcrypt.hash(password, 10);
  const [result] = await pool.execute(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [name.trim(), email.toLowerCase().trim(), hash, 'employee']
  );
  return { id: result.insertId, name: name.trim(), email: email.toLowerCase().trim(), role: 'employee' };
};

const getEmployees = async (filters = {}) => {
  let sql = 'SELECT id, name, email, role, is_active, created_at FROM users WHERE 1=1';
  const params = [];

  if (filters.name) {
    sql += ' AND name LIKE ?';
    params.push(`%${filters.name}%`);
  }

  if (filters.email) {
    sql += ' AND email LIKE ?';
    params.push(`%${filters.email}%`);
  }

  if (filters.role) {
    sql += ' AND role = ?';
    params.push(filters.role);
  }

  if (filters.is_active !== undefined && filters.is_active !== '') {
    sql += ' AND is_active = ?';
    params.push(filters.is_active === 'true' || filters.is_active === true ? 1 : 0);
  }

  sql += ' ORDER BY created_at DESC';

  const [rows] = await pool.execute(sql, params);
  return rows;
};

const toggleEmployeeStatus = async (id) => {
  const [rows] = await pool.execute('SELECT is_active FROM users WHERE id = ? AND role = ?', [id, 'employee']);
  if (!rows.length) throw { status: 404, message: 'Employee not found.' };
  const newStatus = rows[0].is_active ? 0 : 1;
  await pool.execute('UPDATE users SET is_active = ? WHERE id = ?', [newStatus, id]);
  return { id, is_active: Boolean(newStatus) };
};

module.exports = { createEmployee, getEmployees, toggleEmployeeStatus };
