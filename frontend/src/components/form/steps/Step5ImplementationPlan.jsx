import React from 'react';

export default function Step5ImplementationPlan({ data, onChange, errors }) {
  const set = f => e => onChange({ ...data, [f]: e.target.value });

  return (
    <div className="space-y-5">
      <p className="section-title">Step 5 — Implementation Plan</p>

      <div>
        <label className="label">Implementation Plan <span className="text-red-500">*</span></label>
        <textarea className={errors.implementation_plan ? 'input-error' : 'input'} rows={5}
          placeholder="Step-by-step implementation procedure…"
          value={data.implementation_plan || ''} onChange={set('implementation_plan')} />
        {errors.implementation_plan && <p className="error-msg">{errors.implementation_plan}</p>}
      </div>

      <div>
        <label className="label">Proposed Date &amp; Time <span className="text-red-500">*</span></label>
        <input
          type="datetime-local"
          className={errors.proposed_datetime ? 'input-error' : 'input'}
          value={data.proposed_datetime || ''}
          onChange={set('proposed_datetime')}
        />
        <p className="hint">Format: YYYY-MM-DD HH:mm</p>
        {errors.proposed_datetime && <p className="error-msg">{errors.proposed_datetime}</p>}
      </div>

      <div>
        <label className="label">Estimated Duration <span className="text-red-500">*</span></label>
        <input className={errors.estimated_duration ? 'input-error' : 'input'}
          placeholder="e.g. 1 hour, 45 minutes"
          value={data.estimated_duration || ''} onChange={set('estimated_duration')} />
        {errors.estimated_duration && <p className="error-msg">{errors.estimated_duration}</p>}
      </div>
    </div>
  );
}
