// src/services/apiService.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

// Configurar axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY
  }
});

// Interceptor para adicionar token de autorização
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado - fazer logout
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // AUTENTICAÇÃO
  async registerCustomer(customerData) {
    const response = await api.post('/auth/registerCustomer', customerData);
    return response.data;
  },

  async registerStore(storeData) {
    const response = await api.post('/auth/registerStore', storeData);
    return response.data;
  },

  async getUserProfile(token) {
    const response = await api.get('/auth/getUserProfile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.user;
  },

  // PEDIDOS
  async createOrder(orderData) {
    const response = await api.post('/orders/createOrder', orderData);
    return response.data;
  },

  async getOrder(orderId) {
    const response = await api.get(`/orders/getOrder?orderId=${orderId}`);
    return response.data.data;
  },

  async updateOrderStatus(orderId, status, notes) {
    const response = await api.put(`/orders/updateOrderStatus?orderId=${orderId}`, {
      status,
      notes
    });
    return response.data;
  },

  async getCustomerOrders(customerId) {
    const response = await api.get(`/orders/getCustomerOrders?customerId=${customerId}`);
    return response.data.data;
  },

  async getStoreOrders(storeId) {
    const response = await api.get(`/orders/getStoreOrders?storeId=${storeId}`);
    return response.data.data;
  },

  async getOrdersByStatus(storeId, status) {
    const response = await api.get(`/orders/getOrdersByStatus?storeId=${storeId}&status=${status}`);
    return response.data.data;
  },

  // CHAT
  async getOrderChat(orderId, customerId, storeId) {
    const response = await api.get(`/chat/getOrderChat?orderId=${orderId}&customerId=${customerId}&storeId=${storeId}`);
    return response.data.data;
  },

  async sendChatMessage(chatId, messageData) {
    const response = await api.post(`/chat/sendChatMessage?chatId=${chatId}`, messageData);
    return response.data;
  },

  async getChatMessages(chatId) {
    const response = await api.get(`/chat/getChatMessages?chatId=${chatId}`);
    return response.data.data;
  },

  async markChatAsRead(chatId, userId) {
    const response = await api.put(`/chat/markChatAsRead?chatId=${chatId}&userId=${userId}`);
    return response.data;
  },

  async getActiveChats(userId, isStore) {
    const response = await api.get(`/chat/getActiveChats?userId=${userId}&isStore=${isStore}`);
    return response.data.data;
  },

  // NOTIFICAÇÕES
  async registerDeviceToken(token) {
    const response = await api.post('/notifications/registerDeviceToken', { token });
    return response.data;
  },

  async sendTestNotification(token) {
    const response = await api.post('/notifications/sendTestNotification', { token });
    return response.data;
  }
};