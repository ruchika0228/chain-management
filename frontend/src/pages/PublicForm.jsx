import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormStepper from '../components/form/FormStepper';
import api from '../api/axios';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/common/ThemeToggle';

/* Reusable "back to landing" button — works in both light and dark mode */
function HomeButton({ isDark }) {
  return (
    <Link
      to="/"
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors group ${
        isDark
          ? 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      Home
    </Link>
  );
}

export default function PublicForm() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handleSubmit = async (data) => {
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        requester_name:     data.requester_name     || '',
        email:              data.email              || '',
        department:         data.department,
        contact_number:     data.contact_number,
        change_title:       data.change_title,
        change_type:        data.change_type,
        change_type_other:  data.change_type_other  || null,
        category:           data.category,
        category_other:     data.category_other     || null,
        priority:           data.priority,
        risk_level:         data.risk_level,
        description:        data.description,
        justification:      data.justification,
        systems_affected:   data.systems_affected,
        downtime_required:  data.downtime_required ? 1 : 0,
        affected_users:     data.affected_users,
        impact_if_not_done: data.impact_if_not_done,
        estimated_downtime: data.estimated_downtime || null,
        implementation_plan: data.implementation_plan,
        proposed_datetime:  data.proposed_datetime,
        estimated_duration: data.estimated_duration,
        resources:          data.resources,
        rollback_procedure: data.rollback_procedure,
        test_plan:          data.test_plan,
        rollback_time:      data.rollback_time,
      };

      const res = await api.post('/public/submit', payload);
      setResult(res.data.data.request_id);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Success screen ── */
  if (result) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-200 ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}>
        <div className={`rounded-2xl shadow-xl p-10 max-w-md w-full text-center space-y-6 border ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold">Request Submitted!</h2>
            <p className={`text-sm mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Your IT change request has been submitted and is awaiting approval.
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-xl px-5 py-4">
            <p className="text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wide font-semibold mb-1">Your Request ID</p>
            <p className="text-2xl font-mono font-bold text-blue-700 dark:text-blue-300">{result}</p>
            <p className="text-[11px] text-blue-500 dark:text-blue-400/70 mt-1">Save this for tracking purposes.</p>
          </div>
          <div className="space-y-2.5">
            <button
              onClick={() => { setResult(null); }}
              className="btn-primary w-full py-2.5 rounded-xl font-semibold"
            >
              Submit Another Request
            </button>
            <button
              onClick={() => navigate('/')}
              className="btn-outline w-full py-2.5 rounded-xl font-semibold"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Form ── */
  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Header */}
      <header className={`border-b shadow-sm ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h1 className="font-bold leading-tight">IT Change Request Form</h1>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Submit a new IT change request for approval</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <HomeButton isDark={isDark} />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div className="max-w-4xl mx-auto px-6 pt-4">
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-4 py-3 text-sm">{error}</div>
        </div>
      )}

      {/* Form */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <FormStepper onSubmit={handleSubmit} submitting={submitting} />
      </div>
    </div>
  );
}
