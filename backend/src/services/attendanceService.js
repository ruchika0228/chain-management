const { pool } = require('../config/db');

/* ── helpers ─────────────────────────────────────────────── */

const transformAttendance = (row) => ({
  ...row,
  status: row.status === 'leave' ? 'Leave' : row.status.charAt(0).toUpperCase() + row.status.slice(1),
});

/* ── attendance service ──────────────────────────────────── */

const getAttendanceByMonth = async (userId, year, month) => {
  // Get first and last date of the month
  const firstDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDate = `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`;
  
  const [rows] = await pool.execute(
    `SELECT a.*, u.name AS user_name
     FROM attendance a
     JOIN users u ON u.id = a.user_id
     WHERE a.user_id = ? AND a.attendance_date BETWEEN ? AND ?
     ORDER BY a.attendance_date ASC`,
    [userId, firstDate, lastDate]
  );
  
  return rows.map(transformAttendance);
};

const getAttendanceByDateRange = async (userId, startDate, endDate) => {
  const [rows] = await pool.execute(
    `SELECT a.*, u.name AS user_name
     FROM attendance a
     JOIN users u ON u.id = a.user_id
     WHERE a.user_id = ? AND a.attendance_date BETWEEN ? AND ?
     ORDER BY a.attendance_date ASC`,
    [userId, startDate, endDate]
  );
  
  return rows.map(transformAttendance);
};

const createOrUpdateAttendance = async (userId, attendanceDate, status, checkIn, checkOut) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    
    // Check if attendance exists for this date
    const [existing] = await conn.execute(
      'SELECT id FROM attendance WHERE user_id = ? AND attendance_date = ?',
      [userId, attendanceDate]
    );
    
    if (existing.length > 0) {
      // Update existing
      await conn.execute(
        `UPDATE attendance 
         SET status = ?, check_in = ?, check_out = ?
         WHERE user_id = ? AND attendance_date = ?`,
        [status, checkIn || null, checkOut || null, userId, attendanceDate]
      );
    } else {
      // Insert new
      await conn.execute(
        `INSERT INTO attendance (user_id, attendance_date, status, check_in, check_out)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, attendanceDate, status, checkIn || null, checkOut || null]
      );
    }
    
    await conn.commit();
    return { success: true, message: 'Attendance recorded successfully.' };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

const getMonthlyStats = async (userId, year, month) => {
  const firstDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDate = `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`;
  
  const [stats] = await pool.execute(
    `SELECT 
       COUNT(*) AS total_days,
       SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) AS present,
       SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) AS absent,
       SUM(CASE WHEN status = 'leave' THEN 1 ELSE 0 END) AS leave
     FROM attendance 
     WHERE user_id = ? AND attendance_date BETWEEN ? AND ?`,
    [userId, firstDate, lastDate]
  );
  
  return stats[0];
};

/* ── holiday service ─────────────────────────────────────── */

const getAllHolidays = async () => {
  const [rows] = await pool.execute(
    'SELECT * FROM holidays ORDER BY holiday_date ASC'
  );
  return rows;
};

const addHoliday = async (name, holidayDate, createdBy) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    
    // Check if holiday already exists on this date
    const [existing] = await conn.execute(
      'SELECT id FROM holidays WHERE holiday_date = ?',
      [holidayDate]
    );
    
    if (existing.length > 0) {
      throw { status: 400, message: 'A holiday already exists on this date.' };
    }
    
    await conn.execute(
      'INSERT INTO holidays (name, holiday_date, created_by) VALUES (?, ?, ?)',
      [name, holidayDate, createdBy]
    );
    
    await conn.commit();
    return { success: true, message: 'Holiday added successfully.' };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

const deleteHoliday = async (holidayId) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    
    const [result] = await conn.execute(
      'DELETE FROM holidays WHERE id = ?',
      [holidayId]
    );
    
    if (result.affectedRows === 0) {
      throw { status: 404, message: 'Holiday not found.' };
    }
    
    await conn.commit();
    return { success: true, message: 'Holiday deleted successfully.' };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

/* ── check if date is holiday ─────────────────────────────── */

const isHoliday = async (date) => {
  const [row] = await pool.execute(
    'SELECT id, name FROM holidays WHERE holiday_date = ?',
    [date]
  );
  return row.length > 0 ? row[0] : null;
};

module.exports = {
  getAttendanceByMonth,
  getAttendanceByDateRange,
  createOrUpdateAttendance,
  getMonthlyStats,
  getAllHolidays,
  addHoliday,
  deleteHoliday,
  isHoliday,
};
