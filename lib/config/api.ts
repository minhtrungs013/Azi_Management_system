import axios, { AxiosRequestHeaders, InternalAxiosRequestConfig } from 'axios';
// export const URL = "";
export const URL = process.env.NEXT_PUBLIC_API_URL;
// Cấu hình baseURL nếu cần thiết
const api = axios.create({
  baseURL: URL + "/api", // URL của API
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
