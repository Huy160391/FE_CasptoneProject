import React from 'react';
import { Link } from 'react-router-dom';

function formatDate(value) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleString();
}

function StatusPill({ status }) {
  const normalized = String(status || '').toLowerCase();
  const classes =
    normalized === 'locked'
      ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300';

  return (
    <span className={`rounded-full px-2 py-1 text-xs font-semibold uppercase tracking-wide ${classes}`}>
      {normalized || 'unknown'}
    </span>
  );
}

export default function OrderList({ orders, loading }) {
  if (loading) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">Loading orders...</p>;
  }

  if (!orders.length) {
    return (
      <div className="relative flex min-h-[320px] items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900">
        <img
          alt="Empty orders"
          className="pointer-events-none absolute inset-0 z-0 m-auto h-56 w-56 object-contain opacity-10"
          src="/images/empty-order.png"
        />
        <p className="z-10 text-center text-lg font-semibold text-slate-600 dark:text-slate-300">
          No chef is ready yet
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {orders.map((order) => (
        <Link
          className="group rounded-xl border border-slate-300 bg-white p-4 transition hover:border-slate-400 hover:shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-500"
          key={order.id}
          to={`/orders/${order.id}`}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-900 group-hover:underline dark:text-slate-100">
                {order.shop_link || 'No shop link'}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Created: {formatDate(order.created_at)}
              </p>
            </div>
            <StatusPill status={order.status} />
          </div>
        </Link>
      ))}
    </div>
  );
}
