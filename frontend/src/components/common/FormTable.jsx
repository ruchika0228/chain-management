import React from 'react';
import { useNavigate } from 'react-router-dom';

const STATUS_BADGE = {
  pending:  'badge-pending',
  approved: 'badge-approved',
  rejected: 'badge-rejected',
};

const PRIORITY_COLOR = {
  Low:      'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  Medium:   'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  High:     'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  Critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function FormTable({ forms, emptyMsg = 'No forms found.', showStage = false }) {
  const navigate = useNavigate();

  if (!forms?.length) return (
    <div className="text-center py-16 text-slate-400 dark:text-slate-500 text-sm">{emptyMsg}</div>
  );

  return (
    <div className="overflow-x-auto">
      <table className="tbl">
        <thead>
          <tr>
            <th>Request ID</th>
            <th>Change Title</th>
            <th>Type</th>
            <th>Priority</th>
            <th>Requester</th>
            {showStage && <th>Stage</th>}
            <th>Status</th>
            <th>Date</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {forms.map(f => (
            <tr key={f.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
              <td className="font-mono text-xs text-blue-600 dark:text-blue-400">{f.request_id}</td>
              <td className="max-w-[180px] truncate font-semibold text-slate-800 dark:text-slate-200">{f.change_title}</td>
              <td className="text-slate-600 dark:text-slate-300 text-xs">{f.display_change_type}</td>
              <td><span className={`badge ${PRIORITY_COLOR[f.priority]}`}>{f.priority}</span></td>
              <td className="text-slate-600 dark:text-slate-300 font-medium">{f.requester_name}</td>
              {showStage && (
                <td>
                  <span className={f.current_stage === 1 ? 'badge-stage1' : 'badge-stage2'}>
                    Stage {f.current_stage}
                  </span>
                </td>
              )}
              <td><span className={STATUS_BADGE[f.status]}>{f.status}</span></td>
              <td className="text-slate-400 dark:text-slate-500 text-xs">{new Date(f.created_at).toLocaleDateString()}</td>
              <td>
                <button onClick={() => navigate(`/forms/${f.id}`)}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-xs font-semibold">
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
