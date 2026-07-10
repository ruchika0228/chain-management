const taskService = require('../services/taskService');

const addTask = async (req, res, next) => {
  try {
    const result = await taskService.createTask(req.user.id, req.body.task_description);
    res.status(201).json({ success: true, message: 'Task added successfully.', data: result });
  } catch (err) { next(err); }
};

const listTasks = async (req, res, next) => {
  try {
    const { filter, start_date, end_date, employee_id } = req.query;
    const data = await taskService.getTasks(
      filter, start_date, end_date,
      req.user.id, req.user.role,
      employee_id ? parseInt(employee_id, 10) : null
    );
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const attendance = async (req, res, next) => {
  try {
    const { date } = req.query;
    const data = await taskService.getAttendance(date);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const employeeList = async (req, res, next) => {
  try {
    const data = await taskService.getEmployeeList();
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const attendanceReport = async (req, res, next) => {
  try {
    const data = await taskService.getAttendanceReport(req.params.employeeId);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const dailyStatus = async (req, res, next) => {
  try {
    const data = await taskService.getDailyStatus();
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

module.exports = { addTask, listTasks, attendance, employeeList, attendanceReport, dailyStatus };
