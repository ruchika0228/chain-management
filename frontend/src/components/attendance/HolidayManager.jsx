import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export default function HolidayManager() {
  const { user } = useAuth();
  // Only admin / super_admin may add or delete holidays. Others (e.g. moderator)
  // get a read-only view.
  const canManage = ['admin', 'super_admin'].includes(user?.role);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', date: '' });
  const [deleteId, setDeleteId] = useState(null);

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const res = await api.get('/attendance/holidays');
      setHolidays(res.data.data || []);
    } catch (e) {
      console.error('Failed to fetch holidays', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHolidays(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.date) {
      alert('Please fill all fields');
      return;
    }
    
    try {
      await api.post('/attendance/holidays', formData);
      setFormData({ name: '', date: '' });
      setShowAddForm(false);
      fetchHolidays();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to add holiday');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/attendance/holidays/${id}`);
      setDeleteId(null);
      fetchHolidays();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to delete holiday');
    }
  };

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Holidays</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{canManage ? 'Manage company holidays' : 'Company holidays'}</p>
        </div>
        {canManage && (
          <button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary text-sm px-3 py-1.5">
            {showAddForm ? 'Cancel' : 'Add Holiday'}
          </button>
        )}
      </div>

      {canManage && showAddForm && (
        <div className="card p-4 mb-5 border-l-4 border-blue-500">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">Add New Holiday</h3>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Holiday Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Diwali"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex items-end">
              <button type="submit" className="btn-primary w-full py-2 text-sm">
                Add Holiday
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-7 h-7 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {holidays.length === 0 ? (
            <div className="text-center py-10 text-slate-500 dark:text-slate-400">
              <p>No holidays added yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">Name</th>
                    <th className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">Date</th>
                    {canManage && <th className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {holidays.map(h => (
                    <tr key={h.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300">{h.name}</td>
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300 font-medium">
                        {(() => {
                          // Avoid UTC offset off-by-one: parse YYYY-MM-DD as local date
                          const [y, m, d] = h.holiday_date.split('-').map(Number);
                          return new Date(y, m - 1, d).toLocaleDateString('en-IN', {
                            weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
                          });
                        })()}
                      </td>
                      {canManage && (
                        <td className="py-3 px-3">
                          <button
                            onClick={() => setDeleteId(h.id)}
                            className="text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 text-xs font-medium"
                          >
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">Confirm Delete</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Are you sure you want to delete this holiday? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="btn-outline flex-1 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="btn-danger flex-1 py-2 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
