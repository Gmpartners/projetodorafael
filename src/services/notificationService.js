// src/services/notificationService.js
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '@/lib/firebase';

const VAPID_KEY = import.meta.env.VITE_FCM_VAPID_KEY;

export const notificationService = {
  // Solicitar permissão e obter token
  async requestPermissionAndGetToken() {
    try {
      console.log('🔔 Solicitando permissão para notificações...');
      
      if (!('Notification' in window)) {
        throw new Error('Este navegador não suporta notificações');
      }

      if (!messaging) {
        throw new Error('Firebase Messaging não está disponível');
      }

      const permission = await Notification.requestPermission();
      console.log('🔐 Permissão obtida:', permission);
      
      if (permission !== 'granted') {
        throw new Error('Permissão para notificações negada pelo usuário');
      }

      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      
      if (!token) {
        throw new Error('Falha ao gerar token FCM - verifique a configuração do VAPID key');
      }

      console.log('✅ Token FCM obtido com sucesso:', token.substring(0, 40) + '...');
      
      // Salvar token localmente como backup
      const tokenData = {
        token,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        registered: true,
        source: 'requestPermissionAndGetToken'
      };
      
      localStorage.setItem('fcm_token_data', JSON.stringify(tokenData));
      
      return token;
    } catch (error) {
      console.error('❌ Erro ao obter token FCM:', error);
      throw error;
    }
  },

  // Registrar token (versão offline que salva localmente) - MANTIDO PARA COMPATIBILIDADE
  async registerToken(token) {
    try {
      console.log('💾 Salvando token localmente como backup...');
      
      const tokenData = {
        token,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        registered: true,
        source: 'registerToken_offline'
      };
      
      localStorage.setItem('fcm_token_data', JSON.stringify(tokenData));
      console.log('✅ Token salvo localmente:', tokenData);
      
      return { success: true, message: 'Token registrado localmente como backup' };
    } catch (error) {
      console.error('❌ Erro ao registrar token localmente:', error);
      throw error;
    }
  },

  // Configurar listener para foreground messages
  setupForegroundListener(callback) {
    if (!messaging) {
      console.warn('⚠️ Firebase Messaging não disponível para listener');
      return () => {};
    }

    console.log('👂 Configurando listener para mensagens em foreground...');

    return onMessage(messaging, (payload) => {
      console.log('📨 Notificação recebida em foreground:', payload);
      
      // Mostrar notificação local se estiver em foreground
      this.showLocalNotification(payload);
      
      if (callback && typeof callback === 'function') {
        callback(payload);
      }
    });
  },

  // Mostrar notificação local
  showLocalNotification(payload) {
    if (Notification.permission !== 'granted') {
      console.log('⚠️ Permissão não concedida para mostrar notificação local');
      return;
    }

    try {
      const title = payload.notification?.title || payload.data?.title || 'Projeto Rafael';
      const options = {
        body: payload.notification?.body || payload.data?.body || 'Nova notificação',
        icon: payload.notification?.icon || '/favicon.ico',
        badge: '/favicon.ico',
        tag: payload.data?.type || 'default',
        data: payload.data || {},
        requireInteraction: true,
        actions: [
          { action: 'view', title: 'Ver detalhes' },
          { action: 'dismiss', title: 'Dispensar' }
        ]
      };

      const notification = new Notification(title, options);

      // Auto-close após 10 segundos
      setTimeout(() => {
        notification.close();
      }, 10000);

      // Click handler
      notification.onclick = () => {
        console.log('🖱️ Notificação clicada');
        window.focus();
        
        // Determinar URL baseado no tipo
        if (payload.data?.link) {
          window.location.href = payload.data.link;
        } else if (payload.data?.orderId) {
          window.location.href = `/customer/orders/${payload.data.orderId}`;
        } else if (payload.data?.chatId) {
          window.location.href = `/customer/chat/${payload.data.chatId}`;
        }
        
        notification.close();
      };

      console.log('🔔 Notificação local mostrada:', title);
    } catch (error) {
      console.error('❌ Erro ao mostrar notificação local:', error);
    }
  },

  // Obter status de permissão
  getPermissionStatus() {
    if (!('Notification' in window)) {
      return 'not-supported';
    }
    return Notification.permission;
  },

  // Verificar se notificações são suportadas
  isSupported() {
    return 'Notification' in window && !!messaging;
  },

  // Enviar notificação de teste LOCAL (sem backend) - MANTIDO PARA FALLBACK
  async sendTestNotification(token) {
    try {
      console.log('🧪 Enviando notificação de teste local...');
      
      // Verificar se temos permissão
      if (Notification.permission !== 'granted') {
        throw new Error('Permissão para notificações não concedida');
      }

      // Criar notificação local de teste
      const notification = new Notification('🧪 Teste de Notificação Local', {
        body: 'Esta é uma notificação de teste local. O sistema está configurado corretamente!',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'test-notification-local',
        requireInteraction: false,
        data: {
          type: 'test',
          timestamp: new Date().toISOString(),
          token: token ? token.substring(0, 20) + '...' : 'No token',
          source: 'local_test'
        }
      });

      // Fechar a notificação após 8 segundos
      setTimeout(() => {
        notification.close();
      }, 8000);

      // Log para debug
      console.log('✅ Notificação de teste local criada:', {
        title: notification.title,
        timestamp: new Date().toISOString()
      });

      return { 
        success: true, 
        message: 'Notificação de teste local enviada com sucesso!',
        type: 'local'
      };
    } catch (error) {
      console.error('❌ Erro ao enviar notificação de teste local:', error);
      throw error;
    }
  },

  // Obter dados do token salvos localmente
  getStoredTokenData() {
    try {
      const data = localStorage.getItem('fcm_token_data');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('❌ Erro ao recuperar dados do token:', error);
      return null;
    }
  },

  // Limpar dados salvos localmente
  clearStoredData() {
    try {
      localStorage.removeItem('fcm_token_data');
      console.log('🧹 Dados de notificação limpos do localStorage');
    } catch (error) {
      console.error('❌ Erro ao limpar dados:', error);
    }
  },

  // Simular envio de notificação com payload customizado
  async simulateNotification(title, body, data = {}) {
    try {
      console.log('🎭 Simulando notificação:', { title, body, data });
      
      if (Notification.permission !== 'granted') {
        throw new Error('Permissão para notificações não concedida');
      }

      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `simulation-${Date.now()}`,
        requireInteraction: true,
        data: {
          ...data,
          timestamp: new Date().toISOString(),
          source: 'frontend-simulation'
        },
        actions: [
          { action: 'view', title: 'Ver Detalhes' },
          { action: 'dismiss', title: 'Dispensar' }
        ]
      });

      // Click handler
      notification.onclick = () => {
        console.log('🖱️ Notificação simulada clicada');
        window.focus();
        notification.close();
      };

      // Fechar automaticamente após 12 segundos se não interagir
      setTimeout(() => {
        notification.close();
      }, 12000);

      return { 
        success: true, 
        message: 'Notificação simulada enviada!',
        notificationId: notification.tag
      };
    } catch (error) {
      console.error('❌ Erro ao simular notificação:', error);
      throw error;
    }
  },

  // Verificar status do sistema de notificações
  getSystemStatus() {
    const isSupported = this.isSupported();
    const permission = this.getPermissionStatus();
    const hasStoredToken = !!this.getStoredTokenData();
    
    return {
      supported: isSupported,
      permission,
      hasToken: hasStoredToken,
      ready: isSupported && permission === 'granted' && hasStoredToken,
      messaging: !!messaging,
      vapidKey: !!VAPID_KEY,
      domain: window.location.hostname
    };
  },

  // ✅ NOVA FUNÇÃO: Inicializar sistema completo
  async initializeNotificationSystem(userRole = 'customer') {
    try {
      console.log('🚀 Inicializando sistema de notificações...');
      
      const status = this.getSystemStatus();
      
      if (!status.supported) {
        throw new Error('Navegador não suporta notificações push');
      }
      
      if (!status.vapidKey) {
        throw new Error('VAPID key não configurada');
      }
      
      console.log('📋 Status do sistema:', status);
      
      // Configurar listener para mensagens em foreground
      const unsubscribe = this.setupForegroundListener((payload) => {
        console.log('📨 Nova notificação recebida:', payload);
      });
      
      return {
        status,
        unsubscribe,
        initialized: true
      };
      
    } catch (error) {
      console.error('❌ Erro ao inicializar sistema de notificações:', error);
      throw error;
    }
  },

  // ✅ NOVA FUNÇÃO: Obter informações do dispositivo
  getDeviceInfo() {
    return {
      platform: 'web',
      browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : 
               navigator.userAgent.includes('Firefox') ? 'Firefox' : 
               navigator.userAgent.includes('Safari') ? 'Safari' : 
               navigator.userAgent.includes('Edge') ? 'Edge' : 'Unknown',
      os: navigator.platform,
      userAgent: navigator.userAgent,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      timestamp: new Date().toISOString()
    };
  },

  // ✅ NOVA FUNÇÃO: Testar conectividade
  async testConnectivity() {
    try {
      const response = await fetch('https://www.google.com/favicon.ico', { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      return response.ok;
    } catch (error) {
      console.log('⚠️ Teste de conectividade falhou:', error.message);
      return false;
    }
  },

  // ✅ NOVA FUNÇÃO: Obter estatísticas detalhadas
  getDetailedStats() {
    const storedData = this.getStoredTokenData();
    const systemStatus = this.getSystemStatus();
    const deviceInfo = this.getDeviceInfo();
    
    return {
      system: systemStatus,
      device: deviceInfo,
      token: storedData ? {
        hasToken: true,
        created: storedData.timestamp,
        source: storedData.source || 'unknown'
      } : {
        hasToken: false
      },
      browser: {
        name: deviceInfo.browser,
        platform: deviceInfo.platform,
        online: deviceInfo.onLine,
        language: deviceInfo.language
      },
      permissions: {
        notification: systemStatus.permission,
        supported: systemStatus.supported
      }
    };
  }
};