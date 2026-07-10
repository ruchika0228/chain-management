import React from 'react';

const Row = ({ label, value }) => (
  <div className="py-2 flex gap-2 border-b border-slate-50 last:border-0">
    <span className="text-slate-500 w-48 shrink-0 text-xs uppercase tracking-wide pt-0.5">{label}</span>
    <span className="text-slate-900 font-medium text-sm flex-1">{value || <span className="text-slate-300">—</span>}</span>
  </div>
);

const Section = ({ title, children }) => (
  <div className="card p-4 space-y-0">
    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">{title}</p>
    {children}
  </div>
);

export default function Step8Review({ data }) {
  const changeTypeDisplay = data.change_type === 'Other' ? data.change_type_other : data.change_type;
  const categoryDisplay   = data.category    === 'Other' ? data.category_other    : data.category;

  return (
    <div className="space-y-4">
      <p className="section-title">Step 8 — Review &amp; Submit</p>

      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
        Please review all information carefully before submitting. Once submitted, the request will enter Stage 1 approval.
      </div>

      <Section title="Request Information">
        <Row label="Department"     value={data.department} />
        <Row label="Contact"        value={data.contact_number} />
      </Section>

      <Section title="Change Classification">
        <Row label="Change Title" value={data.change_title} />
        <Row label="Change Type"  value={changeTypeDisplay} />
        <Row label="Category"     value={categoryDisplay} />
        <Row label="Priority"     value={data.priority} />
        <Row label="Risk Level"   value={data.risk_level} />
      </Section>

      <Section title="Description">
        <Row label="Description"      value={data.description} />
        <Row label="Justification"    value={data.justification} />
        <Row label="Systems Affected" value={data.systems_affected} />
      </Section>

      <Section title="Risk & Impact">
        <Row label="Downtime Required"  value={data.downtime_required ? 'Yes' : 'No'} />
        <Row label="Estimated Downtime" value={data.estimated_downtime} />
        <Row label="Affected Users"     value={data.affected_users} />
        <Row label="Impact If Not Done" value={data.impact_if_not_done} />
      </Section>

      <Section title="Implementation Plan">
        <Row label="Implementation Plan" value={data.implementation_plan} />
        <Row label="Proposed Date/Time"  value={data.proposed_datetime} />
        <Row label="Estimated Duration"  value={data.estimated_duration} />
      </Section>

      <Section title="Backout Plan">
        <Row label="Resources Required" value={data.resources} />
        <Row label="Rollback Procedure" value={data.rollback_procedure} />
      </Section>

      <Section title="Testing">
        <Row label="Test Plan"     value={data.test_plan} />
        <Row label="Rollback Time" value={data.rollback_time} />
      </Section>
    </div>
  );
}
