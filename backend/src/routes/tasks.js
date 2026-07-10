const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const taskCtrl = require('../controllers/taskController');

router.use(authenticate);

router.post('/',   taskCtrl.addTask);
router.get('/',    taskCtrl.listTasks);
router.get('/attendance',              requireRole('admin', 'super_admin'), taskCtrl.attendance);
router.get('/employees',               requireRole('admin', 'super_admin', 'moderator'), taskCtrl.employeeList);
router.get('/daily-status',            requireRole('admin', 'super_admin'), taskCtrl.dailyStatus);
router.get('/report/:employeeId',      requireRole('admin', 'super_admin'), taskCtrl.attendanceReport);

module.exports = router;
