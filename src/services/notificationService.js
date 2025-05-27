// src/services/notificationService.js
import webPushService from './webPushService';

export const notificationService = {
  // 🚀 Inicializar sistema Web Push
  async initializeNotificationSystem(userRole = 'customer') {
    try {
      console.log('🚀 Inicializando sistema Web Push...');
      
      // Verificar suporte
      if (!webPushService.isSupported) {
        throw new Error('Navegador não suporta Web Push');
      }
      
      // Inicializar Web Push
      const initialized = await webPushService.initialize();
      
      if (!initialized) {
        throw new Error('Falha ao inicializar Web Push');
      }
      
      // Verificar status
      const status = await this.getSystemStatus();
      console.log('📋 Status do sistema:', status);
      
      // Configurar listener para resubscribe se necessário
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', event => {
          if (event.data.type === 'RESUBSCRIBE_NEEDED') {
            console.log('🔄 Re-subscribe necessário');
            this.requestPermissionAndSubscribe();
          }
        });
      }
      
      return {
        status,
        initialized: true
      };
      
    } catch (error) {
      console.error('❌ Erro ao inicializar sistema de notificações:', error);
      throw error;
    }
  },

  // 🔔 Solicitar permissão e fazer subscribe
  async requestPermissionAndSubscribe() {
    try {
      console.log('🔔 Solicitando permissão para notificações...');
      
      const subscription = await webPushService.subscribe();
      
      console.log('✅ Inscrito com sucesso no Web Push');
      
      // Salvar estado localmente
      const subscriptionData = {
        endpoint: subscription.endpoint,
        timestamp: new Date().toISOString(),
        deviceInfo: webPushService.getDeviceInfo()
      };
      
      localStorage.setItem('webpush_subscription', JSON.stringify(subscriptionData));
      
      return subscription;
    } catch (error) {
      console.error('❌ Erro ao solicitar permissão:', error);
      throw error;
    }
  },

  // 📊 Obter status do sistema
  async getSystemStatus() {
    const status = await webPushService.checkSubscription();
    const localData = this.getStoredSubscriptionData();
    
    return {
      supported: webPushService.isSupported,
      permission: status.permission,
      isSubscribed: status.isSubscribed,
      hasLocalData: !!localData,
      ready: status.isSubscribed && status.permission === 'granted',
      domain: window.location.hostname,
      protocol: window.location.protocol,
      ...status
    };
  },

  // 🧪 Enviar notificação de teste
  async sendTestNotification() {
    try {
      console.log('🧪 Enviando notificação de teste Web Push...');
      
      const result = await webPushService.sendTestNotification();
      
      console.log('✅ Notificação de teste enviada:', result);
      return result;
    } catch (error) {
      console.error('❌ Erro ao enviar notificação de teste:', error);
      throw error;
    }
  },

  // 📱 Mostrar notificação local (quando app está em foreground)
  showLocalNotification(payload) {
    if (Notification.permission !== 'granted') {
      console.log('⚠️ Permissão não concedida para mostrar notificação');
      return;
    }

    try {
      const { title, body, icon, badge, data, actions } = payload;
      
      const notification = new Notification(title || 'Nova Notificação', {
        body: body || 'Você tem uma nova atualização',
        icon: icon || '/vite.svg',
        badge: badge || '/vite.svg',
        tag: `notification-${Date.now()}`,
        data: data || {},
        requireInteraction: true,
        actions: actions || []
      });

      // Auto-close após 10 segundos
      setTimeout(() => {
        notification.close();
      }, 10000);

      // Click handler
      notification.onclick = () => {
        console.log('🖱️ Notificação clicada');
        window.focus();
        
        if (data?.url) {
          window.location.href = data.url;
        }
        
        notification.close();
      };

      console.log('🔔 Notificação local mostrada:', title);
    } catch (error) {
      console.error('❌ Erro ao mostrar notificação local:', error);
    }
  },

  // 🗑️ Cancelar inscrição
  async unsubscribe() {
    try {
      await webPushService.unsubscribe();
      localStorage.removeItem('webpush_subscription');
      console.log('✅ Inscrição cancelada com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro ao cancelar inscrição:', error);
      throw error;
    }
  },

  // 💾 Obter dados salvos localmente
  getStoredSubscriptionData() {
    try {
      const data = localStorage.getItem('webpush_subscription');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('❌ Erro ao recuperar dados salvos:', error);
      return null;
    }
  },

  // 🧹 Limpar dados salvos
  clearStoredData() {
    try {
      localStorage.removeItem('webpush_subscription');
      console.log('🧹 Dados de notificação limpos');
    } catch (error) {
      console.error('❌ Erro ao limpar dados:', error);
    }
  },

  // ℹ️ Obter permissão atual
  getPermissionStatus() {
    if (!('Notification' in window)) {
      return 'not-supported';
    }
    return Notification.permission;
  },

  // 🔧 Forçar atualização do Service Worker
  async forceServiceWorkerUpdate() {
    try {
      console.log('🔄 Forçando atualização do Service Worker...');
      
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      for (const registration of registrations) {
        await registration.unregister();
      }
      
      // Limpar caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      
      // Recarregar página
      setTimeout(() => {
        window.location.reload(true);
      }, 1000);
      
    } catch (error) {
      console.error('❌ Erro ao forçar atualização:', error);
      throw error;
    }
  },

  // 📊 Obter estatísticas detalhadas
  getDetailedStats() {
    const storedData = this.getStoredSubscriptionData();
    const deviceInfo = webPushService.getDeviceInfo();
    
    return {
      system: {
        supported: webPushService.isSupported,
        permission: this.getPermissionStatus(),
        serviceWorker: 'serviceWorker' in navigator
      },
      device: deviceInfo,
      subscription: storedData ? {
        hasSubscription: true,
        created: storedData.timestamp,
        endpoint: storedData.endpoint ? 'exists' : 'missing'
      } : {
        hasSubscription: false
      },
      browser: {
        name: deviceInfo.browser,
        platform: deviceInfo.os,
        online: navigator.onLine,
        language: navigator.language
      }
    };
  },

  // 🔄 Verificar e atualizar subscription se necessário
  async checkAndUpdateSubscription() {
    try {
      const status = await webPushService.checkSubscription();
      
      if (!status.isSubscribed && status.permission === 'granted') {
        console.log('🔄 Re-inscrevendo no Web Push...');
        await this.requestPermissionAndSubscribe();
      }
      
      return status;
    } catch (error) {
      console.error('❌ Erro ao verificar subscription:', error);
      return null;
    }
  },

  // 📱 Simular notificação (para testes locais)
  async simulateNotification(title, body, data = {}) {
    try {
      console.log('🎭 Simulando notificação local...');
      
      this.showLocalNotification({
        title,
        body,
        data: {
          ...data,
          timestamp: new Date().toISOString(),
          source: 'local-simulation'
        }
      });
      
      return { 
        success: true, 
        message: 'Notificação simulada enviada!'
      };
    } catch (error) {
      console.error('❌ Erro ao simular notificação:', error);
      throw error;
    }
  }
};

export default notificationService;
