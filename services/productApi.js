import api from '@/lib/axios';

// Get paginated products with optional AbortSignal
export const getProducts = async (limit = 10, skip = 0, signal) => {
  const response = await api.get(`/products?limit=${limit}&skip=${skip}`, { signal });
  return response.data;
};

// Search products by keyword with optional AbortSignal
export const searchProducts = async (query, limit = 10, skip = 0, signal) => {
  const response = await api.get(
    `/products/search?q=${encodeURIComponent(query)}&limit=${limit}&skip=${skip}`,
    { signal }
  );
  return response.data;
};

// Get all product categories
export const getCategories = async () => {
  const response = await api.get('/products/categories');
  return response.data;
};

// Get a single product by ID
export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

// Add a new product
export const addProduct = async (productData) => {
  const response = await api.post('/products/add', productData);
  return response.data;
};

// Update an existing product by ID
export const updateProduct = async (id, productData) => {
  const response = await api.put(`/products/${id}`, productData);
  return response.data;
};

// Delete a product by ID
export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};