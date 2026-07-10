const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const { validateEmployeeInput } = require('../middleware/validate');
const userCtrl = require('../controllers/userController');

router.use(authenticate);

router.get('/', requireRole('admin', 'super_admin'), userCtrl.listEmployees);
router.post('/', requireRole('admin', 'super_admin'), validateEmployeeInput, userCtrl.createEmployee);
router.patch('/:id/toggle', requireRole('admin', 'super_admin'), userCtrl.toggleStatus);

module.exports = router;
