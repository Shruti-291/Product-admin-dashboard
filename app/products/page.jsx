'use client';

import { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { getProducts, searchProducts, getProductsByCategory } from '@/services/productApi';
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
    // Changing sort resets page to 1
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Product Management</h1>

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
          <ProductTable products={products} />
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