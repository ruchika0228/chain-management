import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar  from './Navbar';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
