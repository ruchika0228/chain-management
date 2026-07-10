-- ============================================================
--  IT Change Request Management System — Docker Init
--  Runs ONCE on first container start via docker-entrypoint-initdb.d
--  Contains: full schema + seed users (admin, super_admin, moderator, employee)
--
--  Passwords (all accounts): Admin@123
--  bcryptjs hash ($2a$10$) generated with 10 rounds
-- ============================================================

CREATE DATABASE IF NOT EXISTS it_crms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE it_crms;

-- ─── 1. USERS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id         INT          PRIMARY KEY AUTO_INCREMENT,
  name       VARCHAR(255) NOT NULL,
  email      VARCHAR(255) UNIQUE NOT NULL,
  password   VARCHAR(255) NOT NULL,
  role       ENUM('admin','super_admin','moderator','employee') NOT NULL,
  is_active  TINYINT(1)   NOT NULL DEFAULT 1,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_role  (role),
  INDEX idx_email (email)
);

-- ─── 2. HOLIDAYS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS holidays (
  id           INT          PRIMARY KEY AUTO_INCREMENT,
  name         VARCHAR(255) NOT NULL,
  holiday_date DATE         NOT NULL,
  created_by   INT          NOT NULL,
  created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_holiday_date (holiday_date),
  INDEX idx_created_by   (created_by)
);

-- ─── 3. ATTENDANCE ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attendance (
  id              INT      PRIMARY KEY AUTO_INCREMENT,
  user_id         INT      NOT NULL,
  attendance_date DATE     NOT NULL,
  status          ENUM('present','absent','leave') NOT NULL DEFAULT 'present',
  check_in        TIME     DEFAULT NULL,
  check_out       TIME     DEFAULT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_date (user_id, attendance_date),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_date       (user_id, attendance_date),
  INDEX idx_attendance_date (attendance_date)
);

-- ─── 4. FORMS (header) ──────────────────────────────────────
-- requested_by is NULL for public (unauthenticated) submissions
CREATE TABLE IF NOT EXISTS forms (
  id              INT          PRIMARY KEY AUTO_INCREMENT,
  request_id      VARCHAR(50)  UNIQUE NOT NULL,
  requester_name  VARCHAR(255) NOT NULL DEFAULT '',
  email           VARCHAR(255) NOT NULL DEFAULT '',
  requested_by    INT          NULL,
  department      VARCHAR(255) NOT NULL,
  contact_number  VARCHAR(50)  NOT NULL,
  current_stage   TINYINT      NOT NULL DEFAULT 1,
  status          ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status        (status),
  INDEX idx_stage         (current_stage),
  INDEX idx_stage_status  (current_stage, status),
  INDEX idx_requested_by  (requested_by)
);

-- ─── 5. FORM DETAILS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS form_details (
  id                  INT     PRIMARY KEY AUTO_INCREMENT,
  form_id             INT     UNIQUE NOT NULL,
  -- Section 2 – Change Classification
  change_title        VARCHAR(500)                               NOT NULL,
  change_type         VARCHAR(100)                               NOT NULL,
  change_type_other   VARCHAR(255)                               DEFAULT NULL,
  category            VARCHAR(100)                               NOT NULL,
  category_other      VARCHAR(255)                               DEFAULT NULL,
  priority            ENUM('Low','Medium','High','Critical')     NOT NULL,
  risk_level          ENUM('Low','Medium','High','Critical')     NOT NULL,
  -- Section 3 – Description
  description         TEXT NOT NULL,
  justification       TEXT NOT NULL,
  systems_affected    TEXT NOT NULL,
  -- Section 4 – Risk & Impact
  downtime_required   TINYINT(1) NOT NULL DEFAULT 0,
  affected_users      TEXT       NOT NULL,
  impact_if_not_done  TEXT       NOT NULL,
  estimated_downtime  VARCHAR(255) DEFAULT NULL,
  -- Section 5 – Implementation Plan
  implementation_plan TEXT        NOT NULL,
  proposed_datetime   DATETIME    NOT NULL,
  estimated_duration  VARCHAR(255) NOT NULL,
  -- Section 6 – Backout Plan
  resources           TEXT NOT NULL,
  rollback_procedure  TEXT NOT NULL,
  -- Section 7 – Testing
  test_plan           TEXT         NOT NULL,
  rollback_time       VARCHAR(255) NOT NULL,
  FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE,
  INDEX idx_form_id (form_id)
);

-- ─── 6. APPROVALS (audit trail) ─────────────────────────────
CREATE TABLE IF NOT EXISTS approvals (
  id          INT  PRIMARY KEY AUTO_INCREMENT,
  form_id     INT  NOT NULL,
  approved_by INT  NOT NULL,
  role        ENUM('admin','super_admin') NOT NULL,
  stage       TINYINT NOT NULL,
  decision    ENUM('approved','rejected') NOT NULL,
  comments    TEXT    DEFAULT NULL,
  date        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (form_id)     REFERENCES forms(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_form_id (form_id),
  INDEX idx_stage   (stage)
);

-- ─── 7. TASKS (Employee Daily Task System) ──────────────────
CREATE TABLE IF NOT EXISTS tasks (
  id               INT  PRIMARY KEY AUTO_INCREMENT,
  user_id          INT  NOT NULL,
  task_description TEXT NOT NULL,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id    (user_id),
  INDEX idx_created_at (created_at)
);

-- ─── 8. CLOSURE ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS closure (
  id                  INT      PRIMARY KEY AUTO_INCREMENT,
  form_id             INT      UNIQUE NOT NULL,
  implemented_by      INT      NOT NULL,
  implementation_date DATETIME NOT NULL,
  closure_notes       TEXT     DEFAULT NULL,
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (form_id)        REFERENCES forms(id) ON DELETE CASCADE,
  FOREIGN KEY (implemented_by) REFERENCES users(id) ON DELETE RESTRICT
);

-- ============================================================
--  SEED: Default users
--  All passwords: Admin@123
--  Hash generated with: node -e "require('bcryptjs').hash('Admin@123',10).then(console.log)"
--  bcryptjs v2.4.3, saltRounds=10, $2a$ prefix
--  Verified: bcryptjs.compareSync('Admin@123', hash) === true
-- ============================================================
INSERT INTO users (name, email, password, role) VALUES
  (
    'Super Admin',
    'superadmin@company.com',
    '$2a$10$tIakwhuY5DqDAmjX8q6ekehYyHxxyZtao51uDwUaXTV6/8rcqMe4i',
    'super_admin'
  ),
  (
    'IT Admin',
    'admin@company.com',
    '$2a$10$tIakwhuY5DqDAmjX8q6ekehYyHxxyZtao51uDwUaXTV6/8rcqMe4i',
    'admin'
  ),
  (
    'Moderator',
    'moderator@company.com',
    '$2a$10$tIakwhuY5DqDAmjX8q6ekehYyHxxyZtao51uDwUaXTV6/8rcqMe4i',
    'moderator'
  ),
  (
    'John Employee',
    'employee@company.com',
    '$2a$10$tIakwhuY5DqDAmjX8q6ekehYyHxxyZtao51uDwUaXTV6/8rcqMe4i',
    'employee'
  )
ON DUPLICATE KEY UPDATE name = VALUES(name), password = VALUES(password);
