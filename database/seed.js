/**
 * Run: node database/seed.js
 * Seeds default users with password: Admin@123
 */
require('dotenv').config({ path: require('path').join(__dirname, '../backend/.env') });
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

const seed = async () => {
  const pool = await mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'it_crms',
  });

  const hash = await bcrypt.hash('Admin@123', 10);
  const users = [
    { name: 'Super Admin', email: 'superadmin@company.com', role: 'super_admin' },
    { name: 'IT Admin',    email: 'admin@company.com',      role: 'admin' },
    { name: 'Moderator',   email: 'moderator@company.com',  role: 'moderator' },
  ];

  for (const u of users) {
    await pool.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE name=VALUES(name)',
      [u.name, u.email, hash, u.role]
    );
    console.log(`✓  ${u.role.padEnd(12)} ${u.email}  (password: Admin@123)`);
  }

  console.log('\nSeeding complete.');
  await pool.end();
};

seed().catch(e => { console.error(e); process.exit(1); });
