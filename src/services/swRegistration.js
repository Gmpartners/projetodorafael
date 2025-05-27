// src/services/swRegistration.js - v7.0 Sistema Completo
export const registerServiceWorker = async () => {
  try {
    console.log('🔧 Iniciando registro do Service Worker v7.0...');
    
    // Verificar se service workers são suportados
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Workers não são suportados neste navegador');
    }

    // Verificar se notificações são suportadas
    if (!('Notification' in window)) {
      throw new Error('Notificações não são suportadas neste navegador');
    }

    // Limpar service workers antigos primeiro
    await cleanupOldServiceWorkers();

    // Registrar o novo service worker v7.0
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none' // Sempre buscar atualizações
    });

    console.log('✅ Service Worker v7.0 registrado com sucesso:', registration);

    // Aguardar ativação
    await navigator.serviceWorker.ready;
    console.log('🟢 Service Worker v7.0 está pronto');

    // Verificar versão do service worker
    await checkServiceWorkerVersion(registration);

    // Configurar listeners para atualizações
    setupUpdateListeners(registration);

    return registration;

  } catch (error) {
    console.error('❌ Erro ao registrar Service Worker v7.0:', error);
    throw error;
  }
};

// 🆕 v7.0: Verificar versão do service worker
const checkServiceWorkerVersion = async (registration) => {
  try {
    if (registration.active) {
      // Criar canal de comunicação
      const messageChannel = new MessageChannel();
      
      const versionPromise = new Promise((resolve) => {
        messageChannel.port1.onmessage = (event) => {
          resolve(event.data);
        };
        
        // Timeout de 3 segundos
        setTimeout(() => resolve(null), 3000);
      });
      
      // Solicitar informações do SW
      registration.active.postMessage({ type: 'DEBUG_SW' }, [messageChannel.port2]);
      
      const swInfo = await versionPromise;
      
      if (swInfo) {
        console.log('🔍 Service Worker v7.0 Info:', swInfo);
        
        if (swInfo.features) {
          console.log('✨ Funcionalidades v7.0 disponíveis:', swInfo.features);
        }
        
        // Salvar informações no localStorage para debug
        localStorage.setItem('sw_v7_info', JSON.stringify({
          ...swInfo,
          lastCheck: new Date().toISOString()
        }));
        
      } else {
        console.log('⚠️ Não foi possível verificar versão do Service Worker');
      }
    }
  } catch (error) {
    console.warn('⚠️ Erro ao verificar versão do SW:', error);
  }
};

// 🆕 v7.0: Configurar listeners para atualizações
const setupUpdateListeners = (registration) => {
  // Listener para novas versões
  registration.addEventListener('updatefound', () => {
    console.log('🆕 Nova versão do Service Worker v7.0 encontrada');
    
    const newWorker = registration.installing;
    if (newWorker) {
      newWorker.addEventListener('statechange', () => {
        switch (newWorker.state) {
          case 'installed':
            if (navigator.serviceWorker.controller) {
              console.log('🔄 Nova versão v7.0 instalada, aguardando ativação');
              
              // Notificar sobre atualização disponível
              if (window.confirm('Nova versão do Web Push v7.0 disponível! Recarregar agora?')) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
              }
            } else {
              console.log('🎉 Service Worker v7.0 instalado pela primeira vez');
            }
            break;
            
          case 'activated':
            console.log('✅ Nova versão do Service Worker v7.0 ativada!');
            break;
            
          default:
            console.log(`🔄 Service Worker v7.0 state: ${newWorker.state}`);
        }
      });
    }
  });

  // Listener para mudanças no controller
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('🔄 Service Worker controller mudou para v7.0');
    window.location.reload();
  });

  // Listener para mensagens do SW
  navigator.serviceWorker.addEventListener('message', (event) => {
    const { type, data } = event.data || {};
    
    console.log('💬 Mensagem do Service Worker v7.0:', event.data);
    
    switch (type) {
      case 'SW_ACTIVATED':
        console.log('🎉 Service Worker v7.0 ativado com funcionalidades:', data);
        
        // Mostrar notificação sobre ativação
        if (Notification.permission === 'granted') {
          new Notification('Web Push v7.0 Ativo!', {
            body: 'Sistema completo: URL personalizada + Actions inteligentes',
            icon: '/vite.svg'
          });
        }
        break;
        
      case 'RESUBSCRIBE_NEEDED':
        console.log('🔄 Re-subscription necessária pelo SW v7.0');
        // Será tratado pelo webPushService
        break;
        
      case 'NAVIGATE':
        if (data?.url) {
          console.log('🔄 Navegação solicitada pelo SW v7.0:', data.url);
        }
        break;
        
      default:
        console.log('❓ Mensagem desconhecida do SW v7.0:', type);
    }
  });
};

// Função para verificar status do service worker v7.0
export const checkServiceWorkerStatus = async () => {
  try {
    if (!('serviceWorker' in navigator)) {
      return { 
        supported: false, 
        registered: false, 
        active: false,
        version: null
      };
    }

    const registration = await navigator.serviceWorker.getRegistration('/');
    
    const status = {
      supported: true,
      registered: !!registration,
      active: !!(registration && registration.active),
      waiting: !!(registration && registration.waiting),
      installing: !!(registration && registration.installing),
      scope: registration?.scope,
      scriptURL: registration?.active?.scriptURL,
      state: registration?.active?.state,
      updateViaCache: registration?.updateViaCache,
      version: 'v7.0.0-web-push-complete'
    };

    // Tentar obter informações adicionais do SW
    if (registration?.active) {
      try {
        const swInfo = JSON.parse(localStorage.getItem('sw_v7_info') || '{}');
        if (swInfo.version) {
          status.detailedVersion = swInfo.version;
          status.features = swInfo.features;
          status.lastCheck = swInfo.lastCheck;
        }
      } catch (e) {
        // Ignorar erro de parsing
      }
    }
    
    return status;
  } catch (error) {
    console.error('❌ Erro ao verificar status do SW v7.0:', error);
    return { 
      supported: true, 
      registered: false, 
      active: false, 
      error: error.message,
      version: 'v7.0.0-web-push-complete'
    };
  }
};

// Função para forçar atualização do service worker v7.0
export const updateServiceWorker = async () => {
  try {
    const registration = await navigator.serviceWorker.getRegistration('/');
    
    if (registration) {
      console.log('🔄 Forçando atualização do Service Worker v7.0...');
      await registration.update();
      console.log('✅ Service Worker v7.0 atualizado com sucesso');
      return true;
    } else {
      console.log('⚠️ Nenhum Service Worker v7.0 registrado para atualizar');
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao atualizar Service Worker v7.0:', error);
    throw error;
  }
};

// Função para desregistrar service worker (útil para debugging)
export const unregisterServiceWorker = async () => {
  try {
    const registration = await navigator.serviceWorker.getRegistration('/');
    
    if (registration) {
      const result = await registration.unregister();
      console.log('🗑️ Service Worker v7.0 desregistrado:', result);
      
      // Limpar dados relacionados
      localStorage.removeItem('sw_v7_info');
      localStorage.removeItem('sw_registered');
      localStorage.removeItem('sw_registration_time');
      localStorage.removeItem('sw_type');
      
      return result;
    } else {
      console.log('⚠️ Nenhum Service Worker v7.0 registrado para desregistrar');
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao desregistrar Service Worker v7.0:', error);
    throw error;
  }
};

// 🆕 v7.0: Função para limpar service workers antigos
export const cleanupOldServiceWorkers = async () => {
  try {
    console.log('🧹 Limpando Service Workers antigos...');
    
    const registrations = await navigator.serviceWorker.getRegistrations();
    
    for (const registration of registrations) {
      // Manter apenas o SW atual (/sw.js)
      if (registration.scope && !registration.scope.endsWith('/')) {
        continue; // Pular se não for o scope raiz
      }
      
      // Se o scriptURL não for /sw.js, desregistrar
      if (registration.active?.scriptURL && !registration.active.scriptURL.endsWith('/sw.js')) {
        await registration.unregister();
        console.log('🗑️ Service Worker antigo removido:', registration.active.scriptURL);
      }
    }
    
    console.log('✅ Limpeza de Service Workers concluída');
    return true;
  } catch (error) {
    console.error('❌ Erro ao limpar SWs antigos:', error);
    return false;
  }
};

// 🆕 v7.0: Função para debug completo do SW
export const debugServiceWorker = async () => {
  try {
    const status = await checkServiceWorkerStatus();
    
    console.group('🐛 Debug Service Worker v7.0');
    console.log('Status:', status);
    
    if (status.registered && status.active) {
      // Tentar comunicação com o SW
      const registration = await navigator.serviceWorker.getRegistration('/');
      
      if (registration?.active) {
        const messageChannel = new MessageChannel();
        
        const debugPromise = new Promise((resolve) => {
          messageChannel.port1.onmessage = (event) => {
            console.log('Resposta do SW:', event.data);
            resolve(event.data);
          };
          
          setTimeout(() => resolve(null), 5000);
        });
        
        registration.active.postMessage({ type: 'DEBUG_SW' }, [messageChannel.port2]);
        
        await debugPromise;
      }
    }
    
    console.groupEnd();
    
    return status;
  } catch (error) {
    console.error('❌ Erro no debug do SW v7.0:', error);
    return null;
  }
};

// 🆕 v7.0: Função para resetar completamente o SW
export const resetServiceWorker = async () => {
  try {
    console.log('🔄 Resetando Service Worker v7.0 completamente...');
    
    // 1. Desregistrar SW atual
    await unregisterServiceWorker();
    
    // 2. Limpar todos os caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('🗑️ Todos os caches limpos');
    }
    
    // 3. Aguardar um pouco
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 4. Registrar novamente
    const registration = await registerServiceWorker();
    
    console.log('✅ Service Worker v7.0 resetado com sucesso');
    return registration;
    
  } catch (error) {
    console.error('❌ Erro ao resetar Service Worker v7.0:', error);
    throw error;
  }
};