const { pool } = require('../config/db');

const approve = async (formId, user, comments) => {
  const [rows] = await pool.execute('SELECT * FROM forms WHERE id = ?', [formId]);
  if (!rows.length) throw { status: 404, message: 'Form not found.' };

  const form = rows[0];
  if (form.status !== 'pending') throw { status: 400, message: 'Form is not in pending state.' };

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.execute(
      `INSERT INTO approvals (form_id, approved_by, role, stage, decision, comments)
       VALUES (?, ?, ?, ?, 'approved', ?)`,
      [formId, user.id, user.role, form.current_stage, comments || null]
    );

    if (user.role === 'admin') {
      if (form.current_stage !== 1)
        throw { status: 403, message: 'Admin can only act on Stage 1 forms.' };
      await conn.execute(
        'UPDATE forms SET current_stage = 2 WHERE id = ?',
        [formId]
      );
    } else if (user.role === 'super_admin') {
      if (form.current_stage !== 2)
        throw { status: 403, message: 'Super Admin can only act on Stage 2 forms.' };
      await conn.execute(
        "UPDATE forms SET status = 'approved' WHERE id = ?",
        [formId]
      );
    }

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

const reject = async (formId, user, comments) => {
  const [rows] = await pool.execute('SELECT * FROM forms WHERE id = ?', [formId]);
  if (!rows.length) throw { status: 404, message: 'Form not found.' };

  const form = rows[0];
  if (form.status !== 'pending') throw { status: 400, message: 'Form is not in pending state.' };

  if (user.role === 'admin' && form.current_stage !== 1)
    throw { status: 403, message: 'Admin can only act on Stage 1 forms.' };
  if (user.role === 'super_admin' && form.current_stage !== 2)
    throw { status: 403, message: 'Super Admin can only act on Stage 2 forms.' };

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.execute(
      `INSERT INTO approvals (form_id, approved_by, role, stage, decision, comments)
       VALUES (?, ?, ?, ?, 'rejected', ?)`,
      [formId, user.id, user.role, form.current_stage, comments || null]
    );

    await conn.execute("UPDATE forms SET status = 'rejected' WHERE id = ?", [formId]);

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

module.exports = { approve, reject };
