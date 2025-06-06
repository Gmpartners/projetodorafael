import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    config.headers['x-api-key'] = API_KEY;
  }
  
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  async lookupCustomerByEmail(email) {
    const response = await api.get(`/customer/lookup-by-email?email=${encodeURIComponent(email)}`);
    return response.data;
  },

  async getOrderProgressByEmail(orderId, email) {
    const response = await api.get(`/customer/orders/${orderId}/progress-by-email?email=${encodeURIComponent(email)}`);
    return response.data;
  },

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

  async createProduct(productData) {
    const response = await api.post('/products/createProduct', productData);
    return response.data;
  },

  async getStoreProducts() {
    const response = await api.get('/products/getStoreProducts');
    return response.data.products;
  },

  async updateProduct(productId, updateData) {
    const response = await api.put(`/products/${productId}`, updateData);
    return response.data;
  },

  async deleteProduct(productId) {
    const response = await api.delete(`/products/${productId}`);
    return response.data;
  },

  async createOrder(orderData) {
    const response = await api.post('/orders/createOrder', orderData);
    return response.data;
  },

  async getOrder(orderId) {
    const response = await api.get(`/orders/getOrder?orderId=${orderId}`);
    return response.data.data || response.data;
  },

  async updateOrderStatus(orderId, status, notes) {
    const response = await api.put(`/orders/updateOrderStatus?orderId=${orderId}`, {
      status,
      notes
    });
    return response.data;
  },

  async getCustomerOrders(customerId) {
    try {
      const response = await api.get(`/orders/getCustomerOrders?customerId=${customerId}`);
      return response.data.data || response.data.orders || [];
    } catch (error) {
      try {
        const storeId = 'E47OkrK3IcNu1Ys8gD4CA29RrHk2';
        const allOrdersResponse = await api.get(`/orders/getStoreOrders?storeId=${storeId}`);
        const allOrders = allOrdersResponse.data.data || allOrdersResponse.data.orders || [];
        
        const customerOrders = allOrders.filter(order => 
          order.customerId === customerId || 
          order.customerEmail === customerId ||
          order.customer?.id === customerId ||
          order.customer?.email === customerId
        );
        
        return customerOrders;
      } catch (fallbackError) {
        return [];
      }
    }
  },

  async getStoreOrders(storeId) {
    const response = await api.get(`/orders/getStoreOrders?storeId=${storeId}`);
    return response.data.data || response.data.orders || [];
  },

  async getOrdersByStatus(storeId, status) {
    const response = await api.get(`/orders/getOrdersByStatus?storeId=${storeId}&status=${status}`);
    return response.data.data || response.data.orders || [];
  },

  async addCustomStepsToOrder(orderId, steps) {
    const response = await api.post(`/orders/${orderId}/custom-steps`, { steps });
    return response.data;
  },

  async advanceOrderStep(orderId) {
    const response = await api.put(`/orders/${orderId}/advance`);
    return response.data;
  },

  async getOrderProgress(orderId) {
    const response = await api.get(`/orders/${orderId}/progress`);
    return response.data.data || response.data;
  },

  async getDailyStats(startDate, endDate) {
    const response = await api.get(`/dashboard/daily-stats?startDate=${startDate}&endDate=${endDate}`);
    return response.data.data || response.data;
  },

  async getDashboardOverview() {
    const response = await api.get('/dashboard/overview');
    return response.data.data || response.data;
  },

  async getCustomerOrderProgress(orderId, customerId) {
    try {
      const response = await api.get(`/customer/orders/${orderId}/progress?customerId=${customerId}`);
      return response.data.data || response.data;
    } catch (error) {
      try {
        const progressResponse = await api.get(`/orders/${orderId}/progress`);
        return progressResponse.data.data || progressResponse.data;
      } catch (fallbackError) {
        return null;
      }
    }
  },

  async getOrderChat(orderId, customerId, storeId) {
    const response = await api.get(`/chat/getOrderChat?orderId=${orderId}&customerId=${customerId}&storeId=${storeId}`);
    return response.data.data || response.data;
  },

  async sendMessage(chatId, messageData) {
    const response = await api.post(`/chat/sendMessage?chatId=${chatId}`, messageData);
    return response.data.data || response.data;
  },

  async sendChatMessage(chatId, messageData) {
    const response = await api.post(`/chat/sendChatMessage?chatId=${chatId}`, messageData);
    return response.data.data || response.data;
  },

  async getChatMessages(chatId) {
    const response = await api.get(`/chat/getChatMessages?chatId=${chatId}`);
    return response.data.data || response.data.messages || [];
  },

  async markChatAsRead(chatId, userId, userType = null) {
    const params = {
      chatId,
      userId
    };
    
    if (userType) {
      params.userType = userType;
    }
    
    const response = await api.put(`/chat/markAsRead`, {}, { params });
    return response.data;
  },

  async getActiveChats(userId, isStore) {
    const response = await api.get(`/chat/getActiveChats?userId=${userId}&isStore=${isStore}`);
    return response.data.data || response.data.chats || [];
  },

  async getChatDetails(chatId, userId) {
    const response = await api.get(`/chat/getChatDetails?chatId=${chatId}&userId=${userId}`);
    return response.data.data || response.data;
  },

  async updateChatStatus(chatId, status, userId) {
    const response = await api.put(`/chat/updateStatus?chatId=${chatId}&userId=${userId}`, { status });
    return response.data;
  },

  async getChatStats(userId, isStore) {
    const response = await api.get(`/chat/getStats?userId=${userId}&isStore=${isStore}`);
    return response.data.data || response.data;
  },

  async createNotification(notificationData) {
    const response = await api.post('/notifications/createNotification', notificationData);
    return response.data;
  },

  async getStoreNotifications(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/notifications/getStoreNotifications${params ? '?' + params : ''}`);
    return response.data.notifications || [];
  },

  async updateNotification(notificationId, updateData) {
    const response = await api.put(`/notifications/updateNotification/${notificationId}`, updateData);
    return response.data;
  },

  async deleteNotification(notificationId) {
    const response = await api.delete(`/notifications/deleteNotification/${notificationId}`);
    return response.data;
  },

  async cancelNotification(notificationId) {
    const response = await api.post(`/notifications/cancelNotification/${notificationId}`);
    return response.data;
  },

  async sendImmediateNotification(notificationData) {
    const response = await api.post('/notifications/sendImmediateNotification', notificationData);
    return response.data;
  },

  async uploadLogo(file) {
    const formData = new FormData();
    formData.append('logo', file);
    
    const response = await api.post('/storeImages/uploadLogo', formData);
    return response.data;
  },

  async uploadBanner(file) {
    const formData = new FormData();
    formData.append('banner', file);
    
    const response = await api.post('/storeImages/uploadBanner', formData);
    return response.data;
  },

  async uploadFavicon(file) {
    const formData = new FormData();
    formData.append('favicon', file);
    
    const response = await api.post('/storeImages/uploadFavicon', formData);
    return response.data;
  },

  async uploadImage(file, imageType) {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('imageType', imageType);
    
    const response = await api.post('/storeImages/uploadImage', formData);
    return response.data;
  },

  async uploadStoreImage(formData) {
    const response = await api.post('/storeImages/uploadImage', formData);
    return response.data;
  },

  async getStoreImages() {
    const response = await api.get('/storeImages/getStoreImages');
    return response.data.data || response.data;
  },

  async removeStoreImage(imageType) {
    const response = await api.delete(`/storeImages/removeImage/${imageType}`);
    return response.data;
  },

  async getBrandingSettings() {
    const response = await api.get('/storeImages/getBrandingSettings');
    return response.data;
  },

  async updateBrandingColors(colors) {
    const response = await api.put('/storeImages/updateBrandingColors', colors);
    return response.data;
  },

  async testConnection() {
    try {
      const response = await api.get('/statusCheck');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async debugSystemData() {
    try {
      const [products, dashboard, storeOrders] = await Promise.allSettled([
        this.getStoreProducts(),
        this.getDashboardOverview(),
        this.getStoreOrders('E47OkrK3IcNu1Ys8gD4CA29RrHk2')
      ]);

      const debugData = {
        products: products.status === 'fulfilled' ? products.value : [],
        dashboard: dashboard.status === 'fulfilled' ? dashboard.value : null,
        orders: storeOrders.status === 'fulfilled' ? storeOrders.value : []
      };

      return debugData;
    } catch (error) {
      return null;
    }
  },

  async getWebPushVapidKey() {
    const response = await api.get('/webPush/vapid-key');
    return response.data;
  },

  async registerWebPushSubscription(data) {
    const response = await api.post('/webPush/subscribe', data);
    return response.data;
  },

  async autoLinkSubscriptionToStore(data) {
    const response = await api.post('/webPush/auto-link-store', data);
    return response.data;
  },

  async checkNotificationStatus(orderId) {
    const response = await api.get(`/customer/notification-status/${orderId}`);
    return response.data;
  },

  async linkNotificationsForOrder(orderId) {
    const response = await api.post(`/customer/link-notifications/${orderId}`);
    return response.data;
  },

  async registerSubscriptionForOrder(orderId, data) {
    const response = await api.post(`/customer/register-for-order/${orderId}`, data);
    return response.data;
  },

  async getCustomerOrderDetails(orderId) {
    const response = await api.get(`/customer/orders/${orderId}/details`);
    return response.data;
  },

  async getStoreInfo(storeId) {
    const response = await api.get(`/customer/stores/${storeId}/info`);
    return response.data;
  },

  async getMyOrders() {
    const response = await api.get('/customer/my-orders');
    return response.data;
  },

  async subscribeToStoreWebPush(storeId) {
    const response = await api.post('/webPush/subscribe-store', { storeId });
    return response.data;
  },

  async unsubscribeFromStoreWebPush(storeId) {
    const response = await api.post('/webPush/unsubscribe-store', { storeId });
    return response.data;
  },

  async sendWebPushTestNotification() {
    const response = await api.post('/webPush/test-notification', {
      title: '🧪 Teste Web Push',
      body: 'Esta é uma notificação de teste do sistema Web Push nativo!'
    });
    return response.data;
  },

  async sendWebPushTestWithCustomUrl(customUrl, options = {}) {
    const response = await api.post('/webPush/test-notification', {
      title: options.title || '🧪 Teste Web Push v8.0',
      body: options.body || `Testando detecção dinâmica de store: ${customUrl}`,
      customUrl,
      storeId: options.storeId,
      image: options.image,
      icon: options.icon,
      ...options
    });
    return response.data;
  },

  async sendCustomWebPushWithUrl(notificationData, customUrl, targetUserId = null) {
    const response = await api.post('/notifications/sendImmediateNotification', {
      ...notificationData,
      target: targetUserId ? 'user' : 'subscribers',
      targetId: targetUserId,
      data: {
        ...(notificationData.data || {}),
        link: customUrl
      }
    });
    return response.data;
  },

  async testWebPushByType(type, customUrl = null, options = {}) {
    const response = await api.post('/webPush/test-types', {
      type,
      customUrl,
      ...options
    });
    return response.data;
  },

  async sendWebPushToStore(storeId, notification, customUrl = null) {
    const response = await api.post('/notifications/sendImmediateNotification', {
      ...notification,
      target: 'subscribers',
      data: {
        ...(notification.data || {}),
        link: customUrl
      }
    });
    return response.data;
  },

  async createEcommercePayload(type, data, customOptions = {}) {
    const response = await api.post('/webPush/create-ecommerce-payload', {
      type,
      data,
      customOptions
    });
    return response.data;
  },

  async sendOrderStatusNotification(orderId, customerId, status, customUrl = null) {
    const response = await api.post('/webPush/send-order-status', {
      orderId,
      customerId,
      status,
      customUrl
    });
    return response.data;
  },

  async sendChatMessageNotification(message, chatData, customUrl = null) {
    const response = await api.post('/webPush/send-chat-message', {
      message,
      chatData,
      customUrl
    });
    return response.data;
  },

  async sendCustomNotificationWithUrl(userId, notification, storeId, customUrl, options = {}) {
    const response = await api.post('/webPush/send-custom-with-url', {
      userId,
      notification,
      storeId,
      customUrl,
      options
    });
    return response.data;
  },

  async getActionTemplates(type = null) {
    const url = type ? `/webPush/action-templates?type=${type}` : '/webPush/action-templates';
    const response = await api.get(url);
    return response.data;
  },

  async validateCustomUrl(url) {
    const response = await api.post('/webPush/validate-url', { url });
    return response.data;
  },

  async getUrlStats(storeId, dateRange = '7d') {
    const response = await api.get(`/webPush/url-stats?storeId=${storeId}&range=${dateRange}`);
    return response.data;
  },

  async testActionCompatibility(actions) {
    const response = await api.post('/webPush/test-actions', { actions });
    return response.data;
  },

  async createNotificationWithSmartActions(data) {
    const response = await api.post('/webPush/create-with-smart-actions', data);
    return response.data;
  },

  async getMyWebPushSubscriptions() {
    const response = await api.get('/webPush/my-subscriptions');
    return response.data;
  },

  async validateWebPushSubscription(subscription) {
    const response = await api.post('/webPush/validate', { subscription });
    return response.data;
  },

  async getWebPushStoreStats(storeId) {
    const response = await api.get(`/webPush/store-stats?storeId=${storeId}`);
    return response.data;
  },

  async sendNotificationWithButtons(notificationData) {
    const response = await api.post('/notifications/sendNotificationWithButtons', notificationData);
    return response.data;
  },

  async previewNotification(notificationData) {
    const response = await api.post('/notifications/previewNotification', notificationData);
    return response.data;
  },

  async getButtonTemplates() {
    const response = await api.get('/notifications/getButtonTemplates');
    return response.data;
  },

  async cleanupDuplicateSubscriptions() {
    const response = await api.post('/notifications/cleanupDuplicateSubscriptions');
    return response.data;
  }
};

export default apiService;