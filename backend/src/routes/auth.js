const router = require('express').Router();
const { authenticate }                  = require('../middleware/auth');
const { staffLogin, employeeLogin, me, updatePassword } = require('../controllers/authController');

router.post('/login',          staffLogin);    // admin / super_admin / moderator only
router.post('/employee-login', employeeLogin); // employee only
router.get('/me', authenticate, me);
router.post('/update-password', authenticate, updatePassword);


module.exports = router;
