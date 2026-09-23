import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://dummyjson.com",
});

// Request interceptor: attach the auth token (if any) to every request
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: centralized error handling
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(
        `API Error [${error.response.status}]:`,
        error.response.data
      );
    } else {
      console.error("Network/Unknown Error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;