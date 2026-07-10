import React from 'react';

const CHANGE_TYPES = ['Standard Change','Normal Change','Emergency Change','Major Change','Minor Change','Other'];
const CATEGORIES   = ['Hardware','Software','Network','Security','Database','Infrastructure','Cloud / DevOps','Application','Access Management','Backup / Recovery','Other'];
const PRIORITIES   = ['Low','Medium','High','Critical'];
const RISK_LEVELS  = ['Low','Medium','High','Critical'];

export default function Step2ChangeClassification({ data, onChange, errors }) {
  const set = f => e => onChange({ ...data, [f]: e.target.value });

  return (
    <div className="space-y-5">
      <p className="section-title">Step 2 — Change Classification</p>

      {/* Change Title */}
      <div>
        <label className="label">Change Title <span className="text-red-500">*</span></label>
        <input className={errors.change_title ? 'input-error' : 'input'}
          placeholder="Brief title of the change" value={data.change_title || ''} onChange={set('change_title')} />
        {errors.change_title && <p className="error-msg">{errors.change_title}</p>}
      </div>

      {/* Change Type */}
      <div>
        <label className="label">Change Type <span className="text-red-500">*</span></label>
        <select className={errors.change_type ? 'input-error' : 'input'} value={data.change_type || ''} onChange={set('change_type')}>
          <option value="">Select change type…</option>
          {CHANGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        {errors.change_type && <p className="error-msg">{errors.change_type}</p>}
      </div>

      {data.change_type === 'Other' && (
        <div className="ml-4 border-l-2 border-blue-200 pl-4">
          <label className="label">Specify Change Type <span className="text-red-500">*</span></label>
          <input className={errors.change_type_other ? 'input-error' : 'input'}
            placeholder="Describe the change type" value={data.change_type_other || ''} onChange={set('change_type_other')} />
          {errors.change_type_other && <p className="error-msg">{errors.change_type_other}</p>}
        </div>
      )}

      {/* Category */}
      <div>
        <label className="label">Category <span className="text-red-500">*</span></label>
        <select className={errors.category ? 'input-error' : 'input'} value={data.category || ''} onChange={set('category')}>
          <option value="">Select category…</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {errors.category && <p className="error-msg">{errors.category}</p>}
      </div>

      {data.category === 'Other' && (
        <div className="ml-4 border-l-2 border-blue-200 pl-4">
          <label className="label">Specify Category <span className="text-red-500">*</span></label>
          <input className={errors.category_other ? 'input-error' : 'input'}
            placeholder="Describe the category" value={data.category_other || ''} onChange={set('category_other')} />
          {errors.category_other && <p className="error-msg">{errors.category_other}</p>}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* Priority */}
        <div>
          <label className="label">Priority <span className="text-red-500">*</span></label>
          <select className={errors.priority ? 'input-error' : 'input'} value={data.priority || ''} onChange={set('priority')}>
            <option value="">Select…</option>
            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          {errors.priority && <p className="error-msg">{errors.priority}</p>}
        </div>

        {/* Risk Level */}
        <div>
          <label className="label">Risk Level <span className="text-red-500">*</span></label>
          <select className={errors.risk_level ? 'input-error' : 'input'} value={data.risk_level || ''} onChange={set('risk_level')}>
            <option value="">Select…</option>
            {RISK_LEVELS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          {errors.risk_level && <p className="error-msg">{errors.risk_level}</p>}
        </div>
      </div>
    </div>
  );
}
