import React from 'react';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Order from './pages/Order';
import Admin from './pages/Admin';
import Debts from './pages/Debts';
import History from './pages/History';
import Profile from './pages/Profile';
import { useAuth } from './hooks/useAuth';

function ProtectedRoute({ children, roles }) {
  const { token, user } = useAuth();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (roles?.length && !roles.includes(user.role)) {
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/orders" replace />;
  }

  return children;
}

function LegacyOrderRedirect() {
  const { id } = useParams();
  return <Navigate to={`/orders/${id}`} replace />;
}

export default function App() {
  const [dark, setDark] = useState(localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={['admin']}>
              <Dashboard dark={dark} setDark={setDark} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute roles={['chef', 'customer', 'admin']}>
              <Order dark={dark} setDark={setDark} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute roles={['chef', 'customer', 'admin']}>
              <Order dark={dark} setDark={setDark} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/debts"
          element={
            <ProtectedRoute roles={['chef', 'customer', 'admin']}>
              <Debts dark={dark} setDark={setDark} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute roles={['chef', 'customer', 'admin']}>
              <History dark={dark} setDark={setDark} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute roles={['chef', 'customer', 'admin']}>
              <Profile dark={dark} setDark={setDark} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['admin']}>
              <Admin dark={dark} setDark={setDark} />
            </ProtectedRoute>
          }
        />
        <Route path="/order/:id" element={<LegacyOrderRedirect />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}
