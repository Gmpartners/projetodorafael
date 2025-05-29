// src/hooks/useNotifications.js
import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '@/services/notificationService';
import { checkServiceWorkerStatus } from '@/services/swRegistration';

export const useNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState('default');
  const [fcmToken, setFcmToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [swStatus, setSwStatus] = useState({
    supported: false,
    registered: false,
    active: false
  });

  // Verificar status inicial
  useEffect(() => {
    const checkInitialStatus = async () => {
      try {
        // Verificar suporte a notificações
        const supported = notificationService.isSupported();
        setIsSupported(supported);

        // Verificar permissão atual
        const currentPermission = notificationService.getPermissionStatus();
        setPermission(currentPermission);

        // Verificar status do service worker
        const swStatusResult = await checkServiceWorkerStatus();
        setSwStatus(swStatusResult);

        // Verificar se já temos token armazenado
        const storedTokenData = notificationService.getStoredTokenData();
        if (storedTokenData?.token) {
          setFcmToken(storedTokenData.token);
        }

        console.log('📊 Status inicial das notificações:', {
          supported,
          permission: currentPermission,
          swStatus: swStatusResult,
          hasToken: !!storedTokenData?.token
        });

      } catch (error) {
        console.error('❌ Erro ao verificar status inicial:', error);
      }
    };

    checkInitialStatus();
  }, []);

  // Função para solicitar permissão e configurar notificações
  const requestPermission = useCallback(async () => {
    setLoading(true);
    try {
      console.log('🔔 Solicitando permissão para notificações...');
      
      const token = await notificationService.requestPermissionAndGetToken();
      
      setFcmToken(token);
      setPermission('granted');
      
      console.log('✅ Notificações configuradas com sucesso');
      return { success: true, token };
      
    } catch (error) {
      console.error('❌ Erro ao configurar notificações:', error);
      setPermission('denied');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Função para enviar notificação de teste
  const sendTestNotification = useCallback(async () => {
    try {
      if (!fcmToken) {
        throw new Error('Token FCM não disponível');
      }

      const result = await notificationService.sendTestNotification(fcmToken);
      console.log('🧪 Notificação de teste enviada:', result);
      return { success: true, result };
      
    } catch (error) {
      console.error('❌ Erro ao enviar teste:', error);
      return { success: false, error: error.message };
    }
  }, [fcmToken]);

  // Função para configurar listener de mensagens
  const setupMessageListener = useCallback((callback) => {
    if (!isSupported) {
      console.warn('⚠️ Notificações não suportadas');
      return () => {};
    }

    console.log('👂 Configurando listener de mensagens...');
    return notificationService.setupForegroundListener(callback);
  }, [isSupported]);

  // Função para obter estatísticas detalhadas
  const getDetailedStats = useCallback(() => {
    return notificationService.getDetailedStats();
  }, []);

  // Status consolidado
  const status = {
    isSupported,
    permission,
    hasToken: !!fcmToken,
    isReady: isSupported && permission === 'granted' && !!fcmToken && swStatus.active,
    swStatus,
    loading
  };

  return {
    // Status
    ...status,
    
    // Dados
    fcmToken,
    
    // Funções
    requestPermission,
    sendTestNotification,
    setupMessageListener,
    getDetailedStats,
    
    // Utilitários
    clearStoredData: notificationService.clearStoredData,
    getStoredTokenData: notificationService.getStoredTokenData
  };
};