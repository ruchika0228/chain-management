import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const STATUS_OPTIONS = [
  { value: '',      label: 'All Status' },
  { value: 'true',  label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

const PAGE_SIZE = 12;

const formatRole = (role) => {
  const m = { super_admin: 'Super Admin', admin: 'Admin', employee: 'Employee', moderator: 'Moderator' };
  return m[role] || role;
};

export default function UserManagement() {
  const [employees,   setEmployees]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [form,        setForm]        = useState({ name: '', email: '', password: '' });
  const [formError,   setFormError]   = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting,  setSubmitting]  = useState(false);

  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page,         setPage]         = useState(1);

  const buildQuery = () => {
    const params = new URLSearchParams();
    if (search.trim())       params.set('name', search.trim());
    if (statusFilter !== '') params.set('is_active', statusFilter);
    const qs = params.toString();
    return qs ? `/users?${qs}` : '/users';
  };

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get(buildQuery());
      setEmployees(r.data.data);
      setPage(1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { loadEmployees(); }, [loadEmployees]);

  const validateForm = () => {
    if (!form.name.trim())  return 'Name is required.';
    if (!form.email.trim()) return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return 'Invalid email format.';
    if (!form.password)     return 'Password is required.';
    if (form.password.length < 6) return 'Password must be at least 6 characters.';
    return null;
  };

  const handleCreate = async e => {
    e.preventDefault();
    setFormError(''); setFormSuccess('');
    const err = validateForm();
    if (err) { setFormError(err); return; }
    setSubmitting(true);
    try {
      await api.post('/users', form);
      setFormSuccess('Employee created successfully.');
      setForm({ name: '', email: '', password: '' });
      await loadEmployees();
      setTimeout(() => setFormSuccess(''), 4000);
    } catch (e) {
      setFormError(e.response?.data?.message || 'Failed to create employee.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async id => {
    try {
      await api.patch(`/users/${id}/toggle`);
      await loadEmployees();
    } catch (e) {
      console.error(e);
    }
  };

  const handleReset = () => {
    setSearch('');
    setStatusFilter('');
  };

  const totalPages = Math.ceil(employees.length / PAGE_SIZE);
  const paged      = employees.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">

      {/* ── Page Header ─────────────────────────────────── */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Manage Employees</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Create new employee accounts and manage existing ones.
        </p>
      </div>

      {/* ── Create Employee ──────────────────────────────── */}
      <div className="card p-6">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4">Create New Employee</h2>

        {formError && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg px-4 py-2.5 text-sm mb-4">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formError}
          </div>
        )}
        {formSuccess && (
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg px-4 py-2.5 text-sm mb-4">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {formSuccess}
          </div>
        )}

        <form onSubmit={handleCreate}>
          <div className="grid sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="label">Full Name</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. John Doe"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                className="input"
                placeholder="employee@company.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                minLength={6}
              />
            </div>
          </div>
          <button type="submit" disabled={submitting} className="btn-primary px-6 py-2.5">
            {submitting ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating…
              </span>
            ) : 'Create Employee'}
          </button>
        </form>
      </div>

      {/* ── Employee List ──────────────────────────────────── */}
      <div className="card p-0 overflow-hidden">

        {/* List header */}
        <div className={`px-5 py-4 border-b border-slate-100 dark:border-slate-800`}>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Employee Directory
              <span className={`ml-2 text-xs font-normal ${employees.length === 0 ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>
                ({employees.length} member{employees.length !== 1 ? 's' : ''})
              </span>
            </h2>
          </div>

          {/* Filters — Search + Status only */}
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[200px]">
              <label className="label text-xs">Search by Name or Email</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="input pl-9"
                  placeholder="Type a name or email…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="min-w-[140px]">
              <label className="label text-xs">Status</label>
              <select
                className="input"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                {STATUS_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {(search || statusFilter) && (
              <button
                onClick={handleReset}
                className="btn-outline py-2 px-3 text-xs self-end"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center h-44">
            <div className="w-7 h-7 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : employees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400 dark:text-slate-500">
            <svg className="w-10 h-10 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-sm">No employees found.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="tbl">
                <thead>
                  <tr>
                    <th className="w-10">#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((emp, i) => (
                    <tr key={emp.id} className={i % 2 === 1 ? 'bg-slate-50/60 dark:bg-slate-900/30' : ''}>
                      <td className="text-xs text-slate-400 dark:text-slate-500">
                        {(page - 1) * PAGE_SIZE + i + 1}
                      </td>
                      <td className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                        {emp.name}
                      </td>
                      <td className="text-sm text-slate-500 dark:text-slate-400">
                        {emp.email}
                      </td>
                      <td>
                        <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {formatRole(emp.role)}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${
                          emp.is_active
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {emp.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="text-center">
                        <button
                          onClick={() => handleToggle(emp.id)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                            emp.is_active
                              ? 'border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20'
                              : 'border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
                          }`}
                        >
                          {emp.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={`flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-slate-800 text-xs`}>
                <span className="text-slate-400 dark:text-slate-500">
                  Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, employees.length)} of {employees.length}
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
                  >
                    ← Prev
                  </button>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
