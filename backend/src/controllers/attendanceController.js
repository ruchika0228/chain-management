const attendanceService = require('../services/attendanceService');

/* ── attendance controller ───────────────────────────────── */

const getAttendanceByMonth = async (req, res, next) => {
  try {
    const { year, month } = req.params;
    const userId = req.user.id;
    
    const data = await attendanceService.getAttendanceByMonth(userId, parseInt(year), parseInt(month));
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getAttendanceByDateRange = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user.id;
    
    const data = await attendanceService.getAttendanceByDateRange(userId, startDate, endDate);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const createOrUpdateAttendance = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { attendanceDate, status, checkIn, checkOut } = req.body;
    
    if (!attendanceDate || !status) {
      throw { status: 400, message: 'Attendance date and status are required.' };
    }
    
    const data = await attendanceService.createOrUpdateAttendance(userId, attendanceDate, status, checkIn, checkOut);
    res.json({ success: true, message: data.message });
  } catch (err) { next(err); }
};

const getMonthlyStats = async (req, res, next) => {
  try {
    const { year, month } = req.params;
    const userId = req.user.id;
    
    const data = await attendanceService.getMonthlyStats(userId, parseInt(year), parseInt(month));
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

/* ── holiday controller ──────────────────────────────────── */

const getAllHolidays = async (req, res, next) => {
  try {
    const data = await attendanceService.getAllHolidays();
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const addHoliday = async (req, res, next) => {
  try {
    const { name, date } = req.body;
    const createdBy = req.user.id;
    
    if (!name || !date) {
      throw { status: 400, message: 'Holiday name and date are required.' };
    }
    
    const data = await attendanceService.addHoliday(name, date, createdBy);
    res.json({ success: true, message: data.message });
  } catch (err) { next(err); }
};

const deleteHoliday = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const data = await attendanceService.deleteHoliday(parseInt(id));
    res.json({ success: true, message: data.message });
  } catch (err) { next(err); }
};

const checkIsHoliday = async (req, res, next) => {
  try {
    const { date } = req.params;
    
    const data = await attendanceService.isHoliday(date);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

module.exports = {
  getAttendanceByMonth,
  getAttendanceByDateRange,
  createOrUpdateAttendance,
  getMonthlyStats,
  getAllHolidays,
  addHoliday,
  deleteHoliday,
  checkIsHoliday,
};
