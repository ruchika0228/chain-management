import React from 'react';
import ReviewBoard from '../components/common/ReviewBoard';

export default function AdminDashboard() {
  return (
    <ReviewBoard
      title="Stage 1 Review"
      subtitle="All change requests — filter by review status."
      endpoint="/forms/admin"
      defaultFilter="pending"
      queueStage={1}
      queueLabel="awaiting your review"
      queueBadgeCls="badge-stage1"
      banner={
        <>
          <strong>Stage 1 (Admin Review):</strong> Approving moves the request to Stage 2 for final Super Admin sign-off.
          Rejecting terminates the request.
        </>
      }
      bannerCls="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-lg px-4 py-3 text-sm text-blue-800 dark:text-blue-300"
    />
  );
}
