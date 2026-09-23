import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor to handle errors cleanly
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Ignore canceled requests (do not log them as network errors)
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    if (error.response) {
      console.error("API Error Response:", error.response.data);
    } else {
      console.error("Network/Unknown Error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;