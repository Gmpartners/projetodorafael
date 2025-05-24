// src/services/notificationService.js
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '@/lib/firebase';

const VAPID_KEY = import.meta.env.VITE_FCM_VAPID_KEY;

export const notificationService = {
  // Solicitar permissão e obter token
  async requestPermissionAndGetToken() {
    try {
      if (!('Notification' in window)) {
        throw new Error('Este navegador não suporta notificações');
      }

      if (!messaging) {
        throw new Error('Firebase Messaging não está disponível');
      }

      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        throw new Error('Permissão para notificações negada');
      }

      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      
      if (!token) {
        throw new Error('Falha ao gerar token FCM');
      }

      console.log('Token FCM obtido:', token);
      return token;
    } catch (error) {
      console.error('Erro ao obter token FCM:', error);
      throw error;
    }
  },

  // Registrar token (versão offline que salva localmente)
  async registerToken(token) {
    try {
      // Por enquanto, vamos salvar no localStorage até o backend estar pronto
      const tokenData = {
        token,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        registered: true
      };
      
      localStorage.setItem('fcm_token_data', JSON.stringify(tokenData));
      console.log('Token registrado localmente:', tokenData);
      
      // TODO: Quando o backend estiver pronto, fazer a chamada real:
      // await apiService.registerDeviceToken(token);
      
      return { success: true, message: 'Token registrado com sucesso (modo offline)' };
    } catch (error) {
      console.error('Erro ao registrar token:', error);
      throw error;
    }
  },

  // Configurar listener para foreground messages
  setupForegroundListener(callback) {
    if (!messaging) {
      console.warn('Firebase Messaging não disponível');
      return () => {};
    }

    return onMessage(messaging, (payload) => {
      console.log('Notificação recebida em foreground:', payload);
      
      if (callback && typeof callback === 'function') {
        callback(payload);
      }
    });
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

  // Enviar notificação de teste LOCAL (sem backend)
  async sendTestNotification(token) {
    try {
      // Verificar se temos permissão
      if (Notification.permission !== 'granted') {
        throw new Error('Permissão para notificações não concedida');
      }

      // Criar notificação local de teste
      const notification = new Notification('🎉 Teste de Notificação', {
        body: 'Esta é uma notificação de teste do sistema push. Funcionando perfeitamente!',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'test-notification',
        requireInteraction: false,
        data: {
          type: 'test',
          timestamp: new Date().toISOString(),
          token: token.substring(0, 20) + '...' // Mostrar apenas parte do token
        }
      });

      // Fechar a notificação após 5 segundos
      setTimeout(() => {
        notification.close();
      }, 5000);

      // Log para debug
      console.log('Notificação de teste criada:', {
        title: notification.title,
        body: notification.body,
        timestamp: new Date().toISOString()
      });

      return { 
        success: true, 
        message: 'Notificação de teste enviada com sucesso!',
        type: 'local'
      };
    } catch (error) {
      console.error('Erro ao enviar notificação de teste:', error);
      throw error;
    }
  },

  // Obter dados do token salvos localmente
  getStoredTokenData() {
    try {
      const data = localStorage.getItem('fcm_token_data');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Erro ao recuperar dados do token:', error);
      return null;
    }
  },

  // Limpar dados salvos localmente
  clearStoredData() {
    try {
      localStorage.removeItem('fcm_token_data');
      console.log('Dados de notificação limpos');
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
    }
  },

  // Simular envio de notificação com payload customizado
  async simulateNotification(title, body, data = {}) {
    try {
      if (Notification.permission !== 'granted') {
        throw new Error('Permissão para notificações não concedida');
      }

      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `custom-${Date.now()}`,
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

      // Fechar automaticamente após 10 segundos se não interagir
      setTimeout(() => {
        notification.close();
      }, 10000);

      return { 
        success: true, 
        message: 'Notificação simulada enviada!',
        notificationId: notification.tag
      };
    } catch (error) {
      console.error('Erro ao simular notificação:', error);
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
      messaging: !!messaging
    };
  }
};