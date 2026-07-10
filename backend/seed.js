require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('./src/config/db');

const seed = async () => {
  const hash = await bcrypt.hash('Admin@123', 10);

  const users = [
    { name: 'Super Admin', email: 'superadmin@company.com', role: 'super_admin' },
    { name: 'IT Admin',    email: 'admin@company.com',      role: 'admin' },
    { name: 'Moderator',   email: 'moderator@company.com',  role: 'moderator' },
    { name: 'Alice',       email: 'alice@company.com',      role: 'employee' },
    { name: 'Bob',         email: 'bob@company.com',        role: 'employee' },
    { name: 'Charlie',     email: 'charlie@company.com',    role: 'employee' },
  ];

  for (const u of users) {
    await pool.execute(
      `INSERT INTO users (name, email, password, role)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name)`,
      [u.name, u.email, hash, u.role]
    );
    console.log(`✓  ${u.role.padEnd(12)}  ${u.email}   (password: Admin@123)`);
  }

  console.log('\nSeeding complete.');
  process.exit(0);
};

seed().catch(e => { console.error('Seed failed:', e.message); process.exit(1); });
