import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FormStepper from '../components/form/FormStepper';
import ThemeToggle from '../components/common/ThemeToggle';
import api from '../api/axios';
import { useTheme } from '../context/ThemeContext';

export default function NewForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (data) => {
    setSubmitting(true);
    try {
      const payload = {
        department:    data.department,
        contact_number: data.contact_number,
        change_title:  data.change_title,
        change_type:   data.change_type,
        change_type_other: data.change_type_other || null,
        category:      data.category,
        category_other: data.category_other || null,
        priority:      data.priority,
        risk_level:    data.risk_level,
        description:   data.description,
        justification: data.justification,
        systems_affected: data.systems_affected,
        downtime_required: data.downtime_required ? 1 : 0,
        affected_users:  data.affected_users,
        impact_if_not_done: data.impact_if_not_done,
        estimated_downtime: data.estimated_downtime || null,
        implementation_plan: data.implementation_plan,
        proposed_datetime:   data.proposed_datetime,
        estimated_duration:  data.estimated_duration,
        resources:           data.resources,
        rollback_procedure:  data.rollback_procedure,
        test_plan:     data.test_plan,
        rollback_time: data.rollback_time,
      };
      const res = await api.post('/forms', payload);
      setSuccess(res.data.data.request_id);
    } catch (err) {
      alert(err.response?.data?.message || 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-200 ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}>
        <div className={`rounded-2xl shadow-xl p-8 max-w-md w-full text-center space-y-5 border ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold">Request Submitted!</h2>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Your change request <strong className="text-blue-600 dark:text-blue-400 font-mono">{success}</strong> has been submitted and is awaiting Stage 1 approval.
          </p>
          <div className="flex gap-3 justify-center pt-2">
            <button onClick={() => navigate('/forms/new')} className="btn-outline">New Request</button>
            <button onClick={() => navigate('/')} className="btn-primary">Go to Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>New Change Request</h1>
          <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Complete all sections and submit for approval.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/')} className="btn-outline text-sm px-3 py-1.5">
            ← Home
          </button>
          <ThemeToggle />
        </div>
      </div>
      <FormStepper onSubmit={handleSubmit} submitting={submitting} />
    </div>
  );
}
