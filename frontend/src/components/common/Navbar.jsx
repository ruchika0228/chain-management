import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const ROLE_LABEL = { admin: 'Admin', super_admin: 'Super Admin', moderator: 'Moderator', employee: 'Employee' };
const ROLE_COLOR = { admin: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', super_admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300', moderator: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300', employee: 'bg-green-100 text-green-800 dark:bg-emerald-900/30 dark:text-emerald-300' };

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-5 gap-4 shrink-0 z-30 shadow-sm">
      <div className="flex items-center gap-2.5 flex-1">
        <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm tracking-tight">IT Change Request System</span>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        {user && (
          <div className="flex items-center gap-3">
            <span className={`badge ${ROLE_COLOR[user.role]}`}>{ROLE_LABEL[user.role]}</span>
            <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">{user.name}</span>
            <button onClick={handleLogout} className="btn-outline text-xs py-1.5 px-3">Sign out</button>
          </div>
        )}
      </div>
    </header>
  );
}
