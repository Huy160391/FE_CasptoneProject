import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import OrderList from '../components/OrderList';
import {
  addItem,
  changePassword,
  confirmDebt,
  createOrder,
  getDebts,
  getOrder,
  payDebt,
} from '../api/axios';
import { useAuth } from '../hooks/useAuth';

const TRACK_KEY = 'tracked_orders';

export default function Dashboard({ dark, setDark }) {
  const { user, updateProfileLocal } = useAuth();
  const [orders, setOrders] = useState([]);
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [shopLink, setShopLink] = useState('');
  const [joinOrderId, setJoinOrderId] = useState('');
  const [dishName, setDishName] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');

  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const orderIds = useMemo(() => {
    const raw = localStorage.getItem(TRACK_KEY);
    return raw ? JSON.parse(raw) : [];
  }, []);

  const saveTrackedOrder = (id) => {
    const next = new Set(orderIds);
    next.add(Number(id));
    localStorage.setItem(TRACK_KEY, JSON.stringify(Array.from(next)));
  };

  const loadOrders = async () => {
    const ids = localStorage.getItem(TRACK_KEY);
    const parsed = ids ? JSON.parse(ids) : [];
    if (!parsed.length) {
      setOrders([]);
      return;
    }

    const result = await Promise.all(parsed.map((id) => getOrder(id).then((r) => r.data).catch(() => null)));
    setOrders(result.filter(Boolean));
  };

  const loadDebts = async () => {
    if (!['chef', 'customer'].includes(user.role)) {
      setDebts([]);
      return;
    }

    const { data } = await getDebts(user.role);
    setDebts(data);
  };

  const init = async () => {
    setLoading(true);
    try {
      await Promise.all([loadOrders(), loadDebts()]);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    init();
  }, []);

  const handleCreateOrder = async (event) => {
    event.preventDefault();
    try {
      const { data } = await createOrder({ shop_link: shopLink || null });
      saveTrackedOrder(data.id);
      setShopLink('');
      await loadOrders();
      alert(`Order #${data.id} created`);
    } catch (err) {
      alert(err.response?.data?.message || 'Create order failed');
    }
  };

  const handleAddDish = async (event) => {
    event.preventDefault();
    const payload = { dish_name: dishName };
    if (originalPrice !== '') {
      payload.original_price = Number(originalPrice);
    }

    try {
      await addItem(Number(joinOrderId), payload);
      saveTrackedOrder(Number(joinOrderId));
      setJoinOrderId('');
      setDishName('');
      setOriginalPrice('');
      await loadOrders();
      alert('Dish added');
    } catch (err) {
      alert(err.response?.data?.message || 'Add dish failed');
    }
  };

  const handleDebtAction = async (debt) => {
    try {
      if (user.role === 'customer') {
        await payDebt(debt.id);
      } else {
        await confirmDebt(debt.id);
      }
      await loadDebts();
    } catch (err) {
      alert(err.response?.data?.message || 'Debt action failed');
    }
  };

  const handleProfile = async (event) => {
    event.preventDefault();
    updateProfileLocal({ name, avatar });

    if (oldPassword || newPassword) {
      try {
        await changePassword({ oldPassword, newPassword });
        setOldPassword('');
        setNewPassword('');
      } catch (err) {
        alert(err.response?.data?.message || 'Change password failed');
        return;
      }
    }

    alert('Profile updated');
  };

  return (
    <Layout dark={dark} setDark={setDark} title="Dashboard">
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <h2 className="mb-3 text-lg font-semibold">Profile</h2>
          <form className="space-y-2" onSubmit={handleProfile}>
            <input
              className="w-full rounded border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800"
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              value={name}
            />
            <input
              className="w-full rounded border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800"
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="Avatar URL"
              value={avatar}
            />
            <input
              className="w-full rounded border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800"
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Old password"
              type="password"
              value={oldPassword}
            />
            <input
              className="w-full rounded border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800"
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              type="password"
              value={newPassword}
            />
            <button className="rounded bg-emerald-600 px-3 py-2 text-white" type="submit">
              Update Profile
            </button>
          </form>
        </section>

        {user.role === 'chef' && (
          <section className="rounded-xl border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <h2 className="mb-3 text-lg font-semibold">Create Order</h2>
            <form className="space-y-2" onSubmit={handleCreateOrder}>
              <input
                className="w-full rounded border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800"
                onChange={(e) => setShopLink(e.target.value)}
                placeholder="Shop link"
                value={shopLink}
              />
              <button className="rounded bg-emerald-600 px-3 py-2 text-white" type="submit">
                Create Order
              </button>
            </form>
          </section>
        )}

        <section className="rounded-xl border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <h2 className="mb-3 text-lg font-semibold">Join Order</h2>
          <form className="space-y-2" onSubmit={handleAddDish}>
            <input
              className="w-full rounded border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800"
              onChange={(e) => setJoinOrderId(e.target.value)}
              placeholder="Order ID"
              required
              type="number"
              value={joinOrderId}
            />
            <input
              className="w-full rounded border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800"
              onChange={(e) => setDishName(e.target.value)}
              placeholder="Dish name"
              required
              value={dishName}
            />
            <input
              className="w-full rounded border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800"
              min="0"
              onChange={(e) => setOriginalPrice(e.target.value)}
              placeholder="Original price (optional)"
              step="0.01"
              type="number"
              value={originalPrice}
            />
            <button className="rounded bg-emerald-600 px-3 py-2 text-white" type="submit">
              Add Dish
            </button>
          </form>
        </section>

        {['chef', 'customer'].includes(user.role) && (
          <section className="rounded-xl border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <h2 className="mb-3 text-lg font-semibold">Debts</h2>
            <div className="space-y-2">
              {debts.map((debt) => (
                <div className="rounded border border-slate-300 p-3 dark:border-slate-700" key={debt.id}>
                  <p className="text-sm">Order #{debt.order_id}</p>
                  <p className="text-sm">Amount: {debt.amount}</p>
                  <p className="mb-2 text-sm">Status: {debt.status}</p>
                  {((user.role === 'customer' && debt.status === 'unpaid') ||
                    (user.role === 'chef' && debt.status === 'paid_confirmed')) && (
                    <button
                      className="rounded bg-slate-900 px-3 py-1 text-sm text-white dark:bg-slate-100 dark:text-slate-900"
                      onClick={() => handleDebtAction(debt)}
                      type="button"
                    >
                      {user.role === 'customer' ? 'Mark as Paid' : 'Confirm Payment'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-xl border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 md:col-span-2" id="orders">
          <h2 className="mb-3 text-lg font-semibold">Orders</h2>
          <OrderList loading={loading} orders={orders} />
        </section>
      </div>
    </Layout>
  );
}
