import React from 'react';

export default function Footer() {
  return (
    <footer className="mt-6 border-t border-slate-200 bg-slate-50 px-4 py-8 text-center text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
      <div className="mx-auto max-w-4xl space-y-3 text-sm">
        <p className="text-base text-slate-800 dark:text-slate-200">
          This is a side project by HuyNQ, built with Cursor and GitHub Copilot.
        </p>
        <p>
          <span className="text-slate-900 dark:text-slate-100">© 2026 GoldPath</span>
          <span className="mx-2">·</span>
          <span>MIT License</span>
        </p>
        <p>
          This software is free for anyone to use, copy, modify, and share. See the repository{' '}
          <span className="rounded bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-800 dark:bg-slate-700 dark:text-slate-100">
            LICENSE
          </span>{' '}
          file for full terms.
        </p>
      </div>
    </footer>
  );
}
