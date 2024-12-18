import axios, { AxiosRequestHeaders, InternalAxiosRequestConfig } from 'axios';

// Cấu hình baseURL nếu cần thiết
const api = axios.create({
  baseURL: 'https://azi-api-nestjs.onrender.com', // URL của API
});

// Tạo middleware để thêm Bearer Token vào mỗi request
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        // Đảm bảo headers không bị undefined
        config.headers = config.headers || {} as AxiosRequestHeaders;
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
