import React from 'react';

export default function Step3Description({ data, onChange, errors }) {
  const set = f => e => onChange({ ...data, [f]: e.target.value });

  return (
    <div className="space-y-5">
      <p className="section-title">Step 3 — Description</p>

      <div>
        <label className="label">Description of Change <span className="text-red-500">*</span></label>
        <textarea className={errors.description ? 'input-error' : 'input'} rows={4}
          placeholder="Provide a detailed description of the change being made…"
          value={data.description || ''} onChange={set('description')} />
        {errors.description && <p className="error-msg">{errors.description}</p>}
      </div>

      <div>
        <label className="label">Justification / Business Reason <span className="text-red-500">*</span></label>
        <textarea className={errors.justification ? 'input-error' : 'input'} rows={3}
          placeholder="Why is this change necessary?"
          value={data.justification || ''} onChange={set('justification')} />
        {errors.justification && <p className="error-msg">{errors.justification}</p>}
      </div>

      <div>
        <label className="label">Systems Affected <span className="text-red-500">*</span></label>
        <textarea className={errors.systems_affected ? 'input-error' : 'input'} rows={2}
          placeholder="List all systems, services, or components affected…"
          value={data.systems_affected || ''} onChange={set('systems_affected')} />
        {errors.systems_affected && <p className="error-msg">{errors.systems_affected}</p>}
      </div>
    </div>
  );
}
