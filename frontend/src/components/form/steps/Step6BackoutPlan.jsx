import React from 'react';

export default function Step6BackoutPlan({ data, onChange, errors }) {
  const set = f => e => onChange({ ...data, [f]: e.target.value });

  return (
    <div className="space-y-5">
      <p className="section-title">Step 6 — Backout Plan</p>

      <div>
        <label className="label">Resources Required <span className="text-red-500">*</span></label>
        <textarea className={errors.resources ? 'input-error' : 'input'} rows={3}
          placeholder="List all resources (personnel, tools, infrastructure) needed…"
          value={data.resources || ''} onChange={set('resources')} />
        {errors.resources && <p className="error-msg">{errors.resources}</p>}
      </div>

      <div>
        <label className="label">Rollback Procedure <span className="text-red-500">*</span></label>
        <textarea className={errors.rollback_procedure ? 'input-error' : 'input'} rows={5}
          placeholder="Step-by-step rollback / backout procedure if the change fails…"
          value={data.rollback_procedure || ''} onChange={set('rollback_procedure')} />
        {errors.rollback_procedure && <p className="error-msg">{errors.rollback_procedure}</p>}
      </div>
    </div>
  );
}
