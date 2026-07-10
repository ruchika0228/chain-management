import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AttendanceCalendar from '../components/attendance/AttendanceCalendar';
import EmployeeAttendanceCalendar from '../components/attendance/EmployeeAttendanceCalendar';

/*
 * Attendance panel:
 *  - Admin / Moderator → two boxes: "My Attendance" (own calendar) + "Employee Attendance" (per-employee calendar)
 *  - Super Admin       → "Employee Attendance" only
 * Holiday management lives on its own "Holidays" page — not here.
 */
export default function AttendanceManagement() {
  const { user } = useAuth();
  const showMy = user?.role !== 'super_admin';
  const [view, setView] = useState(showMy ? 'my' : 'employees');

  const boxes = [
    ...(showMy ? [{
      key: 'my',
      icon: '🙋',
      title: 'My Attendance',
      desc: 'Your own monthly attendance based on your task submissions',
      accent: 'emerald',
    }] : []),
    {
      key: 'employees',
      icon: '👥',
      title: 'Employee Attendance',
      desc: 'Select an employee and view their monthly attendance',
      accent: 'blue',
    },
  ];

  const accentCls = (accent, active) => {
    if (!active) return 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900';
    return accent === 'emerald'
      ? 'border-emerald-500 dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 ring-1 ring-emerald-500/40 shadow-md shadow-emerald-500/10'
      : 'border-blue-500 dark:border-blue-500 bg-blue-50 dark:bg-blue-950/30 ring-1 ring-blue-500/40 shadow-md shadow-blue-500/10';
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Attendance</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
          {showMy ? 'View your own attendance or monitor employee attendance.' : 'Monitor employee attendance records.'}
        </p>
      </div>

      {/* Selector boxes */}
      <div className={`grid grid-cols-1 ${boxes.length > 1 ? 'md:grid-cols-2' : ''} gap-4`}>
        {boxes.map(b => (
          <button
            key={b.key}
            onClick={() => setView(b.key)}
            className={`text-left rounded-xl border p-5 transition-all duration-150 ${accentCls(b.accent, view === b.key)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{b.icon}</span>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{b.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{b.desc}</p>
                </div>
              </div>
              {view === b.key && (
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                  b.accent === 'emerald'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-blue-600 text-white'
                }`}>
                  Active
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Selected view */}
      {view === 'my' && showMy
        ? <EmployeeAttendanceCalendar hideHeader />
        : <AttendanceCalendar />}
    </div>
  );
}
