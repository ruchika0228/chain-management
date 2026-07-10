import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function EmployeeHome() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activity, setActivity] = useState([]);
  const [loading, setLoading]   = useState(true);

  // Load the whole team's recent task activity (who is doing what)
  const loadActivity = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/tasks?filter=month');
      setActivity(r.data.data.slice(0, 8));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadActivity(); }, [loadActivity]);

  const cards = [
    {
      title: 'My Tasks',
      description: 'Log your daily tasks and view your task history',
      icon: '📝',
      path: '/employee/tasks',
      color: 'blue'
    },
    {
      title: 'My Attendance',
      description: 'View your monthly attendance based on task submissions',
      icon: '📅',
      path: '/employee/attendance',
      color: 'green'
    },
    {
      title: 'My Profile',
      description: 'Update your profile information and change password',
      icon: '👤',
      path: '/employee/profile',
      color: 'purple'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
      purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800'
    };
    return colors[color] || colors.blue;
  };

  const formatDate = (ts) => new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const formatTime = (ts) => new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Welcome, {user?.name}!
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Employee Portal Dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => (
          <button
            key={card.path}
            onClick={() => navigate(card.path)}
            className="card p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group text-left"
          >
            <div className={`w-12 h-12 rounded-xl ${getColorClasses(card.color)} flex items-center justify-center text-2xl mb-4 border group-hover:scale-110 transition-transform duration-200`}>
              {card.icon}
            </div>
            <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-slate-100">
              {card.title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {card.description}
            </p>
          </button>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-base">🕑</span>
            <h2 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
              Recent Team Activity
            </h2>
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500">Last 30 days</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-7 h-7 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : activity.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-400 dark:text-slate-500">
            <svg className="w-9 h-9 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-sm">No recent activity yet.</p>
            <button
              onClick={() => navigate('/employee/tasks')}
              className="btn-primary py-1.5 px-4 text-xs mt-1"
            >
              Log your first task
            </button>
          </div>
        ) : (
          <ul className="space-y-1">
            {activity.map((task) => {
              const isMe = task.user_id === user?.id;
              return (
                <li
                  key={task.id}
                  className="flex items-start gap-3 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0"
                >
                  <span className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                    isMe
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
                  }`}>
                    {task.employee_name?.[0]?.toUpperCase() || '?'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-700 dark:text-slate-200 break-words">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {task.employee_name}
                        {isMe && <span className="ml-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">(You)</span>}
                      </span>
                      <span className="text-slate-400 dark:text-slate-500 mx-1.5">·</span>
                      {task.task_description}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                      {formatDate(task.created_at)} · {formatTime(task.created_at)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
