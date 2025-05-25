// src/services/apiService.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

// Configurar axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para adicionar autenticação
api.interceptors.request.use((config) => {
  // Tentar usar token JWT primeiro (autenticação real)
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('🔐 Usando JWT token para autenticação');
  } else {
    // Fallback para API key (modo de desenvolvimento/teste)
    config.headers['x-api-key'] = API_KEY;
    console.log('🔑 Usando API key para autenticação (fallback)');
  }
  
  return config;
});

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('❌ Token expirado ou inválido');
      // Token expirado - limpar e redirecionar
      localStorage.removeItem('authToken');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
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

  // PRODUTOS
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

  // PEDIDOS
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

  // ✅ CORRIGIDO: Buscar pedidos do cliente usando a API correta
  async getCustomerOrders(customerId) {
    try {
      // Tentar primeiro com a API específica de customer
      const response = await api.get(`/orders/getCustomerOrders?customerId=${customerId}`);
      return response.data.data || response.data.orders || [];
    } catch (error) {
      console.log('⚠️ API getCustomerOrders falhou, tentando getStoreOrders...');
      
      // Fallback: buscar todos os pedidos da loja e filtrar pelo customer
      try {
        const storeId = 'E47OkrK3IcNu1Ys8gD4CA29RrHk2';
        const allOrdersResponse = await api.get(`/orders/getStoreOrders?storeId=${storeId}`);
        const allOrders = allOrdersResponse.data.data || allOrdersResponse.data.orders || [];
        
        // Filtrar pedidos do cliente específico
        const customerOrders = allOrders.filter(order => 
          order.customerId === customerId || 
          order.customerEmail === customerId ||
          order.customer?.id === customerId ||
          order.customer?.email === customerId
        );
        
        console.log(`✅ Encontrados ${customerOrders.length} pedidos para cliente ${customerId}`);
        return customerOrders;
      } catch (fallbackError) {
        console.error('❌ Erro ao buscar pedidos do cliente:', fallbackError);
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

  // ✅ STATUS CUSTOMIZADOS - Usando APIs REAIS do sistema
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

  // ✅ DASHBOARD - Usando APIs REAIS do sistema
  async getDailyStats(startDate, endDate) {
    const response = await api.get(`/dashboard/daily-stats?startDate=${startDate}&endDate=${endDate}`);
    return response.data.data || response.data;
  },

  async getDashboardOverview() {
    const response = await api.get('/dashboard/overview');
    return response.data.data || response.data;
  },

  // ✅ ÁREA DO CLIENTE - Usando API REAL do sistema
  async getCustomerOrderProgress(orderId, customerId) {
    try {
      const response = await api.get(`/customer/orders/${orderId}/progress?customerId=${customerId}`);
      return response.data.data || response.data;
    } catch (error) {
      console.log(`⚠️ Sem progresso customizado para pedido ${orderId}`);
      
      // Fallback: tentar buscar via API de progresso geral
      try {
        const progressResponse = await api.get(`/orders/${orderId}/progress`);
        return progressResponse.data.data || progressResponse.data;
      } catch (fallbackError) {
        console.log('⚠️ Nenhuma API de progresso disponível');
        return null;
      }
    }
  },

  // ✅ CHAT - FUNÇÕES CORRETAS COM NOVA API DO BACKEND
  async getOrderChat(orderId, customerId, storeId) {
    const response = await api.get(`/chat/getOrderChat?orderId=${orderId}&customerId=${customerId}&storeId=${storeId}`);
    return response.data.data || response.data;
  },

  // ✅ NOVA FUNÇÃO - Para compatibilidade com contexts
  async sendMessage(chatId, messageData) {
    console.log('💬 apiService.sendMessage chamada:', { chatId, messageData });
    const response = await api.post(`/chat/sendMessage?chatId=${chatId}`, messageData);
    return response.data.data || response.data;
  },

  // ✅ MANTÉM FUNÇÃO ORIGINAL para compatibilidade
  async sendChatMessage(chatId, messageData) {
    console.log('💬 apiService.sendChatMessage chamada:', { chatId, messageData });
    const response = await api.post(`/chat/sendChatMessage?chatId=${chatId}`, messageData);
    return response.data.data || response.data;
  },

  async getChatMessages(chatId) {
    const response = await api.get(`/chat/getChatMessages?chatId=${chatId}`);
    return response.data.data || response.data.messages || [];
  },

  // ✅ CORRIGIDA - Função para marcar como lido usando nova API
  async markChatAsRead(chatId, userId, userType = null) {
    console.log('✅ apiService.markChatAsRead chamada:', { chatId, userId, userType });
    
    // Construir parâmetros
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

  // ✅ NOVA FUNÇÃO - Obter detalhes do chat
  async getChatDetails(chatId, userId) {
    const response = await api.get(`/chat/getChatDetails?chatId=${chatId}&userId=${userId}`);
    return response.data.data || response.data;
  },

  // ✅ NOVA FUNÇÃO - Atualizar status do chat
  async updateChatStatus(chatId, status, userId) {
    const response = await api.put(`/chat/updateStatus?chatId=${chatId}&userId=${userId}`, { status });
    return response.data;
  },

  // ✅ NOVA FUNÇÃO - Estatísticas de chat
  async getChatStats(userId, isStore) {
    const response = await api.get(`/chat/getStats?userId=${userId}&isStore=${isStore}`);
    return response.data.data || response.data;
  },

  // ✅ NOTIFICAÇÕES - INTEGRAÇÃO COMPLETA COM BACKEND
  
  // Registrar token FCM no backend
  async registerFCMToken(token, deviceInfo = {}) {
    console.log('📱 Registrando token FCM no backend:', token.substring(0, 20) + '...');
    const response = await api.post('/notifications/registerToken', { 
      token, 
      deviceInfo: {
        platform: 'web',
        browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : 
                 navigator.userAgent.includes('Firefox') ? 'Firefox' : 
                 navigator.userAgent.includes('Safari') ? 'Safari' : 'Unknown',
        os: navigator.platform,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        ...deviceInfo
      }
    });
    console.log('✅ Token registrado no backend:', response.data);
    return response.data;
  },

  // Enviar notificação de teste via backend
  async sendTestNotification(token) {
    console.log('🧪 Enviando notificação de teste via backend...');
    const response = await api.post('/notifications/sendTestNotification', { token });
    console.log('✅ Notificação de teste enviada:', response.data);
    return response.data;
  },

  // Buscar meus tokens registrados
  async getMyTokens() {
    console.log('📱 Buscando meus tokens registrados...');
    const response = await api.get('/notifications/getMyTokens');
    return response.data.tokens || [];
  },

  // Inscrever em notificações de uma loja
  async subscribeToStore(storeId) {
    console.log('🏪 Inscrevendo em notificações da loja:', storeId);
    const response = await api.post('/notifications/subscribeToStore', { storeId });
    console.log('✅ Inscrito na loja:', response.data);
    return response.data;
  },

  // Desinscrever de notificações de uma loja
  async unsubscribeFromStore(storeId) {
    console.log('🚫 Desinscrevendo de notificações da loja:', storeId);
    const response = await api.post('/notifications/unsubscribeFromStore', { storeId });
    return response.data;
  },

  // Criar notificação agendada
  async createNotification(notificationData) {
    console.log('📅 Criando notificação:', notificationData);
    const response = await api.post('/notifications/createNotification', notificationData);
    return response.data;
  },

  // Buscar notificações da loja
  async getStoreNotifications(filters = {}) {
    console.log('📋 Buscando notificações da loja...');
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/notifications/getStoreNotifications${params ? '?' + params : ''}`);
    return response.data.notifications || [];
  },

  // Atualizar notificação
  async updateNotification(notificationId, updateData) {
    console.log('✏️ Atualizando notificação:', notificationId);
    const response = await api.put(`/notifications/updateNotification/${notificationId}`, updateData);
    return response.data;
  },

  // Deletar notificação
  async deleteNotification(notificationId) {
    console.log('🗑️ Deletando notificação:', notificationId);
    const response = await api.delete(`/notifications/deleteNotification/${notificationId}`);
    return response.data;
  },

  // Cancelar notificação
  async cancelNotification(notificationId) {
    console.log('⏹️ Cancelando notificação:', notificationId);
    const response = await api.post(`/notifications/cancelNotification/${notificationId}`);
    return response.data;
  },

  // Enviar notificação imediata
  async sendImmediateNotification(notificationData) {
    console.log('⚡ Enviando notificação imediata:', notificationData);
    const response = await api.post('/notifications/sendImmediateNotification', notificationData);
    return response.data;
  },

  // Obter estatísticas de tokens da loja
  async getStoreTokenStats() {
    console.log('📊 Buscando estatísticas de tokens da loja...');
    const response = await api.get('/notifications/getStoreTokenStats');
    return response.data.stats || {};
  },

  // Validar token FCM
  async validateToken(token) {
    console.log('🔍 Validando token FCM...');
    const response = await api.post('/notifications/validateToken', { token });
    return response.data;
  },

  // LEGACY - manter compatibilidade
  async registerDeviceToken(token) {
    return this.registerFCMToken(token);
  },

  // ✅ NOVOS MÉTODOS PARA DEBUGGING E TESTES
  async testConnection() {
    try {
      const response = await api.get('/statusCheck');
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao testar conexão:', error);
      throw error;
    }
  },

  // ✅ Método para buscar dados completos do sistema (debugging)
  async debugSystemData() {
    try {
      console.log('🔍 Debug: Buscando dados do sistema...');
      
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

      console.log('✅ Dados do sistema:', debugData);
      return debugData;
    } catch (error) {
      console.error('❌ Erro no debug:', error);
      return null;
    }
  }
};