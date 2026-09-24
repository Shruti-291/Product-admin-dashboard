'use client';

import { useEffect, useState, use, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import { getProductById } from '@/services/productApi';
import Loading from '@/components/Loading';

export default function ProductDetailPage({ params }) {
  // Unwrap route parameters
  const resolvedParams = use(params);
  const productId = resolvedParams.id;

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const abortControllerRef = useRef(null);

  useEffect(() => {
    // Validate if ID is a valid positive integer/number
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
          // Set initial active image
          setSelectedImage(data.images?.[0] || data.thumbnail || '');
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

        // If API returns 404, mark as not found
        if (err.response?.status === 404) {
          setNotFound(true);
        } else {
          setNotFound(true);
        }
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

  // Loading State
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <Loading />
      </div>
    );
  }

  // Not Found State (Invalid ID or 404 from API)
  if (notFound || !product) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white border border-gray-200 rounded-xl text-center shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
        <p className="text-gray-600 mb-6">
          The product you are looking for does not exist or has an invalid ID.
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
    <div className="max-w-5xl mx-auto p-6">
      {/* Breadcrumb Navigation */}
      <nav className="mb-6">
        <Link
          href="/products"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          &larr; Back to Products
        </Link>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-6 border border-gray-200 rounded-xl shadow-sm mb-8">
        {/* Images Gallery Section */}
        <div>
          <div className="relative w-full h-80 bg-gray-50 rounded-lg overflow-hidden mb-4 border border-gray-100">
            {selectedImage ? (
              <Image
                src={selectedImage}
                alt={product.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain p-2"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No Image Available
              </div>
            )}
          </div>

          {/* Thumbnail Strip */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images.map((imgUrl, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(imgUrl)}
                  className={`relative w-16 h-16 rounded-md overflow-hidden border-2 flex-shrink-0 transition-all ${
                    selectedImage === imgUrl ? 'border-indigo-600 ring-2 ring-indigo-200' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Image
                    src={imgUrl}
                    alt={`${product.title} thumbnail ${index + 1}`}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details Section */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 capitalize">
                {product.category}
              </span>
              {product.brand && (
                <span className="text-xs text-gray-500 font-medium">Brand: {product.brand}</span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.title}</h1>
            <p className="text-2xl font-bold text-emerald-600 mb-4">${product.price}</p>

            <h2 className="text-sm font-semibold text-gray-900 mb-1">Description</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">{product.description}</p>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Customer Reviews</h2>

        {product.reviews && product.reviews.length > 0 ? (
          <div className="space-y-4">
            {product.reviews.map((review, index) => (
              <div key={index} className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-gray-900 text-sm">{review.reviewerName}</span>
                  <span className="text-xs text-amber-500 font-bold">
                    {'★'.repeat(review.rating)}
                    <span className="text-gray-300">{'★'.repeat(5 - review.rating)}</span>
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-2">
                  {new Date(review.date).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No reviews available for this product.</p>
        )}
      </div>
    </div>
  );
}