import React from 'react';
import ReviewBoard from '../components/common/ReviewBoard';

export default function SuperAdminDashboard() {
  return (
    <ReviewBoard
      title="Stage 2 Review"
      subtitle="All change requests — filter by review status."
      endpoint="/forms/superadmin"
      defaultFilter="pending"
      queueStage={2}
      queueLabel="awaiting your approval"
      queueBadgeCls="badge-stage2"
      banner={
        <>
          <strong>Stage 2 (Super Admin Review):</strong> Pending forms at Stage 2 have already passed Admin review.
          Approving gives final authorisation. Rejecting terminates the request.
        </>
      }
      bannerCls="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50 rounded-lg px-4 py-3 text-sm text-purple-800 dark:text-purple-300"
    />
  );
}
