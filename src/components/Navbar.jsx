import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar({ title, dark, setDark }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div>
          <h1 className="text-xl font-semibold">{title}</h1>
          {user && (
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {user.username} ({user.role})
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {user?.role === 'admin' ? (
            <Link className="rounded bg-slate-200 px-3 py-2 text-sm dark:bg-slate-700" to="/admin">
              Admin
            </Link>
          ) : (
            <Link
              className="rounded bg-slate-200 px-3 py-2 text-sm dark:bg-slate-700"
              to="/dashboard"
            >
              Dashboard
            </Link>
          )}
          <button
            className="rounded bg-slate-200 px-3 py-2 text-sm dark:bg-slate-700"
            onClick={() => setDark(!dark)}
            type="button"
          >
            {dark ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button
            className="rounded bg-rose-600 px-3 py-2 text-sm text-white"
            onClick={onLogout}
            type="button"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
