const userService = require('../services/userService');

const createEmployee = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const data = await userService.createEmployee(name, email, password);
    res.status(201).json({ success: true, message: 'Employee created successfully.', data });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'An employee with this email already exists.' });
    }
    next(err);
  }
};

const listEmployees = async (req, res, next) => {
  try {
    const { name, email, role, is_active } = req.query;
    const data = await userService.getEmployees({ name, email, role, is_active });
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const toggleStatus = async (req, res, next) => {
  try {
    const data = await userService.toggleEmployeeStatus(req.params.id);
    res.json({ success: true, message: 'Employee status updated.', data });
  } catch (err) { next(err); }
};

module.exports = { createEmployee, listEmployees, toggleStatus };
