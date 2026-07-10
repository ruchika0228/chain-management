import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

/* ── helpers ────────────────────────────────────────────────── */
const STATUS_BADGE = { pending: 'badge-pending', approved: 'badge-approved', rejected: 'badge-rejected' };
const PRIORITY_COLOR = { 
  Low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400', 
  Medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', 
  High: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', 
  Critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' 
};
const RISK_COLOR     = { 
  Low: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400', 
  Medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', 
  High: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', 
  Critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' 
};

const Row = ({ label, children }) => (
  <div className="flex flex-col sm:flex-row gap-2 py-3 border-b border-slate-100 dark:border-slate-800/60 last:border-0">
    <span className="text-slate-400 dark:text-slate-500 text-xs w-48 shrink-0 uppercase tracking-wide pt-0.5">{label}</span>
    <span className="text-slate-800 dark:text-slate-200 text-sm flex-1 break-words">{children || '—'}</span>
  </div>
);

const Section = ({ title, children }) => (
  <div className="card p-5">
    <h3 className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">{title}</h3>
    {children}
  </div>
);

/* ── Approval Action Panel ──────────────────────────────────── */
const ActionPanel = ({ form, onAction }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState('');
  const [loading, setLoading]   = useState(false);

  const canActStage1 = user.role === 'admin'       && form.current_stage === 1 && form.status === 'pending';
  const canActStage2 = user.role === 'super_admin'  && form.current_stage === 2 && form.status === 'pending';
  const canAct = canActStage1 || canActStage2;

  if (!canAct) return null;

  const doAction = async (type) => {
    if (type === 'reject' && !comments.trim()) {
      alert('Comments are required when rejecting.'); return;
    }
    setLoading(true);
    try {
      await api.post(`/forms/${form.id}/${type}`, { comments });
      onAction();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="card p-5 border-2 border-blue-100 dark:border-blue-900/40">
      <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
        {canActStage1 ? 'Stage 1 Decision (Admin)' : 'Stage 2 Decision (Super Admin)'}
      </h3>
      <p className="text-slate-500 dark:text-slate-400 text-xs mb-4">
        {canActStage1
          ? 'Approving will forward this request to Stage 2 for final sign-off.'
          : 'This is the final approval. Approving will fully authorise the change.'}
      </p>

      <div className="mb-4">
        <label className="label">Comments</label>
        <textarea className="input resize-none" rows={3} placeholder="Add comments or feedback…"
          value={comments} onChange={e => setComments(e.target.value)} />
        <p className="hint">Required when rejecting.</p>
      </div>

      <div className="flex gap-3">
        <button onClick={() => doAction('approve')} disabled={loading} className="btn-success">
          ✓ Approve
        </button>
        <button onClick={() => doAction('reject')} disabled={loading} className="btn-danger">
          ✗ Reject
        </button>
      </div>
    </div>
  );
};

/* ── Main component ─────────────────────────────────────────── */
export default function FormDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm]     = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const r = await api.get(`/forms/${id}`);
      setForm(r.data.data);
    } catch { navigate('/'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!form) return null;

  const changeTypeDisplay = form.change_type === 'Other' ? form.change_type_other : form.change_type;
  const categoryDisplay   = form.category    === 'Other' ? form.category_other    : form.category;

  return (
    <div className="max-w-4xl space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <button onClick={() => navigate(-1)} className="mt-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-mono text-sm text-blue-600 dark:text-blue-400 font-semibold">{form.request_id}</span>
            <span className={STATUS_BADGE[form.status]}>{form.status}</span>
            <span className={`badge ${form.current_stage === 1 ? 'badge-stage1' : 'badge-stage2'}`}>
              Stage {form.current_stage}
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{form.change_title}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
            Requested by <strong className="text-slate-800 dark:text-slate-200">{form.requester_name}</strong> · {form.department} · {new Date(form.created_at).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Action Panel */}
      <ActionPanel form={form} onAction={load} />

      {/* Approval Progress */}
      <div className="card p-5">
        <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Approval Progress</h3>
        {(() => {
          // Derive each stage's TRUE outcome from the audit trail, so a form
          // approved at Stage 1 then rejected at Stage 2 shows ✓ then ✗.
          const approvals = form.approvals || [];
          const stage1Approved =
            approvals.some(a => Number(a.stage) === 1 && a.decision === 'approved') ||
            form.current_stage === 2 || form.status === 'approved';
          const rejectedStage = form.status === 'rejected'
            ? Number(approvals.find(a => a.decision === 'rejected')?.stage ?? form.current_stage)
            : null;

          const steps = [
            { label: 'Submitted',             state: 'done' },
            {
              label: 'Stage 1 (Admin)',
              state: rejectedStage === 1 ? 'rejected' : stage1Approved ? 'done' : 'pending',
            },
            {
              label: 'Stage 2 (Super Admin)',
              state: rejectedStage === 2 ? 'rejected' : form.status === 'approved' ? 'done' : 'pending',
            },
          ];

          return (
            <div className="flex items-center gap-3">
              {steps.map((s, i) => (
                <React.Fragment key={s.label}>
                  <div className="flex-1 flex flex-col items-center gap-1 text-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      s.state === 'rejected' ? 'bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400' :
                      s.state === 'done'     ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' :
                                               'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                    }`}>
                      {s.state === 'rejected' ? '✗' : s.state === 'done' ? '✓' : i + 1}
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{s.label}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`h-0.5 w-10 shrink-0 ${s.state === 'done' ? 'bg-emerald-400 dark:bg-emerald-600' : 'bg-slate-200 dark:bg-slate-800'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          );
        })()}
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <Section title="Change Classification">
          <Row label="Change Type">{changeTypeDisplay}</Row>
          <Row label="Category">{categoryDisplay}</Row>
          <Row label="Priority"><span className={`badge ${PRIORITY_COLOR[form.priority]}`}>{form.priority}</span></Row>
          <Row label="Risk Level"><span className={`badge ${RISK_COLOR[form.risk_level]}`}>{form.risk_level}</span></Row>
        </Section>

        <Section title="Request Info">
          <Row label="Department">{form.department}</Row>
          <Row label="Contact">{form.contact_number}</Row>
          <Row label="Submitted">{new Date(form.created_at).toLocaleString()}</Row>
        </Section>
      </div>

      <Section title="Description">
        <Row label="Description">{form.description}</Row>
        <Row label="Justification">{form.justification}</Row>
        <Row label="Systems Affected">{form.systems_affected}</Row>
      </Section>

      <Section title="Risk & Impact">
        <Row label="Downtime Required">{form.downtime_required ? 'Yes' : 'No'}</Row>
        <Row label="Estimated Downtime">{form.estimated_downtime}</Row>
        <Row label="Affected Users">{form.affected_users}</Row>
        <Row label="Impact If Not Done">{form.impact_if_not_done}</Row>
      </Section>

      <Section title="Implementation Plan">
        <Row label="Plan">{form.implementation_plan}</Row>
        <Row label="Proposed Date/Time">{form.proposed_datetime ? new Date(form.proposed_datetime).toLocaleString() : null}</Row>
        <Row label="Estimated Duration">{form.estimated_duration}</Row>
      </Section>

      <Section title="Backout Plan">
        <Row label="Resources">{form.resources}</Row>
        <Row label="Rollback Procedure">{form.rollback_procedure}</Row>
      </Section>

      <Section title="Testing">
        <Row label="Test Plan">{form.test_plan}</Row>
        <Row label="Rollback Time">{form.rollback_time}</Row>
      </Section>

      {/* Approval History / Audit Trail */}
      {form.approvals?.length > 0 && (
        <Section title="Approval History (Audit Trail)">
          <div className="space-y-3">
            {form.approvals.map(a => (
              <div key={a.id} className={`p-3 rounded-xl border ${a.decision === 'approved' ? 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/50' : 'bg-red-50/55 dark:bg-red-950/10 border-red-200 dark:border-red-900/50'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{a.approver_name}</span>
                  <span className={`badge ${a.decision === 'approved' ? 'badge-approved' : 'badge-rejected'}`}>{a.decision}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Stage {a.stage} · {a.role.replace('_', ' ')} · {new Date(a.date).toLocaleString()}</p>
                {a.comments && <p className="text-sm text-slate-700 dark:text-slate-300 mt-1.5 italic">"{a.comments}"</p>}
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
