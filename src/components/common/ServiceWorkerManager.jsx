import React, { useEffect, useState } from 'react';
import { cleanupOldServiceWorkers, registerServiceWorker } from '@/services/swRegistration';

// Componente para gerenciar Service Worker v7.0 globalmente
const ServiceWorkerManager = () => {
  const [swStatus, setSwStatus] = useState({
    registered: false,
    active: false,
    version: null
  });

  useEffect(() => {
    initializeServiceWorker();
  }, []);

  const initializeServiceWorker = async () => {
    try {
      console.log('🚀 Inicializando Service Worker v7.0...');
      
      // Limpeza e registro
      await cleanupOldServiceWorkers();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const registration = await registerServiceWorker();
      
      setSwStatus({
        registered: true,
        active: !!(registration && registration.active),
        version: 'v7.0.0-web-push-complete'
      });

      // Salvar no localStorage para debug
      localStorage.setItem('sw_v7_registered', 'true');
      localStorage.setItem('sw_v7_registration_time', new Date().toISOString());
      
      console.log('✅ Service Worker v7.0 inicializado com sucesso');
      
    } catch (error) {
      console.error('❌ Erro ao inicializar Service Worker v7.0:', error);
      setSwStatus({
        registered: false,
        active: false,
        error: error.message
      });
    }
  };

  // Componente invisível - apenas gerencia o SW
  return null;
};

export default ServiceWorkerManager;