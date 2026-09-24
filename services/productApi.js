import api from '@/lib/axios';

// 1. Get paginated products with optional sorting and AbortSignal
export const getProducts = async (limit = 10, skip = 0, sortBy = '', order = '', signal) => {
  let url = `/products?limit=${limit}&skip=${skip}`;
  if (sortBy && order) {
    url += `&sortBy=${sortBy}&order=${order}`;
  }
  const response = await api.get(url, { signal });
  return response.data;
};

// 2. Search products by keyword with optional sorting and AbortSignal
export const searchProducts = async (query, limit = 10, skip = 0, sortBy = '', order = '', signal) => {
  let url = `/products/search?q=${encodeURIComponent(query)}&limit=${limit}&skip=${skip}`;
  if (sortBy && order) {
    url += `&sortBy=${sortBy}&order=${order}`;
  }
  const response = await api.get(url, { signal });
  return response.data;
};

// 3. Get products by specific category with optional sorting and AbortSignal
export const getProductsByCategory = async (category, limit = 10, skip = 0, sortBy = '', order = '', signal) => {
  let url = `/products/category/${encodeURIComponent(category)}?limit=${limit}&skip=${skip}`;
  if (sortBy && order) {
    url += `&sortBy=${sortBy}&order=${order}`;
  }
  const response = await api.get(url, { signal });
  return response.data;
};

// 4. Get all product categories
export const getCategories = async () => {
  const response = await api.get('/products/categories');
  return response.data;
};

// 5. Get a single product by ID with optional AbortSignal
export const getProductById = async (id, signal) => {
  const response = await api.get(`/products/${encodeURIComponent(id)}`, { signal });
  return response.data;
};

// 6. Add a new product
export const addProduct = async (productData) => {
  const response = await api.post('/products/add', productData);
  return response.data;
};

// 7. Update an existing product by ID
export const updateProduct = async (id, productData, signal) => {
  const response = await api.put(`/products/${encodeURIComponent(id)}`, productData, { signal });
  return response.data;
};
// 8. Delete a product by ID
export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};