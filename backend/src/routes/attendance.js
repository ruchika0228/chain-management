const router  = require('express').Router();
const { authenticate }   = require('../middleware/auth');
const { requireRole }    = require('../middleware/roleCheck');
const attendanceCtrl = require('../controllers/attendanceController');

router.use(authenticate);

// ── Holiday endpoints (MUST come before /:year/:month to avoid param collision)
// GET    /api/attendance/holidays
// POST   /api/attendance/holidays        (admin/super_admin only)
// DELETE /api/attendance/holidays/:id    (admin/super_admin only)
// GET    /api/attendance/holidays/:date

router.get('/holidays',             attendanceCtrl.getAllHolidays);
router.post('/holidays',            requireRole('admin', 'super_admin'), attendanceCtrl.addHoliday);
router.delete('/holidays/:id',      requireRole('admin', 'super_admin'), attendanceCtrl.deleteHoliday);
router.get('/holidays/:date',       attendanceCtrl.checkIsHoliday);

// ── Attendance endpoints ──────────────────────────────────────
// Mounted at /api/attendance — paths below are relative to that prefix.
// GET  /api/attendance/range
// GET  /api/attendance/stats/:year/:month
// GET  /api/attendance/:year/:month
// POST /api/attendance

router.get('/range',                attendanceCtrl.getAttendanceByDateRange);
router.get('/stats/:year/:month',   attendanceCtrl.getMonthlyStats);
router.get('/:year/:month',         attendanceCtrl.getAttendanceByMonth);
router.post('/',                    attendanceCtrl.createOrUpdateAttendance);

module.exports = router;
