const { pool } = require('../config/db');

const createTask = async (userId, taskDescription) => {
  if (!taskDescription || !taskDescription.trim()) {
    throw { status: 422, message: 'Task description is required.' };
  }
  const [result] = await pool.execute(
    'INSERT INTO tasks (user_id, task_description) VALUES (?, ?)',
    [userId, taskDescription.trim()]
  );
  return { id: result.insertId };
};

const getTasks = async (filter, startDate, endDate, userId, role, employeeId) => {
  let query = `
    SELECT t.id, t.task_description, t.created_at,
           u.id AS user_id, u.name AS employee_name, u.email AS employee_email
    FROM tasks t
    JOIN users u ON u.id = t.user_id
    WHERE 1=1
  `;
  const params = [];

  // All roles may view the full team's task history (who did what).
  // When employee_id is supplied, scope to that single user — this is how the
  // attendance calendars fetch a single person's task-days (e.g. an employee
  // viewing only their OWN attendance).
  if (employeeId) {
    query += ' AND t.user_id = ?';
    params.push(employeeId);
  }

  if (filter === 'today') {
    query += ' AND DATE(t.created_at) = CURRENT_DATE';
  } else if (filter === 'yesterday') {
    query += ' AND DATE(t.created_at) = DATE_SUB(CURRENT_DATE, INTERVAL 1 DAY)';
  } else if (filter === 'week') {
    query += ' AND t.created_at >= NOW() - INTERVAL 7 DAY';
  } else if (filter === 'month') {
    query += ' AND t.created_at >= NOW() - INTERVAL 30 DAY';
  } else if (startDate && endDate) {
    query += ' AND DATE(t.created_at) BETWEEN ? AND ?';
    params.push(startDate, endDate);
  }

  query += ' ORDER BY t.created_at DESC';

  const [rows] = await pool.execute(query, params);
  return rows;
};

const getAttendance = async (date) => {
  const selectedDate = date || new Date().toISOString().split('T')[0];

  const [present] = await pool.execute(`
    SELECT DISTINCT u.id, u.name, u.email
    FROM users u
    JOIN tasks t ON t.user_id = u.id
    WHERE u.role = 'employee' AND u.is_active = 1 AND DATE(t.created_at) = ?
  `, [selectedDate]);

  const [absent] = await pool.execute(`
    SELECT u.id, u.name, u.email
    FROM users u
    WHERE u.role = 'employee' AND u.is_active = 1
    AND u.id NOT IN (
      SELECT DISTINCT t.user_id FROM tasks t WHERE DATE(t.created_at) = ?
    )
  `, [selectedDate]);

  return { date: selectedDate, present, absent };
};

const getEmployeeList = async () => {
  const [rows] = await pool.execute(
    'SELECT id, name, email FROM users WHERE role = ? AND is_active = 1 ORDER BY name ASC',
    ['employee']
  );
  return rows;
};

// Check if a date is a holiday (Sunday or 2nd/4th Saturday)
const _isHoliday = (date) => {
  const d = new Date(date);
  const dayOfWeek = d.getDay(); // 0=Sun, 6=Sat
  if (dayOfWeek === 0) return true;
  if (dayOfWeek === 6) {
    const weekOfMonth = Math.ceil(d.getDate() / 7);
    return weekOfMonth === 2 || weekOfMonth === 4;
  }
  return false;
};

// 30-day attendance report for a specific employee
const getAttendanceReport = async (employeeId) => {
  const [empRows] = await pool.execute(
    'SELECT id, name, email FROM users WHERE id = ? AND role = ?',
    [employeeId, 'employee']
  );
  if (!empRows.length) throw { status: 404, message: 'Employee not found.' };
  const employee = empRows[0];

  const [tasks] = await pool.execute(`
    SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS work_date
    FROM tasks
    WHERE user_id = ? AND DATE(created_at) >= DATE_SUB(CURRENT_DATE, INTERVAL 29 DAY)
    GROUP BY work_date
  `, [employeeId]);

  const taskDateSet = new Set(tasks.map(t => t.work_date));

  const report = [];
  let present = 0, absent = 0, holidays = 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    let status;
    if (_isHoliday(d)) {
      status = 'holiday';
      holidays++;
    } else {
      status = taskDateSet.has(dateStr) ? 'present' : 'absent';
      if (status === 'present') present++; else absent++;
    }

    report.push({ date: dateStr, status });
  }

  return { employee, summary: { present, absent, holidays }, report };
};

// Today's submission status for all employees
const getDailyStatus = async () => {
  const [employees] = await pool.execute(
    'SELECT id, name, email FROM users WHERE role = ? AND is_active = 1 ORDER BY name ASC',
    ['employee']
  );

  const [todayTasks] = await pool.execute(`
    SELECT user_id, created_at, task_description
    FROM tasks
    WHERE DATE(created_at) = CURRENT_DATE
  `);

  const taskMap = new Map(todayTasks.map(t => [t.user_id, t]));

  // Late if submitted at or after 18:00 server local time
  const LATE_HOUR = 18;

  return employees.map(emp => {
    const task = taskMap.get(emp.id);
    if (!task) return { ...emp, status: 'not_submitted', submitted_at: null };
    const hour = new Date(task.created_at).getHours();
    return {
      ...emp,
      status: hour >= LATE_HOUR ? 'late' : 'submitted',
      submitted_at: task.created_at,
    };
  });
};

// Employees who haven't submitted today (for 6 PM reminder)
const getPendingEmployees = async () => {
  const [rows] = await pool.execute(`
    SELECT u.id, u.name, u.email
    FROM users u
    WHERE u.role = 'employee' AND u.is_active = 1
    AND u.id NOT IN (
      SELECT DISTINCT t.user_id FROM tasks t WHERE DATE(t.created_at) = CURRENT_DATE
    )
  `);
  return rows;
};

module.exports = {
  createTask,
  getTasks,
  getAttendance,
  getEmployeeList,
  getAttendanceReport,
  getDailyStatus,
  getPendingEmployees,
};
