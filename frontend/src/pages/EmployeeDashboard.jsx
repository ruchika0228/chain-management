import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';
import ThemeToggle from '../components/common/ThemeToggle';

const DATE_FILTERS = [
  { value: 'today',     label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'week',      label: 'Last 7 Days' },
  { value: 'month',     label: 'Last 30 Days' },
  { value: 'custom',    label: 'Custom Range' },
];

const PAGE_SIZE = 10;

export default function EmployeeDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [tasks,      setTasks]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [taskDesc,   setTaskDesc]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [taskSuccess, setTaskSuccess] = useState('');
  const [taskError,   setTaskError]   = useState('');

  const [filter,    setFilter]    = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate,   setEndDate]   = useState('');
  const [page,      setPage]      = useState(1);

  const [pwForm,     setPwForm]     = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading,  setPwLoading]  = useState(false);
  const [pwSuccess,  setPwSuccess]  = useState('');
  const [pwError,    setPwError]    = useState('');
  const [showPwForm, setShowPwForm] = useState(false);

  const buildUrl = useCallback(() => {
    if (filter === 'custom' && startDate && endDate)
      return `/tasks?start_date=${startDate}&end_date=${endDate}`;
    return `/tasks?filter=${filter}`;
  }, [filter, startDate, endDate]);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get(buildUrl());
      setTasks(r.data.data);
      setPage(1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [buildUrl]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskDesc.trim()) return;
    setSubmitting(true);
    setTaskError('');
    setTaskSuccess('');
    try {
      await api.post('/tasks', { task_description: taskDesc.trim() });
      setTaskDesc('');
      setTaskSuccess('Task submitted successfully!');
      await loadTasks();
      setTimeout(() => setTaskSuccess(''), 3000);
    } catch (err) {
      setTaskError(err.response?.data?.message || 'Failed to submit task.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');
    const { currentPassword, newPassword, confirmPassword } = pwForm;
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwError('All fields are required.');
      return;
    }
    if (newPassword.length < 6) {
      setPwError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('Passwords do not match.');
      return;
    }
    setPwLoading(true);
    try {
      const res = await api.post('/auth/update-password', { currentPassword, newPassword, confirmPassword });
      if (res.data.success) {
        setPwSuccess('Password updated successfully!');
        setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => { setPwSuccess(''); setShowPwForm(false); }, 3000);
      }
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setPwLoading(false);
    }
  };

  const formatDate = (ts) => new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const formatTime = (ts) => new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  // Pagination
  const totalPages = Math.ceil(tasks.length / PAGE_SIZE);
  const paged = tasks.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>

      {/* ── Top Navbar ─────────────────────────────────────── */}
      <header className={`sticky top-0 z-30 border-b transition-colors duration-200 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <span className="font-bold text-sm leading-tight block">Employee Portal</span>
              <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Welcome, {user?.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className={`hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${isDark ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-800' : 'bg-emerald-100 text-emerald-700'}`}>
              Employee
            </span>
            <button
              onClick={() => { logout(); navigate('/'); }}
              className="btn-outline text-xs py-1.5 px-3"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content ───────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">

          {/* ── LEFT 70%: Task History ─────────────────────── */}
          <div className="space-y-4">
            {/* Date Filter Bar */}
            <div className="card p-4 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Period:
                </span>
                {DATE_FILTERS.map(f => (
                  <button
                    key={f.value}
                    onClick={() => setFilter(f.value)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors border ${
                      filter === f.value
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-500/20'
                        : isDark
                          ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {filter === 'custom' && (
                <div className="flex flex-wrap items-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <label className={`block text-[11px] font-semibold uppercase mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Start</label>
                    <input type="date" className="input py-2 text-xs" value={startDate} onChange={e => setStartDate(e.target.value)} />
                  </div>
                  <div>
                    <label className={`block text-[11px] font-semibold uppercase mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>End</label>
                    <input type="date" className="input py-2 text-xs" value={endDate} onChange={e => setEndDate(e.target.value)} />
                  </div>
                  <button onClick={loadTasks} className="btn-success py-2 px-4 text-xs self-end">
                    Apply
                  </button>
                </div>
              )}
            </div>

            {/* Task History Table */}
            <div className="card p-0 overflow-hidden">
              <div className={`px-5 py-3.5 border-b flex items-center justify-between ${isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-100 bg-slate-50/60'}`}>
                <h2 className="font-semibold text-sm">Task History</h2>
                <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>{tasks.length} record{tasks.length !== 1 ? 's' : ''}</span>
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-48">
                  <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : tasks.length === 0 ? (
                <div className={`flex flex-col items-center justify-center py-16 gap-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  <svg className="w-10 h-10 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-sm">No tasks found for this period.</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="tbl">
                      <thead>
                        <tr>
                          <th className="w-36">Employee</th>
                          <th>Task Description</th>
                          <th className="w-28">Date</th>
                          <th className="w-20">Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paged.map((task, i) => (
                          <tr key={task.id} className={i % 2 === 1 ? (isDark ? 'bg-slate-900/30' : 'bg-slate-50/60') : ''}>
                            <td className="font-semibold text-sm">{task.employee_name}</td>
                            <td className={`text-sm max-w-xs break-words ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{task.task_description}</td>
                            <td className={`text-xs whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{formatDate(task.created_at)}</td>
                            <td className={`text-xs whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{formatTime(task.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className={`flex items-center justify-between px-5 py-3 border-t text-xs ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                      <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                        Page {page} of {totalPages}
                      </span>
                      <div className="flex gap-2">
                        <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                          className={`px-3 py-1.5 rounded-lg border font-medium transition-colors disabled:opacity-40 ${isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                          ← Prev
                        </button>
                        <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                          className={`px-3 py-1.5 rounded-lg border font-medium transition-colors disabled:opacity-40 ${isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                          Next →
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* ── RIGHT 30%: Actions Panel ───────────────────── */}
          <div className="space-y-4">

            {/* Profile Info */}
            <div className="card p-5">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center text-base font-bold ${isDark ? 'bg-emerald-900/40 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>
                  {user?.name?.[0]?.toUpperCase() || 'E'}
                </div>
                <div>
                  <p className="font-semibold text-sm">{user?.name}</p>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Log Daily Task */}
            <div className="card p-5">
              <h2 className="font-semibold text-sm mb-3">Log Daily Task</h2>

              {taskError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-3 py-2 text-xs mb-3">{taskError}</div>
              )}
              {taskSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-lg px-3 py-2 text-xs mb-3">{taskSuccess}</div>
              )}

              <form onSubmit={handleAddTask} className="space-y-3">
                <textarea
                  className="input w-full min-h-[90px] resize-none text-sm"
                  placeholder="Describe what you worked on today…"
                  value={taskDesc}
                  onChange={e => setTaskDesc(e.target.value)}
                  maxLength={500}
                  required
                />
                <p className={`text-[11px] text-right ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{taskDesc.length}/500</p>
                <button
                  type="submit"
                  disabled={submitting || !taskDesc.trim()}
                  className="w-full btn-success py-2.5 text-sm font-semibold"
                >
                  {submitting
                    ? <span className="flex items-center justify-center gap-2"><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Submitting…</span>
                    : 'Submit Task'
                  }
                </button>
              </form>
            </div>

            {/* Security / Password */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-sm">Security Settings</h2>
                <button
                  onClick={() => setShowPwForm(v => !v)}
                  className={`text-xs font-semibold ${isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-700'}`}
                >
                  {showPwForm ? 'Cancel' : 'Change Password'}
                </button>
              </div>

              {!showPwForm ? (
                <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Keep your account secure. Update your password regularly and never share credentials.
                </p>
              ) : (
                <form onSubmit={handleUpdatePassword} className="space-y-3">
                  {pwError   && <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-3 py-2 text-xs">{pwError}</div>}
                  {pwSuccess && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-lg px-3 py-2 text-xs">{pwSuccess}</div>}

                  {[
                    { key: 'currentPassword', label: 'Current Password' },
                    { key: 'newPassword',     label: 'New Password (min 6)' },
                    { key: 'confirmPassword', label: 'Confirm New Password' },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className={`block text-[11px] font-bold uppercase mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</label>
                      <input
                        type="password"
                        className="input text-sm"
                        placeholder="••••••••"
                        value={pwForm[key]}
                        onChange={e => setPwForm(p => ({ ...p, [key]: e.target.value }))}
                        required
                      />
                    </div>
                  ))}

                  <button type="submit" disabled={pwLoading} className="w-full btn-primary py-2 text-xs font-semibold">
                    {pwLoading ? 'Saving…' : 'Update Password'}
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
