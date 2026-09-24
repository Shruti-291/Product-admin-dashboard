'use client';

import Link from 'next/link';

export default function ProductTable({ products, onDelete, deletingId }) {
  if (!products || products.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500 my-6">
        No products found.
      </div>
    );
  }

  const handleDeleteClick = (product) => {
    // 1. Show browser native confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.title}" (ID: ${product.id})?`
    );

    // 2. If user cancels, do nothing
    if (!confirmed) return;

    // 3. Trigger parent delete handler
    onDelete(product.id);
  };

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-sm bg-white my-6">
      <table className="w-full text-left text-sm text-gray-600">
        <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-700 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Price</th>
            <th className="px-4 py-3">Rating</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {products.map((product) => {
            const isDeleting = deletingId === product.id;

            return (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">{product.id}</td>
                <td className="px-4 py-3 font-medium text-gray-900">
                  <Link
                    href={`/products/${product.id}`}
                    className="hover:text-indigo-600 transition-colors"
                  >
                    {product.title}
                  </Link>
                </td>
                <td className="px-4 py-3 capitalize">{product.category}</td>
                <td className="px-4 py-3 text-emerald-600 font-semibold">
                  ${product.price}
                </td>
                <td className="px-4 py-3 font-medium text-amber-500">
                  ★ {product.rating || 'N/A'}
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  {/* View Details */}
                  <Link
                    href={`/products/${product.id}`}
                    prefetch={true}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    View
                  </Link>

                  {/* Edit */}
                  <Link
                    href={`/products/${product.id}/edit`}
                    prefetch={true}
                    className="text-xs font-medium text-amber-600 hover:text-amber-800 transition-colors"
                  >
                    Edit
                  </Link>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteClick(product)}
                    disabled={isDeleting || deletingId !== null}
                    suppressHydrationWarning
                    className="text-xs font-medium text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}