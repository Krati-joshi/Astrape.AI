import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

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


export const login = async (email: string, password: string) => {
  const response = await api.post('/login', { email, password });
  return response.data;
};

export const signup = async (name: string, email: string, password: string) => {
  const response = await api.post('/signup', { name, email, password });
  return response.data;
};

export const getUserProfile = async () => {
  const response = await api.get('/profile');
  return response.data;
};

export const updateUserProfile = async (userData: any) => {
  const response = await api.put('/profile', userData);
  return response.data;
};

export const getProducts = async () => {
  const response = await api.get('/products');
  return response.data;
};

export const getProduct = async (id: string) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (productData: any) => {
  const response = await api.post('/products', productData);
  return response.data;
};

export const updateProduct = async (id: string, productData: any) => {
  const response = await api.put(`/products/${id}`, productData);
  return response.data;
};

export const deleteProduct = async (id: string) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

export default api;