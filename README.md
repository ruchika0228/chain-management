# IT Change Request Management System

Full-stack application: **React + Node.js/Express + MySQL**

---

## Quick Start

### 1 — Database

Open MySQL and run:

```sql
-- Run the full schema (creates DB, tables, seed users)
source database/schema.sql;
```

Or run just the seed script after schema:

```bash
cd backend
npm install
node ../database/seed.js
```

---

### 2 — Backend

```bash
cd backend
npm install
# Edit .env — set DB_PASSWORD to your MySQL password
npm run dev
# → http://localhost:5000
```

---

### 3 — Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

---

## Demo Accounts

| Role        | Email                      | Password   |
|-------------|----------------------------|------------|
| Admin       | admin@company.com          | Admin@123  |
| Super Admin | superadmin@company.com     | Admin@123  |
| Moderator   | moderator@company.com      | Admin@123  |

---

## Architecture

```
backend/
  src/
    config/       → DB connection pool
    middleware/   → JWT auth, role guard
    services/     → Business logic (pure functions)
    controllers/  → HTTP layer (calls services)
    routes/       → Express routers

frontend/
  src/
    api/          → Axios instance with JWT interceptor
    context/      → Auth context (login/logout/user state)
    components/
      common/     → Layout, Navbar, Sidebar, FormTable
      form/
        steps/    → Step1…Step8 components
        FormStepper.jsx  → Stepper orchestrator
    pages/        → Login, NewForm, AdminDashboard,
                    SuperAdminDashboard, ModeratorDashboard, FormDetail
```

---

## Workflow

```
Moderator fills 8-step form
         ↓
   status = pending, stage = 1
         ↓
  Admin reviews → Approve
         ↓
   stage = 2
         ↓
Super Admin reviews → Approve
         ↓
   status = approved
```

Rejection at either stage → `status = rejected` immediately.

---

## API Reference

| Method | Endpoint               | Role               | Description              |
|--------|------------------------|--------------------|--------------------------|
| POST   | /api/auth/login        | public             | Login                    |
| GET    | /api/auth/me           | any                | Current user             |
| POST   | /api/forms             | any                | Submit new request       |
| GET    | /api/forms/admin       | admin              | Stage 1 pending forms    |
| GET    | /api/forms/superadmin  | super_admin        | Stage 2 pending forms    |
| GET    | /api/forms/moderator   | moderator          | All forms (read-only)    |
| GET    | /api/forms/stats       | any                | Aggregate statistics     |
| GET    | /api/forms/:id         | any                | Form detail + audit trail|
| POST   | /api/forms/:id/approve | admin, super_admin | Approve current stage    |
| POST   | /api/forms/:id/reject  | admin, super_admin | Reject (requires comment)|
