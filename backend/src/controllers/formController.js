const formService = require('../services/formService');

const createForm = async (req, res, next) => {
  try {
    const result = await formService.createForm(req.user.id, req.body);
    res.status(201).json({ success: true, message: 'Change request submitted.', data: result });
  } catch (err) { next(err); }
};

const getAdminForms = async (req, res, next) => {
  try {
    const data = await formService.getAdminForms();
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getSuperAdminForms = async (req, res, next) => {
  try {
    const data = await formService.getSuperAdminForms();
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getModeratorForms = async (req, res, next) => {
  try {
    const data = await formService.getModeratorForms();
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getFormById = async (req, res, next) => {
  try {
    const data = await formService.getFormById(req.params.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getStats = async (req, res, next) => {
  try {
    const data = await formService.getStats();
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

module.exports = { createForm, getAdminForms, getSuperAdminForms, getModeratorForms, getFormById, getStats };
