import axios, { AxiosRequestHeaders, InternalAxiosRequestConfig } from 'axios';
import { toast } from "react-toastify";
// export const URL = "";
export const URL = process.env.NEXT_PUBLIC_API_URL;
// Cấu hình baseURL nếu cần thiết
const api = axios.create({
  baseURL: URL, // URL của API
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
// Xử lý lỗi toàn cục
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Xử lý lỗi tại đây nếu cần
    if (error.response && error.response.status === 401) {
      // Xử lý trường hợp không có quyền truy cập
      toast.error("Unauthorized access - please log in again", {
        position: "top-right",
        autoClose: 5000,
      });
      // Có thể thêm logic để redirect đến trang đăng nhập
    }
    if (error.response && error.response.status === 403 && error.response.data.error === "Invalid or expired token") {
      // Xử lý trường hợp bị cấm truy cập
      toast.error("Forbidden access - you do not have permission to access this resource", {
        position: "top-right",
        autoClose: 5000,
      });
      window.location.href = '/login'; // Redirect đến trang đăng nhập
    }
    if (error.response && error.response.status === 404) {
      // Xử lý trường hợp không tìm thấy tài nguyên
      toast.error(error.response.data.message || "Resource not found - check the URL", {
        position: "top-right",
        autoClose: 5000,
      });
    }
    return Promise.reject(error);
  }
);

export default api;
