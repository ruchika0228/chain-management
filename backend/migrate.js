const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: 'localhost', port: 3306, user: 'root',
    password: 'root1234', database: 'it_crms',
  });

  await conn.execute(`ALTER TABLE users MODIFY COLUMN role ENUM('admin','super_admin','moderator','employee') NOT NULL`);
  console.log('✓ users.role updated');

  const [cols] = await conn.execute(`SHOW COLUMNS FROM forms LIKE 'email'`);
  if (!cols.length) {
    await conn.execute(`ALTER TABLE forms ADD COLUMN email VARCHAR(255) NOT NULL DEFAULT '' AFTER requester_name`);
    console.log('✓ forms.email column added');
  } else {
    console.log('✓ forms.email already exists');
  }

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      task_description TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_user_id (user_id),
      INDEX idx_created_at (created_at)
    )
  `);
  console.log('✓ tasks table created');

  await conn.end();
  console.log('\nMigration complete.');
  process.exit(0);
})().catch(e => { console.error('Migration failed:', e.message); process.exit(1); });
