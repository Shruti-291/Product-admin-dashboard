'use client';

import { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import {
  getProducts,
  searchProducts,
  getProductsByCategory,
  deleteProduct,
} from '@/services/productApi';
import ProductTable from '@/components/ProductTable';
import Pagination from '@/components/Pagination';
import SearchBar from '@/components/SearchBar';
import ProductFilters from '@/components/ProductFilters';
import Loading from '@/components/Loading';
import ErrorState from '@/components/ErrorState';

const parseURLParams = (searchParams) => {
  const allowedSizes = [10, 20, 50];

  let page = parseInt(searchParams.get('page'), 10);
  let pageSize = parseInt(searchParams.get('pageSize'), 10);
  let searchQuery = searchParams.get('q') || '';
  let categoryQuery = searchParams.get('category') || '';
  let sortBy = searchParams.get('sortBy') || '';
  let order = searchParams.get('order') || '';

  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(pageSize) || !allowedSizes.includes(pageSize)) pageSize = 10;

  return { page, pageSize, searchQuery, categoryQuery, sortBy, order };
};

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { page: currentPage, pageSize, searchQuery, categoryQuery, sortBy, order } =
    parseURLParams(searchParams);

  const [products, setProducts] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State to track deletion status and feedback
  const [deletingId, setDeletingId] = useState(null);
  const [actionFeedback, setActionFeedback] = useState(null);

  const abortControllerRef = useRef(null);

  const fetchProducts = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const skip = (currentPage - 1) * pageSize;
      let data;

      if (searchQuery.trim() !== '') {
        data = await searchProducts(
          searchQuery,
          pageSize,
          skip,
          sortBy,
          order,
          controller.signal
        );
      } else if (categoryQuery.trim() !== '') {
        data = await getProductsByCategory(
          categoryQuery,
          pageSize,
          skip,
          sortBy,
          order,
          controller.signal
        );
      } else {
        data = await getProducts(pageSize, skip, sortBy, order, controller.signal);
      }

      const total = data.total || 0;
      const totalPages = Math.ceil(total / pageSize);

      if (total > 0 && currentPage > totalPages) {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', totalPages.toString());
        router.replace(`/products?${params.toString()}`);
        return;
      }

      setProducts(data.products || []);
      setTotalItems(total);
    } catch (err) {
      if (
        axios.isCancel(err) ||
        err.name === 'CanceledError' ||
        err.code === 'ERR_CANCELED' ||
        err.message === 'canceled'
      ) {
        return;
      }
      setError(err.response?.data?.message || 'Failed to fetch products');
    } finally {
      if (abortControllerRef.current === controller) {
        setLoading(false);
      }
    }
  }, [currentPage, pageSize, searchQuery, categoryQuery, sortBy, order, router, searchParams]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchProducts();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [router, fetchProducts]);

  // Handle product deletion
  // const handleDeleteProduct = async (id) => {
  //   if (deletingId) return; // Guard against multiple rapid requests

  //   setDeletingId(id);
  //   setActionFeedback(null);

  //   try {
  //     await deleteProduct(id);

  //     // Remove deleted item locally from state
  //     setProducts((prev) => prev.filter((item) => item.id !== id));
  //     setTotalItems((prev) => Math.max(0, prev - 1));

  //     setActionFeedback({
  //       type: 'success',
  //       message: `Product #${id} deleted successfully (simulated).`,
  //     });
  //   } catch (err) {
  //     setActionFeedback({
  //       type: 'error',
  //       message: err.response?.data?.message || `Failed to delete product #${id}.`,
  //     });
  //   } finally {
  //     setDeletingId(null);
  //   }
  // };

    // Optimistic Delete Handler
  const handleDeleteProduct = async (id) => {
    if (deletingId) return; // Guard against multiple rapid clicks

  // 1. Find and save product backup in case of network error
    const productToDelete = products.find((p) => p.id === id);
    if (!productToDelete) return;

  // 2. OPTIMISTIC UPDATE: Remove item from UI state IMMEDIATELY
    setProducts((prev) => prev.filter((item) => item.id !== id));
    setTotalItems((prev) => Math.max(0, prev - 1));
    setDeletingId(id);
    setActionFeedback(null);

    try {
    // 3. Perform network call in background
      await deleteProduct(id);

      setActionFeedback({
        type: 'success',
        message: `Product #${id} deleted successfully.`,
      });
    } catch (err) {
    // 4. ROLLBACK: Reinsert product into list if API fails
      setProducts((prev) => [productToDelete, ...prev]);
      setTotalItems((prev) => prev + 1);

      setActionFeedback({
        type: 'error',
        message: err.response?.data?.message || `Failed to delete product #${id}. Restored to list.`,
      });
    } finally {
      setDeletingId(null);
    }
  };

  const updateQueryParams = (newPage, newPageSize, newSearch, newCategory, newSortBy, newOrder) => {
    const params = new URLSearchParams();
    params.set('page', newPage.toString());
    params.set('pageSize', newPageSize.toString());

    if (newSearch.trim() !== '') {
      params.set('q', newSearch.trim());
    } else if (newCategory.trim() !== '') {
      params.set('category', newCategory.trim());
    }

    if (newSortBy && newOrder) {
      params.set('sortBy', newSortBy);
      params.set('order', newOrder);
    }

    router.push(`/products?${params.toString()}`);
  };

  const handleSearch = useCallback(
    (query) => {
      updateQueryParams(1, pageSize, query, '', sortBy, order);
    },
    [pageSize, sortBy, order]
  );

  const handleCategoryChange = (category) => {
    updateQueryParams(1, pageSize, '', category, sortBy, order);
  };

  const handleSortChange = (newSortBy, newOrder) => {
    updateQueryParams(1, pageSize, searchQuery, categoryQuery, newSortBy, newOrder);
  };

  const handlePageChange = (newPage) => {
    updateQueryParams(newPage, pageSize, searchQuery, categoryQuery, sortBy, order);
  };

  const handlePageSizeChange = (newPageSize) => {
    updateQueryParams(1, newPageSize, searchQuery, categoryQuery, sortBy, order);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
        <Link
          href="/products/add"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          + Add Product
        </Link>
      </div>

      {/* Action Alert Banner */}
      {actionFeedback && (
        <div
          className={`mb-4 p-4 rounded-lg text-sm flex justify-between items-center ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <span>{actionFeedback.message}</span>
          <button
            onClick={() => setActionFeedback(null)}
            className="text-xs font-bold underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <SearchBar initialValue={searchQuery} onSearch={handleSearch} delay={500} />
        <ProductFilters
          selectedCategory={categoryQuery}
          onCategoryChange={handleCategoryChange}
          sortBy={sortBy}
          order={order}
          onSortChange={handleSortChange}
        />
      </div>

      {loading && <Loading />}

      {!loading && error && <ErrorState message={error} onRetry={fetchProducts} />}

      {!loading && !error && (
        <>
          <ProductTable
            products={products}
            onDelete={handleDeleteProduct}
            deletingId={deletingId}
          />
          <Pagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ProductsContent />
    </Suspense>
  );
}