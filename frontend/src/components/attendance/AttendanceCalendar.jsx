import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

// Returns today's date string as YYYY-MM-DD in local time (avoids UTC off-by-one)
const getTodayStr = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export default function AttendanceCalendar() {
  const [currentDate,      setCurrentDate]      = useState(new Date());
  const [employees,        setEmployees]         = useState([]);
  const [selectedEmployee, setSelectedEmployee]  = useState('');
  const [loading,          setLoading]           = useState(false);
  const [statusMap,        setStatusMap]         = useState({});
  const [holidayMap,       setHolidayMap]        = useState({});

  const year        = currentDate.getFullYear();
  const month       = currentDate.getMonth(); // 0-indexed
  const firstDay    = new Date(year, month, 1);
  const lastDay     = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Load employee list on mount
  useEffect(() => {
    api.get('/tasks/employees')
      .then(r => setEmployees(r.data.data))
      .catch(console.error);
  }, []);

  const getDaysInMonth = () => {
    const days = [];
    const startDay = firstDay.getDay();
    for (let i = 0; i < startDay; i++) days.push({ day: null, date: null });
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({
        day: d,
        date: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      });
    }
    return days;
  };

  // Returns true if the date is a holiday (Sunday, 2nd/4th Saturday, or admin-added)
  const isHoliday = (dateStr) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d); // local midnight — no UTC shift
    const dayOfWeek       = date.getDay();
    const dayOfMonth      = date.getDate();

    if (dayOfWeek === 0) return true; // Sunday

    if (dayOfWeek === 6) { // Saturday — 2nd and 4th only
      // Nth occurrence of this weekday in the month (1st=days 1-7, 2nd=8-14, ...)
      const saturdayOfMonth = Math.ceil(dayOfMonth / 7);
      return saturdayOfMonth === 2 || saturdayOfMonth === 4;
    }

    return !!holidayMap[dateStr]; // admin-added holiday
  };

  // Returns true if the date is strictly in the future (after today)
  const isFuture = (dateStr) => dateStr > getTodayStr();

  // Calendar cell colour
  // Priority: holiday → yellow | future → neutral | task → green | no task → red
  const getStatusColor = (dateStr, hasTask) => {
    if (isHoliday(dateStr))
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700';
    if (isFuture(dateStr))
      return 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700';
    if (hasTask)
      return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700';
    return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700';
  };

  // Calendar cell emoji
  const getStatusLabel = (dateStr, hasTask) => {
    if (isHoliday(dateStr)) return '🟡';
    if (isFuture(dateStr))  return '';   // no emoji for future dates
    if (hasTask)            return '🟢';
    return '🔴';
  };

  const fetchAttendance = async () => {
    if (!selectedEmployee) {
      setStatusMap({});
      return;
    }
    setLoading(true);
    try {
      const mm = String(month + 1).padStart(2, '0');
      const dd = String(daysInMonth).padStart(2, '0');
      const [taskRes, holidayRes] = await Promise.all([
        api.get(`/tasks?employee_id=${selectedEmployee}&start_date=${year}-${mm}-01&end_date=${year}-${mm}-${dd}`),
        api.get('/attendance/holidays'),
      ]);

      const tasks       = taskRes.data.data    || [];
      const holidayData = holidayRes.data.data || [];

      const tasksByDate = {};
      tasks.forEach(task => {
        const date = task.created_at.split('T')[0];
        tasksByDate[date] = true;
      });

      const holidayDateMap = {};
      holidayData.forEach(h => { holidayDateMap[h.holiday_date] = h.name; });

      setStatusMap(tasksByDate);
      setHolidayMap(holidayDateMap);
    } catch (e) {
      console.error('Failed to fetch attendance data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAttendance(); }, [year, month, selectedEmployee]);

  const days     = getDaysInMonth();
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const todayStr = getTodayStr();

  return (
    <div className="space-y-5">
      {/* Employee Selection */}
      <div className="card p-5">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Attendance Tracking</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Select an employee to view their monthly attendance</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="min-w-[250px] flex-1 max-w-md">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Employee</label>
            <select
              className="input"
              value={selectedEmployee}
              onChange={e => setSelectedEmployee(e.target.value)}
            >
              <option value="">Select an employee...</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name} — {emp.email}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Calendar */}
      {selectedEmployee && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {employees.find(e => e.id == selectedEmployee)?.name || 'Employee'} Attendance
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={prevMonth} className="btn-outline text-sm px-3 py-1.5">←</button>
              <button onClick={nextMonth} className="btn-outline text-sm px-3 py-1.5">→</button>
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="w-7 h-7 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          <div className="grid grid-cols-7 gap-1">
            {weekdays.map(day => (
              <div key={day} className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400 py-2">
                {day}
              </div>
            ))}
            {days.map((d, i) => {
              if (!d.day) return <div key={`empty-${i}`} className="h-12" />;

              const dateStr     = d.date;
              const isToday     = dateStr === todayStr;
              const hasTask     = !!statusMap[dateStr];
              const holidayName = holidayMap[dateStr];
              const future      = isFuture(dateStr);
              const holiday     = isHoliday(dateStr);

              return (
                <div
                  key={dateStr}
                  className={`h-12 rounded flex flex-col items-center justify-center text-xs border transition-colors ${
                    isToday ? 'ring-2 ring-blue-400 dark:ring-blue-500' : ''
                  } ${getStatusColor(dateStr, hasTask)}`}
                  title={
                    holiday
                      ? `Holiday${holidayName ? `: ${holidayName}` : ''}`
                      : future
                        ? 'Upcoming'
                        : hasTask
                          ? 'Task Submitted'
                          : 'No Task Submitted'
                  }
                >
                  <span className="font-semibold">{d.day}</span>
                  <span className="text-base leading-none">{getStatusLabel(dateStr, hasTask)}</span>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-5 mt-5">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-base">🟢</span>
              <span className="text-slate-600 dark:text-slate-400">Task Submitted</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-base">🔴</span>
              <span className="text-slate-600 dark:text-slate-400">Task Not Submitted</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-base">🟡</span>
              <span className="text-slate-600 dark:text-slate-400">Holiday</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-3 h-3 rounded-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 inline-block" />
              <span className="text-slate-600 dark:text-slate-400">Upcoming</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
