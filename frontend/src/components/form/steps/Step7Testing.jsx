import React from 'react';

export default function Step7Testing({ data, onChange, errors }) {
  const set = f => e => onChange({ ...data, [f]: e.target.value });

  return (
    <div className="space-y-5">
      <p className="section-title">Step 7 — Testing</p>

      <div>
        <label className="label">Test Plan <span className="text-red-500">*</span></label>
        <textarea className={errors.test_plan ? 'input-error' : 'input'} rows={5}
          placeholder="Describe how you will verify the change was successful. Include test cases, success criteria…"
          value={data.test_plan || ''} onChange={set('test_plan')} />
        {errors.test_plan && <p className="error-msg">{errors.test_plan}</p>}
      </div>

      <div>
        <label className="label">Rollback Time <span className="text-red-500">*</span></label>
        <input className={errors.rollback_time ? 'input-error' : 'input'}
          placeholder="Maximum time allowed before initiating rollback, e.g. 30 minutes"
          value={data.rollback_time || ''} onChange={set('rollback_time')} />
        {errors.rollback_time && <p className="error-msg">{errors.rollback_time}</p>}
        <p className="hint">The maximum time after implementation before you would rollback if tests fail.</p>
      </div>
    </div>
  );
}
