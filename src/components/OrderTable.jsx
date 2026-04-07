import React from 'react';
export default function OrderTable({ items, canEdit, onSavePrice }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-slate-300 text-sm dark:border-slate-700">
        <thead>
          <tr className="bg-slate-200 dark:bg-slate-800">
            <th className="border p-2 dark:border-slate-700">User</th>
            <th className="border p-2 dark:border-slate-700">Dish</th>
            <th className="border p-2 dark:border-slate-700">Original Price</th>
            <th className="border p-2 dark:border-slate-700">Sale Price</th>
            <th className="border p-2 dark:border-slate-700">Action</th>
          </tr>
        </thead>
        <tbody>
          {items?.map((item) => (
            <tr key={item.id} className="bg-white dark:bg-slate-900">
              <td className="border p-2 dark:border-slate-700">{item.name || item.username || '-'}</td>
              <td className="border p-2 dark:border-slate-700">{item.dish_name}</td>
              <td className="border p-2 dark:border-slate-700">
                <input
                  className="w-full rounded border border-slate-300 p-1 dark:border-slate-700 dark:bg-slate-800"
                  defaultValue={item.original_price ?? ''}
                  disabled={!canEdit}
                  id={`original-${item.id}`}
                  min="0"
                  step="0.01"
                  type="number"
                />
              </td>
              <td className="border p-2 dark:border-slate-700">
                <input
                  className="w-full rounded border border-slate-300 p-1 dark:border-slate-700 dark:bg-slate-800"
                  defaultValue={item.sale_price ?? ''}
                  disabled={!canEdit}
                  id={`sale-${item.id}`}
                  min="0"
                  step="0.01"
                  type="number"
                />
              </td>
              <td className="border p-2 dark:border-slate-700">
                {canEdit ? (
                  <button
                    className="rounded bg-emerald-600 px-2 py-1 text-white"
                    onClick={() => {
                      const original = document.getElementById(`original-${item.id}`).value;
                      const sale = document.getElementById(`sale-${item.id}`).value;
                      onSavePrice(item.id, original, sale);
                    }}
                    type="button"
                  >
                    Save Price
                  </button>
                ) : (
                  'Locked'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
