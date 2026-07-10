import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const RANGE_OPTIONS = [
  { value: 'today',     label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'week',      label: 'Last 7 Days' },
  { value: 'month',     label: 'Last 30 Days' },
  { value: 'custom',    label: 'Custom Range' },
];

const PAGE_SIZE = 15;

function StatusBadge({ status }) {
  if (status === 'submitted')
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">✅ Submitted</span>;
  if (status === 'late')
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">🟡 Late</span>;
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">❌ Not Submitted</span>;
}

export default function AdminTaskView() {
  const [employees,   setEmployees]   = useState([]);
  const [selectedEmp, setSelectedEmp] = useState('');
  const [filter,      setFilter]      = useState('today');
  const [startDate,   setStartDate]   = useState('');
  const [endDate,     setEndDate]     = useState('');
  const [tasks,       setTasks]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [page,        setPage]        = useState(1);

  const [dailyStatus, setDailyStatus] = useState([]);
  const [dsLoading,   setDsLoading]   = useState(true);

  // Load employee dropdown
  useEffect(() => {
    api.get('/tasks/employees')
      .then(r => setEmployees(r.data.data))
      .catch(console.error);
  }, []);

  // Load today's submission status
  const loadDailyStatus = useCallback(async () => {
    setDsLoading(true);
    try {
      const r = await api.get('/tasks/daily-status');
      setDailyStatus(r.data.data);
    } catch (e) { console.error(e); }
    finally { setDsLoading(false); }
  }, []);

  useEffect(() => { loadDailyStatus(); }, [loadDailyStatus]);

  // Build task list URL
  const buildUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (filter === 'custom' && startDate && endDate) {
      params.set('start_date', startDate);
      params.set('end_date',   endDate);
    } else {
      params.set('filter', filter);
    }
    if (selectedEmp) params.set('employee_id', selectedEmp);
    return `/tasks?${params.toString()}`;
  }, [filter, startDate, endDate, selectedEmp]);

  const loadTasks = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const r = await api.get(buildUrl());
      setTasks(r.data.data);
      setPage(1);
    } catch (e) {
      setError('Failed to load tasks. Please try again.');
    } finally { setLoading(false); }
  }, [buildUrl]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const formatDate = (ts) => new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const formatTime = (ts) => new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const totalPages = Math.ceil(tasks.length / PAGE_SIZE);
  const paged      = tasks.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const submittedCount = dailyStatus.filter(e => e.status === 'submitted').length;
  const lateCount      = dailyStatus.filter(e => e.status === 'late').length;
  const pendingCount   = dailyStatus.filter(e => e.status === 'not_submitted').length;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Employee Task Management</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          View tasks and daily submission status.
        </p>
      </div>

      {/* ── Today's Submission Status ── */}
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="font-semibold text-sm text-slate-800 dark:text-slate-200">Today's Submission Status</h2>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">✅ {submittedCount}</span>
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">🟡 {lateCount}</span>
            <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-semibold">❌ {pendingCount}</span>
          </div>
        </div>
        {dsLoading ? (
          <div className="flex items-center justify-center h-20">
            <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : dailyStatus.length === 0 ? (
          <p className="text-center text-sm text-slate-400 dark:text-slate-500 py-8">No active employees found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Submitted At</th>
                </tr>
              </thead>
              <tbody>
                {dailyStatus.map((emp, i) => (
                  <tr key={emp.id} className={i % 2 === 1 ? 'bg-slate-50/60 dark:bg-slate-900/30' : ''}>
                    <td className="font-semibold text-sm text-slate-800 dark:text-slate-200">{emp.name}</td>
                    <td className="text-sm text-slate-500 dark:text-slate-400">{emp.email}</td>
                    <td><StatusBadge status={emp.status} /></td>
                    <td className="text-xs text-slate-400 dark:text-slate-500">
                      {emp.submitted_at ? formatTime(emp.submitted_at) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Filter Bar ── */}
      <div className="card p-5 space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          {/* Employee Dropdown */}
          <div className="min-w-[200px] flex-1 max-w-xs">
            <label className="label text-xs">Employee</label>
            <select
              className="input"
              value={selectedEmp}
              onChange={e => setSelectedEmp(e.target.value)}
            >
              <option value="">All Employees</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>

          {/* Range Dropdown */}
          <div className="min-w-[180px] flex-1 max-w-xs">
            <label className="label text-xs">Range</label>
            <select
              className="input"
              value={filter}
              onChange={e => setFilter(e.target.value)}
            >
              {RANGE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Custom date inputs */}
        {filter === 'custom' && (
          <div className="flex flex-wrap gap-3 items-end pt-1 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="label text-xs">Start Date</label>
              <input type="date" className="input py-2" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div>
              <label className="label text-xs">End Date</label>
              <input type="date" className="input py-2" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
            <button onClick={loadTasks} className="btn-primary py-2 px-5 text-xs self-end">
              Apply
            </button>
          </div>
        )}
      </div>

      {/* ── Task History Table ── */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-4 py-3 text-sm">{error}</div>
      )}
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="font-semibold text-sm text-slate-800 dark:text-slate-200">Task History</h2>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {tasks.length} record{tasks.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-7 h-7 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3 text-slate-400 dark:text-slate-500">
            <svg className="w-10 h-10 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
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
                    <tr key={task.id} className={i % 2 === 1 ? 'bg-slate-50/60 dark:bg-slate-900/30' : ''}>
                      <td className="font-semibold text-sm text-slate-800 dark:text-slate-200">{task.employee_name}</td>
                      <td className="text-sm text-slate-600 dark:text-slate-300 max-w-xs break-words">{task.task_description}</td>
                      <td className="text-xs whitespace-nowrap text-slate-400 dark:text-slate-500">{formatDate(task.created_at)}</td>
                      <td className="text-xs whitespace-nowrap text-slate-400 dark:text-slate-500">{formatTime(task.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-slate-400 dark:text-slate-500">Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors">
                    ← Prev
                  </button>
                  <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors">
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
