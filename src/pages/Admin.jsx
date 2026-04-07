import React from 'react';
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { createUser, deleteUser, getOrder, getUsers, updateUser } from '../api/axios';

const EMPTY_USER = {
  username: '',
  password: '',
  role: 'customer',
  name: '',
  avatar: '',
};

export default function Admin({ dark, setDark }) {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState(EMPTY_USER);
  const [orderId, setOrderId] = useState('');
  const [orderData, setOrderData] = useState(null);

  const loadUsers = async () => {
    const { data } = await getUsers();
    setUsers(data);
  };

  useEffect(() => {
    loadUsers().catch((err) => alert(err.response?.data?.message || 'Load users failed'));
  }, []);

  const onCreateUser = async (event) => {
    event.preventDefault();
    try {
      await createUser(newUser);
      setNewUser(EMPTY_USER);
      await loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Create user failed');
    }
  };

  const onSaveUser = async (user) => {
    try {
      await updateUser(user.id, {
        username: user.username,
        role: user.role,
        name: user.name,
        avatar: user.avatar,
      });
      await loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Update user failed');
    }
  };

  const onDeleteUser = async (id) => {
    if (!window.confirm('Delete user?')) {
      return;
    }

    try {
      await deleteUser(id);
      await loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete user failed');
    }
  };

  const onLoadOrder = async (event) => {
    event.preventDefault();
    try {
      const { data } = await getOrder(Number(orderId));
      setOrderData(data);
    } catch (err) {
      alert(err.response?.data?.message || 'Load order failed');
    }
  };

  return (
    <Layout dark={dark} setDark={setDark} title="Admin">
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <h2 className="mb-3 text-lg font-semibold">Create User</h2>
          <form className="space-y-2" onSubmit={onCreateUser}>
            <input
              className="w-full rounded border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800"
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              placeholder="Username"
              required
              value={newUser.username}
            />
            <input
              className="w-full rounded border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800"
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              placeholder="Password"
              required
              type="password"
              value={newUser.password}
            />
            <select
              className="w-full rounded border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800"
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              value={newUser.role}
            >
              <option value="customer">customer</option>
              <option value="chef">chef</option>
              <option value="admin">admin</option>
            </select>
            <input
              className="w-full rounded border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800"
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              placeholder="Name"
              value={newUser.name}
            />
            <input
              className="w-full rounded border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800"
              onChange={(e) => setNewUser({ ...newUser, avatar: e.target.value })}
              placeholder="Avatar URL"
              value={newUser.avatar}
            />
            <button className="rounded bg-emerald-600 px-3 py-2 text-white" type="submit">
              Create User
            </button>
          </form>
        </section>

        <section className="rounded-xl border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <h2 className="mb-3 text-lg font-semibold">View Order</h2>
          <form className="flex gap-2" onSubmit={onLoadOrder}>
            <input
              className="w-full rounded border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800"
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Order ID"
              required
              type="number"
              value={orderId}
            />
            <button className="rounded bg-slate-900 px-3 py-2 text-white dark:bg-slate-100 dark:text-slate-900" type="submit">
              Load
            </button>
          </form>
          <pre className="mt-3 max-h-80 overflow-auto rounded bg-slate-100 p-3 text-xs dark:bg-slate-800">
            {orderData ? JSON.stringify(orderData, null, 2) : 'No order loaded'}
          </pre>
        </section>

        <section className="rounded-xl border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 lg:col-span-2">
          <h2 className="mb-3 text-lg font-semibold">Users</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-slate-300 text-sm dark:border-slate-700">
              <thead>
                <tr className="bg-slate-200 dark:bg-slate-800">
                  <th className="border p-2 dark:border-slate-700">ID</th>
                  <th className="border p-2 dark:border-slate-700">Username</th>
                  <th className="border p-2 dark:border-slate-700">Role</th>
                  <th className="border p-2 dark:border-slate-700">Name</th>
                  <th className="border p-2 dark:border-slate-700">Avatar</th>
                  <th className="border p-2 dark:border-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr className="bg-white dark:bg-slate-900" key={user.id}>
                    <td className="border p-2 dark:border-slate-700">{user.id}</td>
                    <td className="border p-2 dark:border-slate-700">
                      <input
                        className="w-full rounded border border-slate-300 p-1 dark:border-slate-700 dark:bg-slate-800"
                        onChange={(e) =>
                          setUsers((prev) =>
                            prev.map((u) => (u.id === user.id ? { ...u, username: e.target.value } : u))
                          )
                        }
                        value={user.username}
                      />
                    </td>
                    <td className="border p-2 dark:border-slate-700">
                      <select
                        className="w-full rounded border border-slate-300 p-1 dark:border-slate-700 dark:bg-slate-800"
                        onChange={(e) =>
                          setUsers((prev) =>
                            prev.map((u) => (u.id === user.id ? { ...u, role: e.target.value } : u))
                          )
                        }
                        value={user.role}
                      >
                        <option value="customer">customer</option>
                        <option value="chef">chef</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td className="border p-2 dark:border-slate-700">
                      <input
                        className="w-full rounded border border-slate-300 p-1 dark:border-slate-700 dark:bg-slate-800"
                        onChange={(e) =>
                          setUsers((prev) =>
                            prev.map((u) => (u.id === user.id ? { ...u, name: e.target.value } : u))
                          )
                        }
                        value={user.name || ''}
                      />
                    </td>
                    <td className="border p-2 dark:border-slate-700">
                      <input
                        className="w-full rounded border border-slate-300 p-1 dark:border-slate-700 dark:bg-slate-800"
                        onChange={(e) =>
                          setUsers((prev) =>
                            prev.map((u) => (u.id === user.id ? { ...u, avatar: e.target.value } : u))
                          )
                        }
                        value={user.avatar || ''}
                      />
                    </td>
                    <td className="border p-2 dark:border-slate-700">
                      <div className="flex gap-2">
                        <button
                          className="rounded bg-emerald-600 px-2 py-1 text-white"
                          onClick={() => onSaveUser(user)}
                          type="button"
                        >
                          Save
                        </button>
                        <button
                          className="rounded bg-rose-600 px-2 py-1 text-white"
                          onClick={() => onDeleteUser(user.id)}
                          type="button"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </Layout>
  );
}
