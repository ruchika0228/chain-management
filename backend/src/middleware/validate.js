const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

const validatePhone = (phone) => {
  if (!phone) return false;
  return /^\d{10}$/.test(phone.toString().trim());
};

const validateEmployeeInput = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];
  if (!name || !name.trim()) errors.push('Name is required.');
  if (!email || !validateEmail(email)) errors.push('Valid email is required.');
  if (!password || password.length < 6) errors.push('Password must be at least 6 characters.');
  if (errors.length) return res.status(422).json({ success: false, message: errors.join(' ') });
  next();
};

const validateFormContact = (req, res, next) => {
  const { contact_number, email } = req.body;
  const errors = [];

  // Email — required + format check
  if (!email || !email.toString().trim()) {
    errors.push('Email is required.');
  } else if (!validateEmail(email)) {
    errors.push('Invalid email format. Email must contain "@" and a valid domain.');
  }

  // Phone — required + exactly 10 digits, numbers only
  if (!contact_number || !contact_number.toString().trim()) {
    errors.push('Contact number is required.');
  } else if (!validatePhone(contact_number)) {
    errors.push('Contact number must be exactly 10 digits (numbers only).');
  }

  if (errors.length) return res.status(422).json({ success: false, message: errors.join(' ') });
  next();
};

module.exports = { validateEmail, validatePhone, validateEmployeeInput, validateFormContact };
