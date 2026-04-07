import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginApi } from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import Footer from '../components/Footer';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await loginApi({ username, password });
      login(data.token, data.user);

      if (data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/orders');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      alert(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <main className="mx-auto flex w-full max-w-md flex-1 items-center px-4">
        <section className="w-full rounded-xl border border-slate-300 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h1 className="mb-1 text-2xl font-bold">SONAT Cooking</h1>
          <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">Internal Login</p>
          <form className="space-y-3" onSubmit={onSubmit}>
            <input
              className="w-full rounded border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800"
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required
              value={username}
            />
            <input
              className="w-full rounded border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              type="password"
              value={password}
            />
            <button
              className="w-full rounded bg-emerald-600 p-2 font-medium text-white disabled:opacity-60"
              disabled={loading}
              type="submit"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
        </section>
      </main>
      <Footer />
    </div>
  );
}
