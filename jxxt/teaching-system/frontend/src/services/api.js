import axios from 'axios';
import { message } from 'antd';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// 请求拦截器 — 自动附加 token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器 — 统一错误处理
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const msg = error.response?.data?.message || '请求失败，请稍后重试';

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      message.error('登录已过期，请重新登录');
    } else {
      message.error(msg);
    }

    return Promise.reject(error);
  }
);

export default api;