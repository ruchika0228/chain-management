import React, { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import FormTable from './FormTable';

/*
 * Shared review dashboard for Admin (Stage 1) and Super Admin (Stage 2).
 * Shows ALL forms with 4 filter buttons:
 *   All      — every change request
 *   Pending  — awaiting review (Stage 1 or Stage 2 — see the Stage column)
 *   Approved — final approval given
 *   Rejected — rejected at either stage
 */

const matches = (f, key) => {
  if (key === 'all')     return true;
  if (key === 'pending') return f.status === 'pending';
  return f.status === key; // approved | rejected
};

const FILTERS = [
  {
    key: 'all', label: 'All Forms', icon: '🗂️',
    desc: 'Every change request in the system.',
    activeCls: 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white shadow-md',
    chipCls: 'bg-white/20 dark:bg-slate-900/10',
  },
  {
    key: 'pending', label: 'Pending', icon: '🕓',
    desc: 'Awaiting review — check the Stage column for where each form sits.',
    activeCls: 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/25',
    chipCls: 'bg-white/25',
  },
  {
    key: 'approved', label: 'Approved', icon: '✅',
    desc: 'Fully approved change requests.',
    activeCls: 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/25',
    chipCls: 'bg-white/25',
  },
  {
    key: 'rejected', label: 'Rejected', icon: '❌',
    desc: 'Rejected change requests.',
    activeCls: 'bg-red-600 text-white border-red-600 shadow-md shadow-red-500/25',
    chipCls: 'bg-white/25',
  },
];

export default function ReviewBoard({
  title, subtitle, endpoint, defaultFilter, banner, bannerCls, queueStage, queueLabel, queueBadgeCls,
}) {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(defaultFilter);

  useEffect(() => {
    api.get(endpoint)
      .then(r => setForms(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [endpoint]);

  const counts = useMemo(() => {
    const c = {};
    FILTERS.forEach(f => { c[f.key] = forms.filter(x => matches(x, f.key)).length; });
    return c;
  }, [forms]);

  const visible = useMemo(() => forms.filter(f => matches(f, filter)), [forms, filter]);
  const active  = FILTERS.find(f => f.key === filter);
  // Forms sitting in THIS reviewer's queue (pending at their stage)
  const queueCount = forms.filter(f => f.status === 'pending' && f.current_stage === queueStage).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{title}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{subtitle}</p>
        </div>
        <span className={`${queueBadgeCls} text-sm px-3 py-1`}>
          {queueCount} {queueLabel}
        </span>
      </div>

      {/* Info banner */}
      <div className={bannerCls}>{banner}</div>

      {/* Filter buttons */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all duration-150 ${
              filter === f.key
                ? f.activeCls
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            <span>{f.icon}</span>
            {f.label}
            <span className={`ml-0.5 px-1.5 py-0.5 rounded-md text-[11px] font-bold leading-none ${
              filter === f.key ? f.chipCls : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
            }`}>
              {counts[f.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Forms Table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-900/40">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-200">{active?.label}:</span> {active?.desc}
          </p>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {visible.length} form{visible.length !== 1 ? 's' : ''}
          </span>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-7 h-7 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <FormTable forms={visible} showStage emptyMsg={`No ${filter === 'all' ? '' : active.label.toLowerCase() + ' '}forms found.`} />
        )}
      </div>
    </div>
  );
}
