import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const PAGE_SIZE = 10;

// "Add Task" page for admin / super_admin / moderator.
// Lets the logged-in user log their own daily task and review their OWN history.
export default function MyTaskLog() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [taskDesc, setTaskDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [taskSuccess, setTaskSuccess] = useState('');
  const [taskError, setTaskError] = useState('');
  const [filter, setFilter] = useState('month');
  const [page, setPage] = useState(1);

  const loadTasks = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      // Scope to self so this page shows only the current user's own log.
      const r = await api.get(`/tasks?employee_id=${user.id}&filter=${filter}`);
      setTasks(r.data.data);
      setPage(1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filter, user]);

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

  const formatDate = (ts) => new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const formatTime = (ts) => new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const totalPages = Math.ceil(tasks.length / PAGE_SIZE);
  const paged = tasks.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Add Task</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Log your daily task and view your task history
        </p>
      </div>

      {/* Submit Task Form */}
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
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 dark:text-slate-400">{taskDesc.length}/500</p>
            <button
              type="submit"
              disabled={submitting || !taskDesc.trim()}
              className="btn-primary py-2 px-5 text-sm font-semibold"
            >
              {submitting ? 'Submitting…' : 'Submit Task'}
            </button>
          </div>
        </form>
      </div>

      {/* Task History */}
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="font-semibold text-sm">My Task History</h2>
          <select
            className="input py-1.5 text-xs"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400 dark:text-slate-500">
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
                    <th>Task Description</th>
                    <th className="w-28">Date</th>
                    <th className="w-20">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((task, i) => (
                    <tr key={task.id} className={i % 2 === 1 ? 'bg-slate-50/60 dark:bg-slate-900/30' : ''}>
                      <td className="text-sm text-slate-600 dark:text-slate-300">{task.task_description}</td>
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
