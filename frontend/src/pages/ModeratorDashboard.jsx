import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import FormTable from '../components/common/FormTable';

const StatCard = ({ label, value, color }) => (
  <div className="card p-5">
    <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide mb-1">{label}</p>
    <p className={`text-3xl font-bold ${color}`}>{value ?? '—'}</p>
  </div>
);

export default function ModeratorDashboard() {
  const [forms, setForms] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    Promise.all([api.get('/forms/moderator'), api.get('/forms/stats')])
      .then(([fRes, sRes]) => {
        setForms(fRes.data.data);
        setStats(sRes.data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter ? forms.filter(f => f.status === filter) : forms;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Moderator Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Read-only view of all change requests and analytics.</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard label="Total"         value={stats.total}          color="text-slate-800 dark:text-slate-100" />
          <StatCard label="Pending"        value={stats.pending}         color="text-amber-600 dark:text-amber-400" />
          <StatCard label="Approved"       value={stats.approved}        color="text-emerald-600 dark:text-emerald-400" />
          <StatCard label="Rejected"       value={stats.rejected}        color="text-red-600 dark:text-red-400" />
          <StatCard label="Stage 1 Queue"  value={stats.stage1_pending}  color="text-blue-600 dark:text-blue-400" />
          <StatCard label="Stage 2 Queue"  value={stats.stage2_pending}  color="text-purple-600 dark:text-purple-400" />
        </div>
      )}

      {/* Filter bar */}
      <div className="card p-4 flex gap-3 flex-wrap items-center">
        <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Filter:</span>
        {['', 'pending', 'approved', 'rejected'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
              filter === s 
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/25' 
                : 'border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}>
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All Requests'}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-400 dark:text-slate-500">{filtered.length} record(s)</span>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-7 h-7 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <FormTable forms={filtered} showStage emptyMsg="No forms found." />
        )}
      </div>
    </div>
  );
}
