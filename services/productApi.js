import api from '@/lib/axios';

// 1. Get paginated products
export const getProducts = async (limit = 10, skip = 0) => {
  const response = await api.get(`/products?limit=${limit}&skip=${skip}`);
  return response.data;
};

// 2. Search products by keyword
export const searchProducts = async (query) => {
  const response = await api.get(`/products/search?q=${encodeURIComponent(query)}`);
  return response.data;
};

// 3. Get all product categories
export const getCategories = async () => {
  const response = await api.get('/products/categories');
  return response.data;
};

// 4. Get a single product by ID
export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

// 5. Add a new product
export const addProduct = async (productData) => {
  const response = await api.post('/products/add', productData);
  return response.data;
};

// 6. Update an existing product by ID
export const updateProduct = async (id, productData) => {
  const response = await api.put(`/products/${id}`, productData);
  return response.data;
};

// 7. Delete a product by ID
export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};