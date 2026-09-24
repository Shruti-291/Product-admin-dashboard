import api from '@/lib/axios';

// Simple in-memory cache map
const apiCache = new Map();

// Helper to check and return cached data or execute network call
const fetchWithCache = async (cacheKey, apiCallFn) => {
  if (apiCache.has(cacheKey)) {
    return apiCache.get(cacheKey);
  }

  const data = await apiCallFn();
  apiCache.set(cacheKey, data);
  return data;
};

// 1. Get paginated products with optional sorting and caching
export const getProducts = async (limit = 10, skip = 0, sortBy = '', order = '', signal) => {
  const cacheKey = `products_${limit}_${skip}_${sortBy}_${order}`;
  
  return fetchWithCache(cacheKey, async () => {
    let url = `/products?limit=${limit}&skip=${skip}`;
    if (sortBy && order) {
      url += `&sortBy=${sortBy}&order=${order}`;
    }
    const response = await api.get(url, { signal });
    return response.data;
  });
};

// 2. Search products with caching
export const searchProducts = async (query, limit = 10, skip = 0, sortBy = '', order = '', signal) => {
  const cacheKey = `search_${query}_${limit}_${skip}_${sortBy}_${order}`;

  return fetchWithCache(cacheKey, async () => {
    let url = `/products/search?q=${encodeURIComponent(query)}&limit=${limit}&skip=${skip}`;
    if (sortBy && order) {
      url += `&sortBy=${sortBy}&order=${order}`;
    }
    const response = await api.get(url, { signal });
    return response.data;
  });
};

// 3. Get products by category with caching
export const getProductsByCategory = async (category, limit = 10, skip = 0, sortBy = '', order = '', signal) => {
  const cacheKey = `cat_${category}_${limit}_${skip}_${sortBy}_${order}`;

  return fetchWithCache(cacheKey, async () => {
    let url = `/products/category/${encodeURIComponent(category)}?limit=${limit}&skip=${skip}`;
    if (sortBy && order) {
      url += `&sortBy=${sortBy}&order=${order}`;
    }
    const response = await api.get(url, { signal });
    return response.data;
  });
};

// 4. Get categories with caching
export const getCategories = async () => {
  return fetchWithCache('categories', async () => {
    const response = await api.get('/products/categories');
    return response.data;
  });
};

// 5. Get product by ID
export const getProductById = async (id, signal) => {
  const cacheKey = `product_${id}`;
  return fetchWithCache(cacheKey, async () => {
    const response = await api.get(`/products/${encodeURIComponent(id)}`, { signal });
    return response.data;
  });
};

// Clear cache helper when adding/editing/deleting so fresh data is fetched next time
export const clearProductCache = () => {
  apiCache.clear();
};

export const addProduct = async (productData) => {
  clearProductCache();
  const response = await api.post('/products/add', productData);
  return response.data;
};

export const updateProduct = async (id, productData) => {
  clearProductCache();
  const response = await api.put(`/products/${id}`, productData);
  return response.data;
};

export const deleteProduct = async (id) => {
  clearProductCache();
  const response = await api.delete(`/products/${id}`);
  return response.data;
};