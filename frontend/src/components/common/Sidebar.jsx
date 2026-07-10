import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV = {
  admin: [
    { to: '/admin',          label: 'Stage 1 Review',    icon: '📋' },
    { to: '/admin/tasks',    label: 'Employee Tasks',    icon: '📝' },
    { to: '/admin/add-task', label: 'Add Task',          icon: '➕' },
    { to: '/admin/employees', label: 'Manage Employees',  icon: '👥' },
    { to: '/admin/attendance', label: 'Attendance',       icon: '📅' },
    { to: '/admin/holidays',  label: 'Holidays',         icon: '🏖️' },
    { to: '/admin/profile',   label: 'Profile & Password', icon: '👤' },
  ],
  super_admin: [
    { to: '/superadmin',     label: 'Stage 2 Review',    icon: '✅' },
    { to: '/superadmin/tasks', label: 'Employee Tasks',  icon: '📝' },
    { to: '/superadmin/employees', label: 'Manage Employees',  icon: '👥' },
    { to: '/superadmin/attendance', label: 'Attendance',      icon: '📅' },
    { to: '/superadmin/holidays', label: 'Holidays',         icon: '🏖️' },
    { to: '/superadmin/profile',  label: 'Profile & Password', icon: '👤' },
  ],
  moderator: [
    { to: '/moderator',      label: 'All Requests',      icon: '📊' },
    { to: '/moderator/add-task', label: 'Add Task',      icon: '➕' },
    { to: '/moderator/attendance', label: 'Attendance',  icon: '📅' },
    { to: '/moderator/profile', label: 'Profile & Password', icon: '👤' },
  ],
  employee: [
    { to: '/employee',           label: 'Dashboard',      icon: '🏠' },
    { to: '/employee/tasks',     label: 'My Tasks',       icon: '📝' },
    { to: '/employee/attendance', label: 'My Attendance',  icon: '📅' },
    { to: '/employee/profile',   label: 'Profile',        icon: '👤' },
  ],
};

export default function Sidebar() {
  const { user } = useAuth();
  if (!user) return null;
  const items = NAV[user.role] || [];

  return (
    <aside className="w-52 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0 py-4 px-2 flex flex-col gap-1">
      {items.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`
          }
        >
          <span>{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </aside>
  );
}
