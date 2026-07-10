const { pool } = require('../config/db');

/* ── helpers ─────────────────────────────────────────────── */

const generateRequestId = () => {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CR-${ymd}-${rand}`;
};

const transform = (row) => ({
  ...row,
  display_change_type: row.change_type === 'Other' ? row.change_type_other : row.change_type,
  display_category:    row.category    === 'Other' ? row.category_other    : row.category,
  downtime_required:   Boolean(row.downtime_required),
});

/* ── validation ──────────────────────────────────────────── */

const validate = (body) => {
  const errors = [];

  // Email validation
  if (!body.email?.trim()) {
    errors.push('Email is required.');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) {
    errors.push('Invalid email format. Email must contain "@" and a valid domain.');
  }

  // Phone validation — exactly 10 digits, numbers only
  if (!body.contact_number?.toString().trim()) {
    errors.push('Contact number is required.');
  } else if (!/^\d{10}$/.test(body.contact_number.toString().trim())) {
    errors.push('Contact number must be exactly 10 digits (numbers only).');
  }

  // Change type / category other fields
  if (body.change_type === 'Other' && !body.change_type_other?.trim())
    errors.push('change_type_other is required when change_type is "Other".');
  if (body.category === 'Other' && !body.category_other?.trim())
    errors.push('category_other is required when category is "Other".');

  return errors;
};

/* ── create (public — no userId required) ────────────────── */

const createForm = async (body, userId = null) => {
  const errors = validate(body);
  if (errors.length) throw { status: 422, message: errors.join(' ') };

  const requestId = generateRequestId();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [formResult] = await conn.execute(
      `INSERT INTO forms (request_id, requester_name, email, requested_by, department, contact_number)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        requestId,
        body.requester_name || '',
        body.email || '',
        userId || null,
        body.department,
        body.contact_number,
      ]
    );
    const formId = formResult.insertId;

    await conn.execute(
      `INSERT INTO form_details (
        form_id,
        change_title, change_type, change_type_other, category, category_other,
        priority, risk_level,
        description, justification, systems_affected,
        downtime_required, affected_users, impact_if_not_done, estimated_downtime,
        implementation_plan, proposed_datetime, estimated_duration,
        resources, rollback_procedure,
        test_plan, rollback_time
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        formId,
        body.change_title, body.change_type, body.change_type_other || null,
        body.category, body.category_other || null,
        body.priority, body.risk_level,
        body.description, body.justification, body.systems_affected,
        body.downtime_required ? 1 : 0,
        body.affected_users, body.impact_if_not_done, body.estimated_downtime || null,
        body.implementation_plan, body.proposed_datetime, body.estimated_duration,
        body.resources, body.rollback_procedure,
        body.test_plan, body.rollback_time,
      ]
    );

    await conn.commit();
    return { id: formId, request_id: requestId };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

/* ── list queries ────────────────────────────────────────── */

const BASE_SELECT = `
  SELECT
    f.id, f.request_id, f.department, f.contact_number,
    f.current_stage, f.status, f.created_at, f.updated_at,
    COALESCE(u.name, f.requester_name) AS requester_name,
    u.email AS requester_email,
    fd.change_title, fd.change_type, fd.change_type_other,
    fd.category,    fd.category_other,
    fd.priority,    fd.risk_level,
    fd.description, fd.justification, fd.systems_affected,
    fd.downtime_required, fd.affected_users,
    fd.impact_if_not_done, fd.estimated_downtime,
    fd.implementation_plan, fd.proposed_datetime, fd.estimated_duration,
    fd.resources, fd.rollback_procedure,
    fd.test_plan,  fd.rollback_time
  FROM forms f
  LEFT JOIN users u       ON u.id = f.requested_by
  JOIN  form_details fd   ON fd.form_id = f.id
`;

// Admin & Super Admin dashboards receive ALL forms — the frontend filters them
// (All / Pending / Reviewed / Approved / Rejected) so reviewed forms stay visible.
const getAdminForms = async () => {
  const [rows] = await pool.execute(`${BASE_SELECT} ORDER BY f.created_at DESC`);
  return rows.map(transform);
};

const getSuperAdminForms = async () => {
  const [rows] = await pool.execute(`${BASE_SELECT} ORDER BY f.created_at DESC`);
  return rows.map(transform);
};

const getModeratorForms = async () => {
  const [rows] = await pool.execute(
    `${BASE_SELECT} ORDER BY f.created_at DESC`
  );
  return rows.map(transform);
};

const loadFormDetails = async (row) => {
  const form = transform(row);
  const id = form.id;

  const [approvals] = await pool.execute(
    `SELECT a.*, u.name AS approver_name
     FROM approvals a JOIN users u ON u.id = a.approved_by
     WHERE a.form_id = ? ORDER BY a.date ASC`,
    [id]
  );

  const [closure] = await pool.execute(
    `SELECT c.*, u.name AS implementer_name
     FROM closure c JOIN users u ON u.id = c.implemented_by
     WHERE c.form_id = ?`,
    [id]
  );

  return { ...form, approvals, closure: closure[0] || null };
};

const getFormById = async (id) => {
  const [rows] = await pool.execute(`${BASE_SELECT} WHERE f.id = ?`, [id]);
  if (!rows.length) throw { status: 404, message: 'Form not found.' };
  return loadFormDetails(rows[0]);
};

// Public tracking uses the ticket ID (request_id), e.g. "CR-20260702-YO5Z"
const getFormByRequestId = async (requestId) => {
  const [rows] = await pool.execute(`${BASE_SELECT} WHERE f.request_id = ?`, [requestId]);
  if (!rows.length) throw { status: 404, message: 'Form not found.' };
  return loadFormDetails(rows[0]);
};

const getStats = async () => {
  const [[total]]    = await pool.execute('SELECT COUNT(*) AS count FROM forms');
  const [[pending]]  = await pool.execute("SELECT COUNT(*) AS count FROM forms WHERE status = 'pending'");
  const [[approved]] = await pool.execute("SELECT COUNT(*) AS count FROM forms WHERE status = 'approved'");
  const [[rejected]] = await pool.execute("SELECT COUNT(*) AS count FROM forms WHERE status = 'rejected'");
  const [[stage1]]   = await pool.execute("SELECT COUNT(*) AS count FROM forms WHERE current_stage = 1 AND status = 'pending'");
  const [[stage2]]   = await pool.execute("SELECT COUNT(*) AS count FROM forms WHERE current_stage = 2 AND status = 'pending'");

  return {
    total:          total.count,
    pending:        pending.count,
    approved:       approved.count,
    rejected:       rejected.count,
    stage1_pending: stage1.count,
    stage2_pending: stage2.count,
  };
};

module.exports = { createForm, getAdminForms, getSuperAdminForms, getModeratorForms, getFormById, getFormByRequestId, getStats };
