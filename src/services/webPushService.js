// src/services/webPushService.js - v8.0 Sistema com Detecção Dinâmica de Store
import apiService from './apiService';

class WebPushService {
  constructor() {
    this.vapidPublicKey = null;
    this.subscription = null;
    this.isSupported = 'PushManager' in window && 'serviceWorker' in navigator;
    this.registration = null;
    this.version = 'v8.0.0-dynamic-store-detection';
    this.debugMode = true;
  }

  async initialize() {
    if (!this.isSupported) {
      console.warn('⚠️ Web Push não é suportado neste navegador');
      console.warn('APIs disponíveis:', {
        serviceWorker: 'serviceWorker' in navigator,
        pushManager: 'PushManager' in window,
        notification: 'Notification' in window
      });
      return false;
    }

    try {
      console.log(`🚀 Inicializando Web Push Service ${this.version}...`);
      
      this.registration = await this.registerServiceWorker();
      await this.fetchVapidKey();
      
      const existingSubscription = await this.registration.pushManager.getSubscription();
      if (existingSubscription) {
        this.subscription = existingSubscription;
        console.log('✅ Subscription v8.0 existente encontrada');
      }
      
      console.log(`✅ Web Push Service ${this.version} inicializado com sucesso`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao inicializar Web Push v8.0:', error);
      console.error('Stack:', error.stack);
      return false;
    }
  }

  async registerServiceWorker() {
    try {
      console.log('📦 Registrando Service Worker v8.0...');
      
      const existingReg = await navigator.serviceWorker.getRegistration('/');
      if (existingReg) {
        console.log('♻️ Service Worker já registrado:', existingReg);
        await navigator.serviceWorker.ready;
        return existingReg;
      }
      
      let registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });
      
      console.log('✅ Service Worker v8.0 registrado:', registration.scope);
      await navigator.serviceWorker.ready;
      
      if (registration.active) {
        console.log('🔍 Service Worker ativo:', registration.active.scriptURL);
      }
      
      this.setupServiceWorkerListeners(registration);
      return registration;
    } catch (error) {
      console.error('❌ Erro ao registrar Service Worker v8.0:', error);
      throw error;
    }
  }

  async cleanupOldServiceWorkers() {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      console.log('🔍 Service Workers encontrados:', registrations.length);
      
      for (const registration of registrations) {
        console.log('SW:', registration.scope, registration.active?.scriptURL);
      }
    } catch (error) {
      console.warn('⚠️ Erro ao verificar SWs:', error);
    }
  }

  setupServiceWorkerListeners(registration) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      const { type, data } = event.data || {};
      
      console.log(`💬 Mensagem do SW v8.0:`, event.data);
      
      switch (type) {
        case 'SW_ACTIVATED':
          console.log('🎉 Service Worker v8.0 ativado com funcionalidades:', data);
          break;
          
        case 'RESUBSCRIBE_NEEDED':
          console.log('🔄 Re-subscription necessária');
          this.handleResubscription();
          break;
          
        case 'NAVIGATE':
          if (data?.url) {
            console.log('🔄 Navegação solicitada pelo SW:', data.url);
          }
          break;
      }
    });
  }

  async handleResubscription() {
    try {
      console.log('🔄 Tentando re-subscription...');
      
      if (this.subscription) {
        await this.subscription.unsubscribe();
      }
      
      await this.subscribe();
      console.log('✅ Re-subscription concluída');
    } catch (error) {
      console.error('❌ Erro na re-subscription:', error);
    }
  }

  async fetchVapidKey() {
    try {
      console.log('🔑 Buscando VAPID key...');
      const response = await apiService.getWebPushVapidKey();
      
      if (!response || !response.vapidKey) {
        throw new Error('VAPID key não retornada pelo backend');
      }
      
      this.vapidPublicKey = response.vapidKey;
      console.log('🔑 VAPID key obtida:', this.vapidPublicKey.substring(0, 20) + '...');
      return this.vapidPublicKey;
    } catch (error) {
      console.error('❌ Erro ao obter VAPID key:', error);
      console.error('Response:', error.response?.data);
      throw error;
    }
  }

  async subscribe(options = {}) {
    if (!this.isSupported) {
      throw new Error('Web Push não é suportado neste navegador');
    }

    try {
      const { storeId, orderId, customerEmail } = options;
      
      console.log('🔐 Verificando permissão...', { storeId, orderId, customerEmail });
      
      let permission = Notification.permission;
      if (permission === 'default') {
        permission = await Notification.requestPermission();
        console.log('🔐 Nova permissão:', permission);
      }
      
      if (permission !== 'granted') {
        throw new Error('Permissão para notificações negada');
      }

      if (!this.registration) {
        console.log('🔄 Registration não encontrado, obtendo...');
        this.registration = await navigator.serviceWorker.ready;
      }
      
      if (!this.registration.active) {
        throw new Error('Service Worker não está ativo. Recarregue a página.');
      }
      
      console.log('📱 Service Worker ativo, verificando subscription...');
      
      let subscription = await this.registration.pushManager.getSubscription();
      
      if (!subscription) {
        console.log('📝 Criando nova subscription...');
        
        if (!this.vapidPublicKey) {
          await this.fetchVapidKey();
        }
        
        try {
          const applicationServerKey = this.urlBase64ToUint8Array(this.vapidPublicKey);
          console.log('🔑 ApplicationServerKey preparada');
          
          subscription = await this.registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: applicationServerKey
          });
          
          console.log('✅ Nova subscription criada:', subscription.endpoint);
        } catch (subError) {
          console.error('❌ Erro ao criar subscription:', subError);
          throw subError;
        }
      } else {
        console.log('♻️ Usando subscription existente');
      }
      
      this.subscription = subscription;
      
      await this.registerSubscription(subscription, { storeId, orderId, customerEmail });
      
      return subscription;
    } catch (error) {
      console.error('❌ Erro ao criar subscription:', error);
      console.error('Stack:', error.stack);
      throw error;
    }
  }

  async registerSubscription(subscription, options = {}) {
    try {
      const { storeId, orderId, customerEmail } = options;
      const deviceInfo = this.getDeviceInfo();
      
      console.log('📡 Registrando subscription no backend com detecção dinâmica...');
      console.log('🎯 Contexto:', { storeId, orderId, customerEmail });
      console.log('Device Info:', deviceInfo);
      
      const response = await apiService.registerWebPushSubscription({
        subscription: subscription.toJSON ? subscription.toJSON() : subscription,
        deviceInfo: {
          ...deviceInfo,
          version: this.version,
          features: {
            dynamicStoreDetection: true,
            autoStoreLink: true,
            orderBasedSubscription: true,
            urlPersonalizada: true,
            actionsInteligentes: true,
            imagensGrandes: true,
            navegacaoOtimizada: true,
            cacheInteligente: true
          }
        },
        storeId,
        orderId,
        customerEmail
      });
      
      console.log('✅ Subscription registrada com detecção dinâmica:', response);
      return response;
    } catch (error) {
      console.error('❌ Erro ao registrar subscription:', error);
      console.error('Response:', error.response?.data);
      throw error;
    }
  }

  async subscribeForOrder(orderId, customerEmail) {
    try {
      console.log('🎯 Registrando subscription para pedido específico:', { orderId, customerEmail });
      
      if (!this.subscription) {
        await this.subscribe({ orderId, customerEmail });
        return;
      }
      
      console.log('📡 Vinculando subscription existente ao pedido...');
      const response = await apiService.registerSubscriptionForOrder(orderId, {
        subscription: this.subscription.toJSON ? this.subscription.toJSON() : this.subscription,
        deviceInfo: this.getDeviceInfo(),
        customerEmail
      });
      
      console.log('✅ Subscription vinculada ao pedido:', response);
      return response;
    } catch (error) {
      console.error('❌ Erro ao registrar subscription para pedido:', error);
      throw error;
    }
  }

  async autoLinkToStore(storeId, orderId = null, customerEmail = null) {
    try {
      console.log('🔗 Auto-vinculando subscription ao store:', { storeId, orderId, customerEmail });
      
      const response = await apiService.autoLinkSubscriptionToStore({
        storeId,
        orderId,
        customerEmail
      });
      
      console.log('✅ Auto-link realizado:', response);
      return response;
    } catch (error) {
      console.error('❌ Erro no auto-link:', error);
      throw error;
    }
  }

  async checkNotificationStatus(orderId) {
    try {
      console.log('📊 Verificando status de notificações para pedido:', orderId);
      
      const response = await apiService.checkNotificationStatus(orderId);
      console.log('📊 Status das notificações:', response);
      
      return response.data || response;
    } catch (error) {
      console.error('❌ Erro ao verificar status de notificações:', error);
      return {
        hasSubscriptions: false,
        isLinkedToStore: false,
        canReceiveNotifications: false,
        error: error.message
      };
    }
  }

  async linkNotificationsForOrder(orderId) {
    try {
      console.log('🔗 Vinculando notificações para pedido:', orderId);
      
      const response = await apiService.linkNotificationsForOrder(orderId);
      console.log('✅ Notificações vinculadas:', response);
      
      return response;
    } catch (error) {
      console.error('❌ Erro ao vincular notificações:', error);
      throw error;
    }
  }

  async sendTestNotification(customUrl = null, options = {}) {
    try {
      console.log('🧪 Preparando teste de notificação...');
      
      const testOptions = {
        title: options.title || '🧪 Teste Web Push v8.0',
        body: options.body || 'Detecção dinâmica de store funcionando perfeitamente!',
        customUrl: customUrl || 'https://projeto-rafael-53f73.web.app/customer/dashboard',
        ...options
      };
      
      console.log('📤 Enviando teste com opções:', testOptions);
      
      const response = await apiService.sendWebPushTestWithCustomUrl(
        testOptions.customUrl,
        testOptions
      );
      
      console.log('🧪 Resposta do teste:', response);
      return response;
    } catch (error) {
      console.error('❌ Erro ao enviar teste:', error);
      console.error('Response:', error.response?.data);
      throw error;
    }
  }

  async unsubscribe() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        console.log('✅ Subscription cancelada');
        this.subscription = null;
      }
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao cancelar subscription:', error);
      throw error;
    }
  }

  async checkSubscription() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      const status = {
        isSubscribed: !!subscription,
        subscription,
        permission: Notification.permission,
        isSupported: this.isSupported,
        hasActiveServiceWorker: !!(registration && registration.active),
        serviceWorkerState: registration?.active?.state,
        serviceWorkerVersion: this.version,
        endpoint: subscription?.endpoint,
        features: {
          dynamicStoreDetection: true,
          autoStoreLink: true,
          orderBasedSubscription: true,
          urlPersonalizada: true,
          actionsInteligentes: true,
          imagensGrandes: true,
          navegacaoOtimizada: true,
          cacheInteligente: true
        }
      };
      
      if (this.debugMode) {
        console.log('📊 Status da subscription:', status);
      }
      
      return status;
    } catch (error) {
      console.error('❌ Erro ao verificar subscription:', error);
      return {
        isSubscribed: false,
        subscription: null,
        permission: 'default',
        isSupported: this.isSupported,
        hasActiveServiceWorker: false,
        error: error.message,
        serviceWorkerVersion: this.version
      };
    }
  }

  async testNotificationByType(type, customUrl = null) {
    try {
      console.log(`🧪 Testando notificação tipo: ${type}`);
      const response = await apiService.testWebPushByType(type, customUrl);
      console.log(`✅ Teste tipo ${type} enviado:`, response);
      return response;
    } catch (error) {
      console.error(`❌ Erro no teste tipo ${type}:`, error);
      throw error;
    }
  }

  async validateCustomUrl(url) {
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    const isValid = urlPattern.test(url);
    
    return {
      valid: isValid,
      suggestion: !isValid ? 'URL deve ser válida (ex: https://exemplo.com)' : null
    };
  }

  async getActionTemplates(type = null) {
    try {
      const response = await apiService.getActionTemplates(type);
      return response;
    } catch (error) {
      console.error('❌ Erro ao obter action templates:', error);
      
      const defaultTemplates = {
        order_status: [
          { action: 'view_order', title: '📦 Ver Pedido', icon: '📦' },
          { action: 'track_order', title: '🚚 Rastrear', icon: '🚚' }
        ],
        chat_message: [
          { action: 'reply_chat', title: '💬 Responder', icon: '💬' },
          { action: 'view_chat', title: '👁️ Ver Chat', icon: '👁️' }
        ],
        custom: [
          { action: 'open_app', title: '📱 Abrir App', icon: '📱' },
          { action: 'view_details', title: '👁️ Ver Detalhes', icon: '👁️' }
        ]
      };
      
      return {
        actions: defaultTemplates[type] || defaultTemplates.custom
      };
    }
  }

  async testDirectFromServiceWorker() {
    try {
      console.log('🧪 Testando notificação diretamente do SW...');
      
      const registration = await navigator.serviceWorker.ready;
      
      return new Promise((resolve, reject) => {
        const messageChannel = new MessageChannel();
        
        messageChannel.port1.onmessage = (event) => {
          if (event.data.success) {
            console.log('✅ Teste direto do SW bem-sucedido');
            resolve(event.data);
          } else {
            console.error('❌ Erro no teste direto:', event.data.error);
            reject(new Error(event.data.error || 'Teste direto falhou'));
          }
        };
        
        registration.active.postMessage({ type: 'TEST_NOTIFICATION' }, [messageChannel.port2]);
        
        setTimeout(() => {
          reject(new Error('Timeout no teste direto'));
        }, 5000);
      });
    } catch (error) {
      console.error('❌ Erro ao testar direto do SW:', error);
      throw error;
    }
  }

  getDeviceInfo() {
    const ua = navigator.userAgent;
    
    const info = {
      platform: 'web',
      browser: this.detectBrowser(ua),
      os: this.detectOS(ua),
      userAgent: ua,
      language: navigator.language,
      screenResolution: `${screen.width}x${screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timestamp: new Date().toISOString(),
      version: this.version
    };
    
    if (this.debugMode) {
      console.log('📱 Device Info:', info);
    }
    
    return info;
  }

  detectBrowser(ua) {
    if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Edg')) return 'Edge';
    if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
    return 'Unknown';
  }

  detectOS(ua) {
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    return 'Unknown';
  }

  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  async checkForUpdates() {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.update();
      console.log('🔄 Verificação de atualização concluída');
    } catch (error) {
      console.error('❌ Erro ao verificar atualizações:', error);
    }
  }

  async cleanup() {
    try {
      await this.unsubscribe();
      
      this.vapidPublicKey = null;
      this.subscription = null;
      this.registration = null;
      
      localStorage.removeItem('webpush_url_history');
      
      console.log('🧹 Limpeza concluída');
    } catch (error) {
      console.error('❌ Erro na limpeza:', error);
    }
  }
}

export default new WebPushService();