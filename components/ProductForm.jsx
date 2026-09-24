'use client';

import { useState, useEffect } from 'react';

export default function ProductForm({
  initialData = null,
  onSubmit,
  isSubmitting = false,
  submitButtonText = 'Save Product',
}) {
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    category: 'beauty',
    description: '',
  });

  const [errors, setErrors] = useState({});

  // Populate form fields if initialData is provided (Edit Mode)
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        price: initialData.price ? String(initialData.price) : '',
        category: initialData.category || 'beauty',
        description: initialData.description || '',
      });
    }
  }, [initialData]);

  // Client-side validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Product title is required.';
    }

    if (!formData.price) {
      newErrors.price = 'Price is required.';
    } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = 'Price must be a positive number.';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required.';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required.';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters long.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Guard against rapid double clicks
    if (isSubmitting) return;

    if (!validateForm()) return;

    onSubmit({
      title: formData.title.trim(),
      price: parseFloat(formData.price),
      category: formData.category.trim(),
      description: formData.description.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Product Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          disabled={isSubmitting}
          suppressHydrationWarning
          placeholder="e.g. Wireless Headphones"
          className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors ${
            errors.title
              ? 'border-red-500 focus:ring-red-200'
              : 'border-gray-300 focus:ring-indigo-200 focus:border-indigo-600'
          } disabled:bg-gray-100 disabled:cursor-not-allowed`}
        />
        {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
      </div>

      {/* Price & Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Price */}
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            Price ($) *
          </label>
          <input
            type="number"
            id="price"
            name="price"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={handleChange}
            disabled={isSubmitting}
            suppressHydrationWarning
            placeholder="29.99"
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors ${
              errors.price
                ? 'border-red-500 focus:ring-red-200'
                : 'border-gray-300 focus:ring-indigo-200 focus:border-indigo-600'
            } disabled:bg-gray-100 disabled:cursor-not-allowed`}
          />
          {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price}</p>}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            disabled={isSubmitting}
            suppressHydrationWarning
            className={`w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 transition-colors ${
              errors.category
                ? 'border-red-500 focus:ring-red-200'
                : 'border-gray-300 focus:ring-indigo-200 focus:border-indigo-600'
            } disabled:bg-gray-100 disabled:cursor-not-allowed`}
          >
            <option value="beauty">Beauty</option>
            <option value="fragrances">Fragrances</option>
            <option value="furniture">Furniture</option>
            <option value="groceries">Groceries</option>
            <option value="smartphones">Smartphones</option>
            <option value="laptops">Laptops</option>
          </select>
          {errors.category && <p className="mt-1 text-xs text-red-600">{errors.category}</p>}
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          value={formData.description}
          onChange={handleChange}
          disabled={isSubmitting}
          suppressHydrationWarning
          placeholder="Provide a detailed description of the product..."
          className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors ${
            errors.description
              ? 'border-red-500 focus:ring-red-200'
              : 'border-gray-300 focus:ring-indigo-200 focus:border-indigo-600'
          } disabled:bg-gray-100 disabled:cursor-not-allowed`}
        />
        {errors.description && (
          <p className="mt-1 text-xs text-red-600">{errors.description}</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          suppressHydrationWarning
          className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium text-sm rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-200 flex items-center justify-center disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Updating Product...
            </>
          ) : (
            submitButtonText
          )}
        </button>
      </div>
    </form>
  );
}