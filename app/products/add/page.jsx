'use client';

import { useState } from 'react';
import Link from 'next/link';
import { addProduct } from '@/services/productApi';
import ProductForm from '@/components/ProductForm';

export default function AddProductPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [createdProduct, setCreatedProduct] = useState(null);

  const handleCreate = async (formData) => {
    setIsSubmitting(true);
    setApiError('');
    setCreatedProduct(null);

    try {
      const result = await addProduct(formData);
      setCreatedProduct(result);
    } catch (err) {
      setApiError(
        err.response?.data?.message || 'Failed to create product. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <nav className="mb-6">
        <Link
          href="/products"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          &larr; Back to Products
        </Link>
      </nav>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Product</h1>

        {apiError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {apiError}
          </div>
        )}

        {createdProduct && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
            <h3 className="text-sm font-bold text-emerald-800 mb-1">
              ✓ Product Added Successfully!
            </h3>
            <p className="text-xs text-emerald-700 mb-3">
              Note: DummyJSON simulates product creation and returns an assigned ID, but does not save it to the actual server database.
            </p>
            <div className="bg-white p-3 rounded border border-emerald-100 text-xs text-gray-700 space-y-1">
              <p><strong>Assigned ID:</strong> {createdProduct.id}</p>
              <p><strong>Title:</strong> {createdProduct.title}</p>
              <p><strong>Price:</strong> ${createdProduct.price}</p>
              <p><strong>Category:</strong> {createdProduct.category}</p>
              <p><strong>Description:</strong> {createdProduct.description}</p>
            </div>
          </div>
        )}

        <ProductForm
          onSubmit={handleCreate}
          isSubmitting={isSubmitting}
          submitButtonText="Save Product"
        />
      </div>
    </div>
  );
}