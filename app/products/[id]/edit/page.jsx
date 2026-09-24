'use client';

import { useEffect, useState, use, useRef } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { getProductById, updateProduct } from '@/services/productApi';
import ProductForm from '@/components/ProductForm';

export default function EditProductPage({ params }) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [updatedProduct, setUpdatedProduct] = useState(null);

  const abortControllerRef = useRef(null);

  useEffect(() => {
    if (!productId) return;

    // Abort previous inflight request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const fetchProduct = async () => {
      try {
        const data = await getProductById(productId, controller.signal);
        setProduct(data);
      } catch (err) {
        if (axios.isCancel(err) || err.name === 'CanceledError') return;
        setNotFound(true);
      } finally {
        if (abortControllerRef.current === controller) {
          setLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      controller.abort();
    };
  }, [productId]);

  const handleUpdate = async (formData) => {
    setIsSubmitting(true);
    setApiError('');
    setUpdatedProduct(null);

    try {
      const result = await updateProduct(productId, formData);
      setUpdatedProduct(result);
      setProduct((prev) => ({ ...prev, ...result }));
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to update product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-12 text-center text-gray-500">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent mb-2"></div>
        <p className="text-sm">Loading product data...</p>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white border border-gray-200 rounded-xl text-center shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
        <Link href="/products" className="text-sm font-medium text-indigo-600 hover:underline">
          &larr; Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <nav className="mb-6 flex justify-between items-center">
        <Link href="/products" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
          &larr; Back to Products
        </Link>
      </nav>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Product #{productId}</h1>

        {apiError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {apiError}
          </div>
        )}

        {updatedProduct && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800">
            ✓ Product updated successfully!
          </div>
        )}

        <ProductForm
          initialData={product}
          onSubmit={handleUpdate}
          isSubmitting={isSubmitting}
          submitButtonText="Update Product"
        />
      </div>
    </div>
  );
}