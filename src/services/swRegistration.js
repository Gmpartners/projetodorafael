// src/services/swRegistration.js
export const registerServiceWorker = async () => {
  try {
    console.log('🔧 Iniciando registro do Service Worker...');
    
    // Verificar se service workers são suportados
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Workers não são suportados neste navegador');
    }

    // Verificar se notificações são suportadas
    if (!('Notification' in window)) {
      throw new Error('Notificações não são suportadas neste navegador');
    }

    // Registrar o service worker
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/'
    });

    console.log('✅ Service Worker registrado com sucesso:', registration);

    // Aguardar ativação
    await navigator.serviceWorker.ready;
    console.log('🟢 Service Worker está pronto');

    // Verificar se já existe uma instância ativa
    if (registration.active) {
      console.log('🔄 Service Worker já ativo');
    } else {
      console.log('⏳ Aguardando ativação do Service Worker...');
      
      // Aguardar ativação
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated') {
              console.log('🎉 Novo Service Worker ativado!');
            }
          });
        }
      });
    }

    // Configurar listener para updates
    registration.addEventListener('updatefound', () => {
      console.log('🆕 Nova versão do Service Worker encontrada');
    });

    return registration;

  } catch (error) {
    console.error('❌ Erro ao registrar Service Worker:', error);
    throw error;
  }
};

// Função para verificar status do service worker
export const checkServiceWorkerStatus = async () => {
  try {
    if (!('serviceWorker' in navigator)) {
      return { supported: false, registered: false, active: false };
    }

    const registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
    
    return {
      supported: true,
      registered: !!registration,
      active: !!(registration && registration.active),
      scope: registration?.scope,
      updateViaCache: registration?.updateViaCache
    };
  } catch (error) {
    console.error('❌ Erro ao verificar status do SW:', error);
    return { supported: true, registered: false, active: false, error: error.message };
  }
};

// Função para forçar atualização do service worker
export const updateServiceWorker = async () => {
  try {
    const registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
    
    if (registration) {
      await registration.update();
      console.log('🔄 Service Worker atualizado com sucesso');
      return true;
    } else {
      console.log('⚠️ Nenhum Service Worker registrado para atualizar');
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao atualizar Service Worker:', error);
    throw error;
  }
};

// Função para desregistrar service worker (útil para debugging)
export const unregisterServiceWorker = async () => {
  try {
    const registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
    
    if (registration) {
      const result = await registration.unregister();
      console.log('🗑️ Service Worker desregistrado:', result);
      return result;
    } else {
      console.log('⚠️ Nenhum Service Worker registrado para desregistrar');
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao desregistrar Service Worker:', error);
    throw error;
  }
};