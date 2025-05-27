// 🚀 Web Push Service Worker - Sistema Nativo Puro
// Versão 1.0.0 - Sem dependências do Firebase/FCM

const SW_VERSION = 'v1.0.0-web-push';
const CACHE_NAME = `projeto-rafael-${SW_VERSION}`;

// Assets para cache offline
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/vite.svg'
];

// 📨 PUSH EVENT - Receber notificações Web Push
self.addEventListener('push', event => {
  console.log(`[SW ${SW_VERSION}] 📨 Web Push recebido`);
  
  if (!event.data) {
    console.warn(`[SW ${SW_VERSION}] ⚠️ Push sem dados`);
    return;
  }

  const handlePush = async () => {
    try {
      const payload = event.data.json();
      console.log(`[SW ${SW_VERSION}] 📋 Payload:`, payload);
      
      // Extrair dados da notificação
      const { title, body, icon, badge, image, data, actions, ...options } = payload;
      
      // Configurar opções da notificação
      const notificationOptions = {
        body: body || 'Nova notificação',
        icon: icon || '/vite.svg',
        badge: badge || '/vite.svg',
        data: {
          ...data,
          timestamp: Date.now(),
          version: SW_VERSION
        },
        requireInteraction: options.requireInteraction !== false,
        silent: options.silent || false,
        vibrate: options.vibrate || [200, 100, 200],
        renotify: options.renotify !== false,
        tag: options.tag || `notification-${Date.now()}`,
        actions: actions || []
      };
      
      // Adicionar imagem se fornecida
      if (image) {
        notificationOptions.image = image;
      }
      
      // Personalização adicional
      if (data?.primaryColor && 'actions' in Notification.prototype) {
        notificationOptions.actions = notificationOptions.actions.map(action => ({
          ...action,
          icon: action.icon || '/vite.svg'
        }));
      }
      
      console.log(`[SW ${SW_VERSION}] 🚀 Exibindo notificação:`, {
        title,
        hasImage: !!image,
        actionsCount: notificationOptions.actions.length
      });
      
      await self.registration.showNotification(
        title || 'Nova Notificação',
        notificationOptions
      );
      
    } catch (error) {
      console.error(`[SW ${SW_VERSION}] ❌ Erro ao processar push:`, error);
      
      // Fallback notification
      await self.registration.showNotification('Nova Notificação', {
        body: 'Você recebeu uma nova atualização',
        icon: '/vite.svg',
        badge: '/vite.svg'
      });
    }
  };
  
  event.waitUntil(handlePush());
});

// 👆 NOTIFICATION CLICK - Lidar com cliques
self.addEventListener('notificationclick', event => {
  console.log(`[SW ${SW_VERSION}] 👆 Clique na notificação`);
  
  event.notification.close();
  
  const handleClick = async () => {
    const data = event.notification.data || {};
    const action = event.action;
    
    console.log(`[SW ${SW_VERSION}] 🎯 Action:`, action, 'Data:', data);
    
    let targetUrl = data.url || '/';
    
    // Roteamento baseado na action
    if (action) {
      switch (action) {
        case 'view_order':
          targetUrl = data.orderId ? `/customer/order/${data.orderId}` : '/customer/orders';
          break;
          
        case 'track_order':
          targetUrl = data.orderId ? `/customer/track/${data.orderId}` : '/customer/orders';
          break;
          
        case 'reply_chat':
        case 'view_chat':
          targetUrl = data.chatId ? `/customer/chat/${data.chatId}` : '/customer/dashboard';
          break;
          
        case 'view_progress':
          targetUrl = data.orderId ? `/customer/order/${data.orderId}/progress` : '/customer/orders';
          break;
          
        case 'open_dashboard':
        case 'open_store':
          targetUrl = data.storeId ? `/store/${data.storeId}` : '/customer/dashboard';
          break;
          
        case 'view_offer':
        case 'shop_now':
          targetUrl = data.link || '/customer/offers';
          break;
          
        case 'view_notifications':
          targetUrl = '/customer/notifications';
          break;
          
        default:
          targetUrl = data.url || '/customer/dashboard';
      }
    }
    
    console.log(`[SW ${SW_VERSION}] 🌐 Navegando para:`, targetUrl);
    
    // Tentar focar em uma janela existente ou abrir nova
    const urlToOpen = new URL(targetUrl, self.location.origin).href;
    
    const windowClients = await self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    });
    
    // Procurar janela já aberta
    for (const client of windowClients) {
      if (client.url === urlToOpen && 'focus' in client) {
        return client.focus();
      }
    }
    
    // Abrir nova janela
    if (self.clients.openWindow) {
      return self.clients.openWindow(targetUrl);
    }
  };
  
  event.waitUntil(handleClick());
});

// 📍 PUSH SUBSCRIPTION CHANGE - Lidar com mudanças na subscription
self.addEventListener('pushsubscriptionchange', event => {
  console.log(`[SW ${SW_VERSION}] 🔄 Subscription mudou`);
  
  const resubscribe = async () => {
    try {
      const subscription = await self.registration.pushManager.getSubscription();
      if (subscription) {
        console.log(`[SW ${SW_VERSION}] ✅ Ainda inscrito`);
        return;
      }
      
      // Tentar re-inscrever
      console.log(`[SW ${SW_VERSION}] 🔄 Tentando re-inscrever...`);
      
      // Buscar VAPID key do cliente
      const clients = await self.clients.matchAll();
      if (clients.length > 0) {
        clients[0].postMessage({
          type: 'RESUBSCRIBE_NEEDED',
          version: SW_VERSION
        });
      }
    } catch (error) {
      console.error(`[SW ${SW_VERSION}] ❌ Erro ao verificar subscription:`, error);
    }
  };
  
  event.waitUntil(resubscribe());
});

// 🔧 INSTALL - Instalar e cachear assets
self.addEventListener('install', event => {
  console.log(`[SW ${SW_VERSION}] 🔧 Instalando...`);
  
  const installProcess = async () => {
    try {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(STATIC_ASSETS);
      console.log(`[SW ${SW_VERSION}] ✅ Assets cacheados`);
      
      // Forçar ativação imediata
      await self.skipWaiting();
    } catch (error) {
      console.error(`[SW ${SW_VERSION}] ❌ Erro na instalação:`, error);
    }
  };
  
  event.waitUntil(installProcess());
});

// ✅ ACTIVATE - Limpar caches antigos
self.addEventListener('activate', event => {
  console.log(`[SW ${SW_VERSION}] ✅ Ativando...`);
  
  const activateProcess = async () => {
    try {
      // Limpar caches antigos
      const cacheNames = await caches.keys();
      const oldCaches = cacheNames.filter(name => 
        name.startsWith('projeto-rafael-') && name !== CACHE_NAME
      );
      
      await Promise.all(oldCaches.map(name => {
        console.log(`[SW ${SW_VERSION}] 🗑️ Removendo cache antigo:`, name);
        return caches.delete(name);
      }));
      
      // Tomar controle de todas as páginas
      await self.clients.claim();
      console.log(`[SW ${SW_VERSION}] ✅ Service Worker ativo e no controle`);
      
    } catch (error) {
      console.error(`[SW ${SW_VERSION}] ❌ Erro na ativação:`, error);
    }
  };
  
  event.waitUntil(activateProcess());
});

// 🌐 FETCH - Estratégia de cache (Network First com fallback)
self.addEventListener('fetch', event => {
  // Ignorar requisições que não sejam GET
  if (event.request.method !== 'GET') return;
  
  // Ignorar requisições para outros domínios
  if (!event.request.url.startsWith(self.location.origin)) return;
  
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // Retornar do cache mas buscar atualização em background
          event.waitUntil(
            fetch(event.request)
              .then(response => {
                if (response && response.status === 200) {
                  const responseClone = response.clone();
                  caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseClone);
                  });
                }
              })
              .catch(() => {}) // Ignorar erros de rede em background
          );
          return cachedResponse;
        }
        
        // Se não estiver em cache, buscar da rede
        return fetch(event.request)
          .then(response => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
            
            return response;
          });
      })
      .catch(() => {
        // Offline fallback para páginas HTML
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      })
  );
});

// 💬 MESSAGE - Comunicação com o cliente
self.addEventListener('message', event => {
  console.log(`[SW ${SW_VERSION}] 💬 Mensagem recebida:`, event.data);
  
  if (event.data.type === 'DEBUG_SW') {
    event.ports[0].postMessage({
      version: SW_VERSION,
      status: 'active',
      cached: STATIC_ASSETS.length,
      timestamp: new Date().toISOString()
    });
  }
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'CLEAR_CACHE') {
    caches.keys().then(names => {
      Promise.all(names.map(name => caches.delete(name)));
    });
  }
});

console.log(`[SW ${SW_VERSION}] 📍 Web Push Service Worker carregado`);
