import React from 'react';
import HolidayManager from '../components/attendance/HolidayManager';

export default function HolidayManagement() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Holiday Management</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            Manage company holidays and special events calendar.
          </p>
        </div>
      </div>

      <HolidayManager />
    </div>
  );
}