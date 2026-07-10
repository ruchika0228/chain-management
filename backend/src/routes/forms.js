const router  = require('express').Router();
const { authenticate }   = require('../middleware/auth');
const { requireRole }    = require('../middleware/roleCheck');
const { validateFormContact } = require('../middleware/validate');
const formCtrl  = require('../controllers/formController');
const approveCtrl = require('../controllers/approvalController');

router.use(authenticate);

// Stats (moderator only sees aggregate)
router.get('/stats', requireRole('moderator', 'admin', 'super_admin'), formCtrl.getStats);

// Role-scoped list endpoints
router.get('/admin',      requireRole('admin'),       formCtrl.getAdminForms);
router.get('/superadmin', requireRole('super_admin'), formCtrl.getSuperAdminForms);
router.get('/moderator',  requireRole('moderator'),   formCtrl.getModeratorForms);

router.post('/', validateFormContact, formCtrl.createForm);

// Detail (all roles)
router.get('/:id', formCtrl.getFormById);

// Approval actions
router.post('/:id/approve', requireRole('admin', 'super_admin'), approveCtrl.approve);
router.post('/:id/reject',  requireRole('admin', 'super_admin'), approveCtrl.reject);

module.exports = router;
