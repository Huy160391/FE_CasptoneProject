import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const sharedItems = [
  { label: 'Orders', to: '/orders' },
  { label: 'Debts (Settlement)', to: '/debts' },
  { label: 'History', to: '/history' },
  { label: 'Profile', to: '/profile' },
];

const adminOnlyItems = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Admin', to: '/admin' },
];

export default function Sidebar() {
  const { user } = useAuth();

  const items = user?.role === 'admin' ? [...adminOnlyItems, ...sharedItems] : sharedItems;

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 lg:block">
        <h2 className="mb-4 text-lg font-bold">SONAT Cooking</h2>
        <nav className="space-y-1">
          {items.map((item) => (
            <NavLink
              className={({ isActive }) =>
                [
                  'block rounded-md px-3 py-2 text-sm transition',
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800',
                ].join(' ')
              }
              key={item.label}
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <aside className="border-b border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 lg:hidden">
        <nav className="flex gap-2 overflow-x-auto">
          {items.map((item) => (
            <NavLink
              className={({ isActive }) =>
                [
                  'whitespace-nowrap rounded-md px-3 py-1.5 text-sm',
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
                ].join(' ')
              }
              key={item.label}
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
