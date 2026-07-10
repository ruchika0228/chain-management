import React from 'react';

export default function Step1RequestInfo({ data, onChange, errors }) {
  const set = f => e => onChange({ ...data, [f]: e.target.value });

  return (
    <div className="space-y-5">
      <p className="section-title">Step 1 — Request Information</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="label">Requester Name <span className="text-red-500">*</span></label>
          <input className={errors.requester_name ? 'input-error' : 'input'}
            placeholder="Full name" value={data.requester_name || ''} onChange={set('requester_name')} />
          {errors.requester_name && <p className="error-msg">{errors.requester_name}</p>}
        </div>

        <div>
          <label className="label">Email <span className="text-red-500">*</span></label>
          <input type="email" className={errors.email ? 'input-error' : 'input'}
            placeholder="you@company.com" value={data.email || ''} onChange={set('email')} />
          {errors.email && <p className="error-msg">{errors.email}</p>}
        </div>

        <div>
          <label className="label">Department <span className="text-red-500">*</span></label>
          <input className={errors.department ? 'input-error' : 'input'}
            placeholder="e.g. IT Infrastructure" value={data.department || ''} onChange={set('department')} />
          {errors.department && <p className="error-msg">{errors.department}</p>}
        </div>

        <div>
          <label className="label">Contact Number <span className="text-red-500">*</span></label>
          <input type="tel" className={errors.contact_number ? 'input-error' : 'input'}
            placeholder="10-digit phone number" maxLength={10} value={data.contact_number || ''}
            onChange={e => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 10);
              onChange({ ...data, contact_number: val });
            }} />
          {errors.contact_number && <p className="error-msg">{errors.contact_number}</p>}
          <p className="hint">Enter exactly 10 digits (numbers only).</p>
        </div>
      </div>
    </div>
  );
}
