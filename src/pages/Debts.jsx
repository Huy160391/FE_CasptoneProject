import React from 'react';
import Layout from '../components/Layout';

export default function Debts({ dark, setDark }) {
  return (
    <Layout dark={dark} setDark={setDark} title="Debts (Settlement)">
      <section className="rounded-xl border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <h2 className="mb-2 text-lg font-semibold">Settlement</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Debts page structure is ready. Next step will move debt logic from Dashboard into this page.
        </p>
      </section>
    </Layout>
  );
}
