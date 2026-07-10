const router = require('express').Router();
const formService = require('../services/formService');
const { validateFormContact } = require('../middleware/validate');

router.post('/submit', validateFormContact, async (req, res, next) => {
  try {
    const result = await formService.createForm(req.body, null);
    res.status(201).json({
      success: true,
      message: 'Your change request has been submitted successfully.',
      data: result,
    });
  } catch (err) { next(err); }
});

// Public form tracking endpoint — :id is the ticket ID (request_id, e.g. CR-20260702-YO5Z)
router.get('/track/:id', async (req, res, next) => {
  try {
    const result = await formService.getFormByRequestId(req.params.id);
    res.json({
      success: true,
      data: result,
    });
  } catch (err) { next(err); }
});

module.exports = router;
