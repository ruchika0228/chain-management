import React, { useState } from 'react';
import Step1RequestInfo         from './steps/Step1RequestInfo';
import Step2ChangeClassification from './steps/Step2ChangeClassification';
import Step3Description          from './steps/Step3Description';
import Step4RiskImpact           from './steps/Step4RiskImpact';
import Step5ImplementationPlan   from './steps/Step5ImplementationPlan';
import Step6BackoutPlan          from './steps/Step6BackoutPlan';
import Step7Testing              from './steps/Step7Testing';
import Step8Review               from './steps/Step8Review';

const STEPS = [
  'Request Info',
  'Change Classification',
  'Description',
  'Risk & Impact',
  'Implementation Plan',
  'Backout Plan',
  'Testing',
  'Review & Submit',
];

/* ── per-step validation ───────────────────────────────────── */
const validateStep = (step, data) => {
  const e = {};
  const req = (k, msg) => { if (!data[k]?.toString().trim()) e[k] = msg; };

  if (step === 0) {
    req('requester_name', 'Requester name is required.');
    req('department',     'Department is required.');
    req('contact_number', 'Contact number is required.');
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) e.email = 'Invalid email format.';
    else if (!data.email?.trim()) e.email = 'Email is required.';
    if (data.contact_number && !/^\d{10}$/.test(data.contact_number)) e.contact_number = 'Contact number must be exactly 10 digits.';
  }
  if (step === 1) {
    req('change_title', 'Change title is required.');
    req('change_type',  'Change type is required.');
    if (data.change_type === 'Other') req('change_type_other', 'Please specify the change type.');
    req('category', 'Category is required.');
    if (data.category === 'Other') req('category_other', 'Please specify the category.');
    req('priority',   'Priority is required.');
    req('risk_level', 'Risk level is required.');
  }
  if (step === 2) {
    req('description',      'Description is required.');
    req('justification',    'Justification is required.');
    req('systems_affected', 'Systems affected is required.');
  }
  if (step === 3) {
    req('affected_users',    'Affected users is required.');
    req('impact_if_not_done','Impact if not done is required.');
  }
  if (step === 4) {
    req('implementation_plan', 'Implementation plan is required.');
    req('proposed_datetime',   'Proposed date/time is required.');
    req('estimated_duration',  'Estimated duration is required.');
  }
  if (step === 5) {
    req('resources',          'Resources are required.');
    req('rollback_procedure', 'Rollback procedure is required.');
  }
  if (step === 6) {
    req('test_plan',     'Test plan is required.');
    req('rollback_time', 'Rollback time is required.');
  }
  return e;
};

export default function FormStepper({ onSubmit, submitting }) {
  const [step, setStep]     = useState(0);
  const [data, setData]     = useState({ downtime_required: false });
  const [errors, setErrors] = useState({});

  const next = () => {
    const errs = validateStep(step, data);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStep(s => s + 1);
  };

  const back = () => { setErrors({}); setStep(s => s - 1); };

  const stepProps = { data, onChange: setData, errors };

  const STEP_COMPONENTS = [
    <Step1RequestInfo          {...stepProps} />,
    <Step2ChangeClassification {...stepProps} />,
    <Step3Description          {...stepProps} />,
    <Step4RiskImpact           {...stepProps} />,
    <Step5ImplementationPlan   {...stepProps} />,
    <Step6BackoutPlan          {...stepProps} />,
    <Step7Testing              {...stepProps} />,
    <Step8Review data={data} />,
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* ── Progress Stepper ── */}
      <div className="card p-5">
        <div className="flex items-center">
          {STEPS.map((label, i) => (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center gap-1 min-w-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                  i < step  ? 'bg-blue-600 text-white' :
                  i === step ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/40' :
                  'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}>
                  {i < step ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : i + 1}
                </div>
                <span className={`text-[10px] font-semibold hidden md:block text-center max-w-[60px] leading-tight ${
                  i === step ? 'text-blue-700 dark:text-blue-400' : i < step ? 'text-blue-500' : 'text-slate-400 dark:text-slate-500'
                }`}>{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 transition-colors ${i < step ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── Step Content ── */}
      <div className="card p-6">
        {STEP_COMPONENTS[step]}

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
          <button onClick={back} disabled={step === 0} className="btn-outline disabled:opacity-40">
            ← Back
          </button>
          <span className="text-xs text-slate-400 dark:text-slate-500">Step {step + 1} of {STEPS.length}</span>
          {step < STEPS.length - 1 ? (
            <button onClick={next} className="btn-primary">Next →</button>
          ) : (
            <button onClick={() => onSubmit(data)} disabled={submitting} className="btn-success">
              {submitting ? 'Submitting…' : 'Submit Request'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
