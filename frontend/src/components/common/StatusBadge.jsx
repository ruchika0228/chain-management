import React from 'react';

const STATUS_CONFIG = {
  draft:           { label: 'Draft',            className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  pending:         { label: 'Pending',           className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
  stage1_approved: { label: 'Stage 1 Approved',  className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  approved:        { label: 'Approved',          className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
  rejected:        { label: 'Rejected',          className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
  implemented:     { label: 'Implemented',       className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
  cancelled:       { label: 'Cancelled',         className: 'bg-slate-100 text-slate-500 line-through dark:bg-slate-800 dark:text-slate-400' },
};

const PRIORITY_CONFIG = {
  low:      { label: 'Low',      className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  medium:   { label: 'Medium',   className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  high:     { label: 'High',     className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  critical: { label: 'Critical', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

const RISK_CONFIG = {
  low:    { label: 'Low Risk',    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  medium: { label: 'Medium Risk', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  high:   { label: 'High Risk',   className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

export function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, className: 'bg-gray-100 text-gray-700' };
  return <span className={`badge ${cfg.className}`}>{cfg.label}</span>;
}

export function PriorityBadge({ priority }) {
  const cfg = PRIORITY_CONFIG[priority] || { label: priority, className: 'bg-gray-100 text-gray-700' };
  return <span className={`badge ${cfg.className}`}>{cfg.label}</span>;
}

export function RiskBadge({ risk }) {
  const cfg = RISK_CONFIG[risk] || { label: risk, className: 'bg-gray-100 text-gray-700' };
  return <span className={`badge ${cfg.className}`}>{cfg.label}</span>;
}
