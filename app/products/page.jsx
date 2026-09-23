'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getProducts } from '@/services/productApi';
import ProductTable from '@/components/ProductTable';
import Loading from '@/components/Loading';
import ErrorState from '@/components/ErrorState';

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInitialProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProducts(10, 0); // Limit 10, Skip 0
      setProducts(data.products || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchInitialProducts();
  }, [router]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Product Management</h1>

      {loading && <Loading />}

      {!loading && error && (
        <ErrorState message={error} onRetry={fetchInitialProducts} />
      )}

      {!loading && !error && <ProductTable products={products} />}
    </div>
  );
}