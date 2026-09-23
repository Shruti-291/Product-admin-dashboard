'use client';

import { useEffect, useState } from 'react';
import { getCategories } from '@/services/productApi';

export default function ProductFilters({
  selectedCategory,
  onCategoryChange,
  sortBy,
  order,
  onSortChange,
}) {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load categories', err);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Combine sortBy and order into a single dropdown value
  const currentSortValue = sortBy && order ? `${sortBy}-${order}` : '';

  const handleSortSelect = (e) => {
    const value = e.target.value;
    if (!value) {
      onSortChange('', '');
    } else {
      const [field, dir] = value.split('-');
      onSortChange(field, dir);
    }
  };

  return (
    <div className="mb-6 flex flex-wrap items-center gap-4">
      {/* Category Dropdown */}
      <div className="w-full sm:w-48">
        <label htmlFor="category" className="block text-xs font-medium text-gray-700 mb-1">
          Category
        </label>
        <select
          id="category"
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          disabled={loadingCategories}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white text-gray-900 disabled:bg-gray-100"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => {
            const categorySlug = typeof cat === 'object' ? cat.slug : cat;
            const categoryName = typeof cat === 'object' ? cat.name : cat;

            return (
              <option key={categorySlug} value={categorySlug}>
                {categoryName}
              </option>
            );
          })}
        </select>
      </div>

      {/* Sort Dropdown */}
      <div className="w-full sm:w-48">
        <label htmlFor="sort" className="block text-xs font-medium text-gray-700 mb-1">
          Sort By
        </label>
        <select
          id="sort"
          value={currentSortValue}
          onChange={handleSortSelect}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white text-gray-900"
        >
          <option value="">Default Order</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating-desc">Rating: Highest First</option>
          <option value="rating-asc">Rating: Lowest First</option>
          <option value="title-asc">Title: A to Z</option>
          <option value="title-desc">Title: Z to A</option>
        </select>
      </div>
    </div>
  );
}