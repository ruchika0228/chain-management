import React from 'react';

export default function Step4RiskImpact({ data, onChange, errors }) {
  const set = f => e => onChange({ ...data, [f]: e.target.value });
  const setCheck = f => e => onChange({ ...data, [f]: e.target.checked });

  return (
    <div className="space-y-5">
      <p className="section-title">Step 4 — Risk &amp; Impact Assessment</p>

      {/* Downtime required */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <input
          id="downtime"
          type="checkbox"
          className="mt-0.5 w-4 h-4 accent-blue-600 rounded cursor-pointer"
          checked={!!data.downtime_required}
          onChange={setCheck('downtime_required')}
        />
        <label htmlFor="downtime" className="cursor-pointer">
          <span className="font-medium text-slate-800">Downtime Required</span>
          <p className="text-xs text-slate-500 mt-0.5">Check if this change requires system downtime.</p>
        </label>
      </div>

      {data.downtime_required && (
        <div className="ml-4 border-l-2 border-amber-300 pl-4">
          <label className="label">Estimated Downtime</label>
          <input className="input" placeholder="e.g. 30 minutes, 2 hours"
            value={data.estimated_downtime || ''} onChange={set('estimated_downtime')} />
          <p className="hint">Estimated duration of downtime.</p>
        </div>
      )}

      <div>
        <label className="label">Affected Users / Groups <span className="text-red-500">*</span></label>
        <textarea className={errors.affected_users ? 'input-error' : 'input'} rows={2}
          placeholder="Who will be impacted by this change?"
          value={data.affected_users || ''} onChange={set('affected_users')} />
        {errors.affected_users && <p className="error-msg">{errors.affected_users}</p>}
      </div>

      <div>
        <label className="label">Impact If Not Done <span className="text-red-500">*</span></label>
        <textarea className={errors.impact_if_not_done ? 'input-error' : 'input'} rows={3}
          placeholder="What are the consequences of not implementing this change?"
          value={data.impact_if_not_done || ''} onChange={set('impact_if_not_done')} />
        {errors.impact_if_not_done && <p className="error-msg">{errors.impact_if_not_done}</p>}
      </div>
    </div>
  );
}
