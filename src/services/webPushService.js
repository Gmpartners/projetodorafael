// src/services/webPushService.js
import apiService from './apiService';

class WebPushService {
  constructor() {
    this.vapidPublicKey = null;
    this.subscription = null;
    this.isSupported = 'PushManager' in window && 'serviceWorker' in navigator;
    this.registration = null;
  }

  /**
   * Inicializar o serviço Web Push
   */
  async initialize() {
    if (!this.isSupported) {
      console.warn('⚠️ Web Push não é suportado neste navegador');
      return false;
    }

    try {
      // Registrar Service Worker
      this.registration = await this.registerServiceWorker();
      
      // Obter VAPID key do backend
      await this.fetchVapidKey();
      
      // Verificar subscription existente
      const existingSubscription = await this.registration.pushManager.getSubscription();
      if (existingSubscription) {
        this.subscription = existingSubscription;
        console.log('✅ Subscription existente encontrada');
      }
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao inicializar Web Push:', error);
      return false;
    }
  }

  /**
   * Registrar Service Worker
   */
  async registerServiceWorker() {
    try {
      console.log('📦 Registrando Service Worker...');
      
      // Verificar se já existe um registration
      let registration = await navigator.serviceWorker.getRegistration('/');
      
      if (!registration) {
        registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
        console.log('✅ Novo Service Worker registrado:', registration.scope);
      } else {
        console.log('♻️ Service Worker já registrado:', registration.scope);
      }
      
      // Aguardar até o SW estar pronto
      console.log('⏳ Aguardando Service Worker ficar pronto...');
      
      // Se está instalando, aguardar
      if (registration.installing) {
        await new Promise((resolve) => {
          registration.installing.addEventListener('statechange', function(e) {
            if (e.target.state === 'activated') {
              console.log('✅ Service Worker ativado');
              resolve();
            }
          });
        });
      }
      
      // Aguardar o SW estar realmente pronto
      await navigator.serviceWorker.ready;
      console.log('🟢 Service Worker está pronto!');
      
      // Verificar se tem um SW ativo
      if (!registration.active) {
        console.warn('⚠️ Nenhum Service Worker ativo, aguardando...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Tentar atualizar
        await registration.update();
        
        // Aguardar novamente
        await navigator.serviceWorker.ready;
      }
      
      if (registration.active) {
        console.log('✅ Service Worker ativo:', registration.active.state);
      }
      
      return registration;
    } catch (error) {
      console.error('❌ Erro ao registrar Service Worker:', error);
      throw error;
    }
  }

  /**
   * Obter VAPID public key do backend
   */
  async fetchVapidKey() {
    try {
      const response = await apiService.getWebPushVapidKey();
      this.vapidPublicKey = response.vapidKey;
      console.log('🔑 VAPID key obtida com sucesso');
      return this.vapidPublicKey;
    } catch (error) {
      console.error('❌ Erro ao obter VAPID key:', error);
      throw error;
    }
  }

  /**
   * Solicitar permissão e criar subscription
   */
  async subscribe() {
    if (!this.isSupported) {
      throw new Error('Web Push não é suportado neste navegador');
    }

    try {
      // Solicitar permissão
      const permission = await Notification.requestPermission();
      console.log('🔐 Permissão:', permission);
      
      if (permission !== 'granted') {
        throw new Error('Permissão para notificações negada');
      }

      // Garantir que temos um registration
      if (!this.registration) {
        console.log('🔄 Registration não encontrado, inicializando...');
        await this.initialize();
      }
      
      // Usar o registration salvo ou obter o atual
      const registration = this.registration || await navigator.serviceWorker.ready;
      
      // Verificar se o SW está ativo
      if (!registration.active) {
        console.error('❌ Service Worker não está ativo');
        throw new Error('Service Worker não está ativo. Recarregue a página.');
      }
      
      console.log('📱 Service Worker ativo, estado:', registration.active.state);
      
      // Verificar se já existe subscription
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        // Criar nova subscription
        console.log('📝 Criando nova subscription...');
        
        if (!this.vapidPublicKey) {
          await this.fetchVapidKey();
        }
        
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
        });
        
        console.log('✅ Nova subscription criada');
      } else {
        console.log('♻️ Usando subscription existente');
      }
      
      this.subscription = subscription;
      
      // Registrar no backend
      await this.registerSubscription(subscription);
      
      return subscription;
    } catch (error) {
      console.error('❌ Erro ao criar subscription:', error);
      throw error;
    }
  }

  /**
   * Registrar subscription no backend
   */
  async registerSubscription(subscription) {
    try {
      const deviceInfo = this.getDeviceInfo();
      
      const response = await apiService.registerWebPushSubscription({
        subscription,
        deviceInfo
      });
      
      console.log('✅ Subscription registrada no backend:', response);
      return response;
    } catch (error) {
      console.error('❌ Erro ao registrar subscription:', error);
      throw error;
    }
  }

  /**
   * Cancelar subscription
   */
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

  /**
   * Verificar status da subscription
   */
  async checkSubscription() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      return {
        isSubscribed: !!subscription,
        subscription,
        permission: Notification.permission,
        isSupported: this.isSupported,
        hasActiveServiceWorker: !!(registration && registration.active),
        serviceWorkerState: registration?.active?.state
      };
    } catch (error) {
      console.error('❌ Erro ao verificar subscription:', error);
      return {
        isSubscribed: false,
        subscription: null,
        permission: 'default',
        isSupported: this.isSupported,
        hasActiveServiceWorker: false,
        error: error.message
      };
    }
  }

  /**
   * Enviar notificação de teste
   */
  async sendTestNotification() {
    try {
      const response = await apiService.sendWebPushTestNotification();
      console.log('🧪 Notificação de teste enviada:', response);
      return response;
    } catch (error) {
      console.error('❌ Erro ao enviar notificação de teste:', error);
      throw error;
    }
  }

  /**
   * Obter informações do dispositivo
   */
  getDeviceInfo() {
    const ua = navigator.userAgent;
    
    return {
      platform: 'web',
      browser: this.detectBrowser(ua),
      os: this.detectOS(ua),
      userAgent: ua,
      language: navigator.language,
      screenResolution: `${screen.width}x${screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Detectar navegador
   */
  detectBrowser(ua) {
    if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Edg')) return 'Edge';
    if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
    return 'Unknown';
  }

  /**
   * Detectar sistema operacional
   */
  detectOS(ua) {
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    return 'Unknown';
  }

  /**
   * Converter VAPID key para Uint8Array
   */
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

  /**
   * Verificar se o Service Worker precisa de atualização
   */
  async checkForUpdates() {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.update();
      console.log('🔄 Verificação de atualização do SW concluída');
    } catch (error) {
      console.error('❌ Erro ao verificar atualizações:', error);
    }
  }

  /**
   * Limpar dados e fazer logout
   */
  async cleanup() {
    try {
      // Cancelar subscription
      await this.unsubscribe();
      
      // Limpar dados locais
      this.vapidPublicKey = null;
      this.subscription = null;
      this.registration = null;
      
      console.log('🧹 Limpeza concluída');
    } catch (error) {
      console.error('❌ Erro na limpeza:', error);
    }
  }
}

// Exportar instância única
export default new WebPushService();