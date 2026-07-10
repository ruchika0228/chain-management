import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Landing             from './pages/Landing';
import PublicForm          from './pages/PublicForm';
import Login               from './pages/Login';
import TaskLogin           from './pages/TaskLogin';
import EmployeeHome        from './pages/EmployeeHome';
import EmployeeTasks       from './pages/EmployeeTasks';
import EmployeeAttendance  from './pages/EmployeeAttendance';
import Layout              from './components/common/Layout';
import FormDetail          from './pages/FormDetail';
import AdminDashboard      from './pages/AdminDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import ModeratorDashboard  from './pages/ModeratorDashboard';
import AdminTaskView       from './pages/AdminTaskView';
import MyTaskLog           from './pages/MyTaskLog';
import UserManagement      from './pages/UserManagement';
import AttendanceManagement from './pages/AttendanceManagement';
import HolidayManagement   from './pages/HolidayManagement';
import Profile             from './pages/Profile';

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

// Redirects logged-in users to their role dashboard; sends unauthenticated users to landing
const HomeRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/" replace />;
  if (user.role === 'admin')       return <Navigate to="/admin" replace />;
  if (user.role === 'super_admin') return <Navigate to="/superadmin" replace />;
  if (user.role === 'employee')    return <Navigate to="/employee" replace />;
  return <Navigate to="/moderator" replace />;
};

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route path="/form"  element={<PublicForm />} />
      <Route path="/login" element={<Login />} />

      <Route path="/tasks/login" element={<TaskLogin />} />

      {/* /dashboard — post-login redirect to role-based home */}
      <Route path="/dashboard" element={<HomeRedirect />} />

      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        {/* Admin Routes */}
        <Route path="admin" element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>} />
        <Route path="admin/tasks" element={<PrivateRoute roles={['admin']}><AdminTaskView /></PrivateRoute>} />
        <Route path="admin/add-task" element={<PrivateRoute roles={['admin']}><MyTaskLog /></PrivateRoute>} />
        <Route path="admin/employees" element={<PrivateRoute roles={['admin']}><UserManagement /></PrivateRoute>} />
        <Route path="admin/attendance" element={<PrivateRoute roles={['admin']}><AttendanceManagement /></PrivateRoute>} />
        <Route path="admin/holidays" element={<PrivateRoute roles={['admin']}><HolidayManagement /></PrivateRoute>} />
        <Route path="admin/profile" element={<PrivateRoute roles={['admin']}><Profile /></PrivateRoute>} />
        
        {/* Super Admin Routes */}
        <Route path="superadmin" element={<PrivateRoute roles={['super_admin']}><SuperAdminDashboard /></PrivateRoute>} />
        <Route path="superadmin/tasks" element={<PrivateRoute roles={['super_admin']}><AdminTaskView /></PrivateRoute>} />
        <Route path="superadmin/employees" element={<PrivateRoute roles={['super_admin']}><UserManagement /></PrivateRoute>} />
        <Route path="superadmin/attendance" element={<PrivateRoute roles={['super_admin']}><AttendanceManagement /></PrivateRoute>} />
        <Route path="superadmin/holidays" element={<PrivateRoute roles={['super_admin']}><HolidayManagement /></PrivateRoute>} />
        <Route path="superadmin/profile" element={<PrivateRoute roles={['super_admin']}><Profile /></PrivateRoute>} />
        
        {/* Moderator Routes */}
        <Route path="moderator" element={<PrivateRoute roles={['moderator']}><ModeratorDashboard /></PrivateRoute>} />
        <Route path="moderator/add-task" element={<PrivateRoute roles={['moderator']}><MyTaskLog /></PrivateRoute>} />
        <Route path="moderator/attendance" element={<PrivateRoute roles={['moderator']}><AttendanceManagement /></PrivateRoute>} />
        <Route path="moderator/profile" element={<PrivateRoute roles={['moderator']}><Profile /></PrivateRoute>} />
        
        {/* Employee Routes */}
        <Route path="employee" element={<PrivateRoute roles={['employee']}><EmployeeHome /></PrivateRoute>} />
        <Route path="employee/tasks" element={<PrivateRoute roles={['employee']}><EmployeeTasks /></PrivateRoute>} />
        <Route path="employee/attendance" element={<PrivateRoute roles={['employee']}><EmployeeAttendance /></PrivateRoute>} />
        <Route path="employee/profile" element={<PrivateRoute roles={['employee']}><Profile /></PrivateRoute>} />
        
        {/* Common Routes */}
        <Route path="forms/:id" element={<FormDetail />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
