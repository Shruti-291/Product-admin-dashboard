'use client';

import { useEffect, useState, use, useRef } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { getProductById, updateProduct } from '@/services/productApi';
import ProductForm from '@/components/ProductForm';
import Loading from '@/components/Loading';

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

  // Load existing product details on mount
  useEffect(() => {
    if (!productId || isNaN(Number(productId)) || Number(productId) <= 0) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const fetchProduct = async () => {
      setLoading(true);
      setNotFound(false);

      try {
        const data = await getProductById(productId, controller.signal);
        if (!data || !data.id) {
          setNotFound(true);
        } else {
          setProduct(data);
        }
      } catch (err) {
        if (
          axios.isCancel(err) ||
          err.name === 'CanceledError' ||
          err.code === 'ERR_CANCELED' ||
          err.message === 'canceled'
        ) {
          return;
        }
        setNotFound(true);
      } finally {
        if (abortControllerRef.current === controller) {
          setLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [productId]);

  // Handle PUT submission
  const handleUpdate = async (formData) => {
    setIsSubmitting(true);
    setApiError('');
    setUpdatedProduct(null);

    try {
      const result = await updateProduct(productId, formData);

      // Update UI state with returned simulation data
      setUpdatedProduct(result);
      setProduct((prev) => ({ ...prev, ...result }));
    } catch (err) {
      setApiError(
        err.response?.data?.message || 'Failed to update product. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Loading />
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white border border-gray-200 rounded-xl text-center shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
        <p className="text-gray-600 mb-6">
          Cannot edit: The requested product ID does not exist.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
        >
          &larr; Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Navigation */}
      <nav className="mb-6 flex justify-between items-center">
        <Link
          href="/products"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          &larr; Back to Products
        </Link>
        <Link
          href={`/products/${productId}`}
          className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          View Product &rarr;
        </Link>
      </nav>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Edit Product #{productId}
        </h1>

        {/* API Error Alert */}
        {apiError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {apiError}
          </div>
        )}

        {/* Success Feedback Alert showing updated state */}
        {updatedProduct && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
            <h3 className="text-sm font-bold text-emerald-800 mb-1">
              ✓ Product Updated Successfully!
            </h3>
            <p className="text-xs text-emerald-700 mb-3">
              Note: DummyJSON simulates product updates and returns the modified object, but does not persist updates on the actual server database.
            </p>
            <div className="bg-white p-3 rounded border border-emerald-100 text-xs text-gray-700 space-y-1">
              <p><strong>ID:</strong> {updatedProduct.id}</p>
              <p><strong>Title:</strong> {updatedProduct.title}</p>
              <p><strong>Price:</strong> ${updatedProduct.price}</p>
              <p><strong>Category:</strong> {updatedProduct.category}</p>
              <p><strong>Description:</strong> {updatedProduct.description}</p>
            </div>
          </div>
        )}

        {/* Shared Form */}
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