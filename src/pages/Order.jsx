import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { addItem, createOrder, getOrder } from '../api/axios';
import { useAuth } from '../hooks/useAuth';

export default function Order({ dark, setDark }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [shopLink, setShopLink] = useState('');
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [dishName, setDishName] = useState('');
  const [note, setNote] = useState('');
  const [dishError, setDishError] = useState('');
  const [dishSuccess, setDishSuccess] = useState('');
  const [addingDish, setAddingDish] = useState(false);

  const TRACK_KEY = 'tracked_orders';

  const getTrackedIds = () => {
    const raw = localStorage.getItem(TRACK_KEY);
    const ids = raw ? JSON.parse(raw) : [];
    return Array.isArray(ids) ? ids : [];
  };

  const saveTrackedId = (orderId) => {
    const current = new Set(getTrackedIds());
    current.add(Number(orderId));
    localStorage.setItem(TRACK_KEY, JSON.stringify(Array.from(current)));
  };

  const loadOrders = async () => {
    setLoading(true);

    try {
      // Preserve direct access links by storing the current URL order id.
      if (id) {
        saveTrackedId(id);
      }

      const trackedIds = getTrackedIds();
      if (!trackedIds.length) {
        setOrders([]);
        return;
      }

      const result = await Promise.all(
        trackedIds.map((orderId) => getOrder(orderId).then((r) => r.data).catch(() => null))
      );

      const available = result
        .filter(Boolean)
        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

      setOrders(available);
    } catch (err) {
      alert(err.response?.data?.message || 'Cannot load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [id]);

  useEffect(() => {
    setDishError('');
    setDishSuccess('');
  }, [id]);

  const handleCreateOrder = async (event) => {
    event.preventDefault();
    const trimmedShopLink = shopLink.trim();

    if (!trimmedShopLink) {
      setFormError('Shop link is required');
      return;
    }

    setCreating(true);
    setFormError('');
    setSuccessMessage('');

    try {
      const { data } = await createOrder({ shop_link: trimmedShopLink });
      saveTrackedId(data.id);
      await loadOrders();
      setSuccessMessage('Order created successfully');
      setShowCreateForm(false);
      setShopLink('');
    } catch (err) {
      setFormError(err.response?.data?.message || 'Create order failed');
    } finally {
      setCreating(false);
    }
  };

  const handleAddDish = async (event) => {
    event.preventDefault();

    const orderId = Number(id);
    if (!orderId) {
      setDishError('Please open an order first');
      return;
    }

    const trimmedDishName = dishName.trim();
    const trimmedNote = note.trim();

    if (!trimmedDishName) {
      setDishError('Dish name is required');
      return;
    }

    setAddingDish(true);
    setDishError('');
    setDishSuccess('');

    try {
      await addItem(orderId, {
        dish_name: trimmedDishName,
        note: trimmedNote || null,
      });

      await loadOrders();
      setDishName('');
      setNote('');
      setDishSuccess('Dish added successfully');
    } catch (err) {
      setDishError(err.response?.data?.message || 'Add dish failed');
    } finally {
      setAddingDish(false);
    }
  };

  const renderStatus = (status) => {
    const normalized = String(status || '').toLowerCase();
    const classes =
      normalized === 'locked'
        ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300';

    return <span className={`rounded-full px-2 py-1 text-xs font-semibold uppercase ${classes}`}>{normalized}</span>;
  };

  const formatDate = (value) => {
    if (!value) {
      return '-';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '-';
    }

    return date.toLocaleString();
  };

  const formatPrice = (item) => {
    const value = item.sale_price ?? item.original_price;
    return value === null || value === undefined ? 'Waiting' : value;
  };

  const selectedOrder = id ? orders.find((order) => Number(order.id) === Number(id)) : null;
  const isLocked = selectedOrder?.status === 'locked';

  return (
    <Layout dark={dark} setDark={setDark} title="Orders">
      <section className="space-y-4">
        <header className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Orders</h2>
          {user?.role === 'chef' && (
            <button
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
              onClick={() => {
                setShowCreateForm((prev) => !prev);
                setFormError('');
                setSuccessMessage('');
              }}
              type="button"
            >
              Create Order
            </button>
          )}
        </header>

        {user?.role === 'chef' && showCreateForm && (
          <form
            className="rounded-xl border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
            onSubmit={handleCreateOrder}
          >
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <input
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                onChange={(e) => setShopLink(e.target.value)}
                placeholder="Enter shop link"
                type="text"
                value={shopLink}
              />
              <button
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={creating}
                type="submit"
              >
                {creating ? 'Creating...' : 'Submit'}
              </button>
            </div>
            {formError && <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{formError}</p>}
          </form>
        )}

        {successMessage && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-300">
            {successMessage}
          </div>
        )}

        {id && selectedOrder && (
          <div className="space-y-4 rounded-xl border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-slate-900 dark:text-slate-100">Order #{selectedOrder.id}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Shop link: {selectedOrder.shop_link || '-'}
                </p>
              </div>
              {renderStatus(selectedOrder.status)}
            </div>

            <form className="space-y-3" onSubmit={handleAddDish}>
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  disabled={isLocked || addingDish}
                  onChange={(e) => setDishName(e.target.value)}
                  placeholder="Dish name"
                  type="text"
                  value={dishName}
                />
                <input
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  disabled={isLocked || addingDish}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Note"
                  type="text"
                  value={note}
                />
              </div>
              <button
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isLocked || addingDish}
                type="submit"
              >
                {addingDish ? 'Adding...' : 'Add Dish'}
              </button>
              {isLocked && (
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  This order is locked. You cannot add new dishes.
                </p>
              )}
              {dishError && <p className="text-sm text-rose-600 dark:text-rose-400">{dishError}</p>}
              {dishSuccess && <p className="text-sm text-emerald-600 dark:text-emerald-400">{dishSuccess}</p>}
            </form>

            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-100 dark:bg-slate-800">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-200">User</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-200">Dish</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-200">Note</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-200">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items?.length ? (
                    selectedOrder.items.map((item) => (
                      <tr className="border-t border-slate-200 dark:border-slate-700" key={item.id}>
                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{item.name || item.username || '-'}</td>
                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{item.dish_name}</td>
                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{item.note || '-'}</td>
                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{formatPrice(item)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-3 py-4 text-center text-slate-500 dark:text-slate-400" colSpan={4}>
                        No dishes added yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {id && !loading && !selectedOrder && (
          <div className="rounded-xl border border-slate-300 bg-white p-6 text-sm text-rose-600 dark:border-slate-700 dark:bg-slate-900 dark:text-rose-400">
            Order not found or inaccessible.
          </div>
        )}

        {loading ? (
          <div className="rounded-xl border border-slate-300 bg-white p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
            Loading orders...
          </div>
        ) : orders.length > 0 ? (
          <div className="grid gap-3">
            {orders.map((order) => (
              <button
                className="w-full rounded-xl border border-slate-300 bg-white p-4 text-left transition hover:border-slate-400 hover:shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-500"
                key={order.id}
                onClick={() => navigate(`/orders/${order.id}`)}
                type="button"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {order.shop_link || 'No shop link'}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Created: {formatDate(order.created_at)}
                    </p>
                  </div>
                  {renderStatus(order.status)}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="relative flex min-h-[340px] items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900">
            <img
              alt="Empty orders"
              className="pointer-events-none absolute inset-0 z-0 m-auto h-56 w-56 object-contain opacity-10"
              src="/images/food.png"
            />
            <p className="z-10 text-center text-lg font-semibold text-slate-600 dark:text-slate-300">
              No orders available yet
            </p>
          </div>
        )}
      </section>
    </Layout>
  );
}
