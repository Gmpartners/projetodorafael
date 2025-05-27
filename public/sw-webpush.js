// 🚀 Web Push Service Worker v7.0 - Sistema Completo com URL Personalizada
// Versão 7.0.0 - Campos configuráveis + Actions inteligentes + Navegação otimizada

const SW_VERSION = 'v7.0.0-web-push-complete';
const CACHE_NAME = `projeto-rafael-${SW_VERSION}`;

// Assets para cache offline
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/vite.svg'
];

// 📨 PUSH EVENT - Receber notificações Web Push v7.0
self.addEventListener('push', event => {
  console.log(`[SW ${SW_VERSION}] 📨 Web Push v7.0 recebido`);
  
  if (!event.data) {
    console.warn(`[SW ${SW_VERSION}] ⚠️ Push sem dados`);
    return;
  }

  const handlePush = async () => {
    try {
      const payload = event.data.json();
      console.log(`[SW ${SW_VERSION}] 📋 Payload v7.0:`, payload);
      
      // Extrair dados da notificação v7.0
      const { 
        title, 
        body, 
        icon, 
        badge, 
        image, 
        data, 
        actions,
        requireInteraction = true,
        vibrate = [200, 100, 200],
        renotify = true,
        tag,
        ...options 
      } = payload;
      
      // 🎯 Configurar opções da notificação v7.0
      const notificationOptions = {
        body: body || 'Nova notificação v7.0',
        icon: icon || '/vite.svg',
        badge: badge || '/vite.svg',
        data: {
          ...data,
          timestamp: Date.now(),
          version: SW_VERSION,
          url: data?.url || '/' // 🎯 URL PERSONALIZADA v7.0
        },
        requireInteraction,
        silent: options.silent || false,
        vibrate,
        renotify,
        tag: tag || `notification-v7-${Date.now()}`,
        actions: actions || []
      };
      
      // 🖼️ Adicionar imagem grande se fornecida (v7.0)
      if (image) {
        notificationOptions.image = image;
        console.log(`[SW ${SW_VERSION}] 🖼️ Imagem grande adicionada:`, image);
      }
      
      // 🎨 Personalização adicional v7.0
      if (data?.primaryColor && 'actions' in Notification.prototype) {
        notificationOptions.actions = notificationOptions.actions.map(action => ({
          ...action,
          icon: action.icon || '/vite.svg'
        }));
      }
      
      console.log(`[SW ${SW_VERSION}] 🚀 Exibindo notificação v7.0:`, {
        title,
        hasImage: !!image,
        hasCustomIcon: icon !== '/vite.svg',
        actionsCount: notificationOptions.actions.length,
        customUrl: data?.url
      });
      
      await self.registration.showNotification(
        title || 'Nova Notificação v7.0',
        notificationOptions
      );
      
    } catch (error) {
      console.error(`[SW ${SW_VERSION}] ❌ Erro ao processar push v7.0:`, error);
      
      // Fallback notification
      await self.registration.showNotification('Nova Notificação', {
        body: 'Você recebeu uma nova atualização',
        icon: '/vite.svg',
        badge: '/vite.svg',
        data: { url: '/', version: SW_VERSION }
      });
    }
  };
  
  event.waitUntil(handlePush());
});

// 👆 NOTIFICATION CLICK v7.0 - Actions Inteligentes + URL Personalizada
self.addEventListener('notificationclick', event => {
  console.log(`[SW ${SW_VERSION}] 👆 Clique na notificação v7.0`);
  
  event.notification.close();
  
  const handleClick = async () => {
    const data = event.notification.data || {};
    const action = event.action;
    
    console.log(`[SW ${SW_VERSION}] 🎯 Action v7.0:`, action, 'Data:', data);
    
    let targetUrl = data.url || '/';
    
    // 🧠 ROTEAMENTO INTELIGENTE v7.0 - Actions contextuais por tipo
    if (action) {
      const baseUrl = 'https://projeto-rafael-53f73.web.app';
      
      switch (action) {
        // 📦 Actions de Pedido
        case 'view_order':
          targetUrl = data.orderId 
            ? `${baseUrl}/customer/orders/${data.orderId}`
            : `${baseUrl}/customer/dashboard`;
          break;
          
        case 'track_order':
          targetUrl = data.orderId 
            ? `${baseUrl}/customer/orders/${data.orderId}/tracking`
            : `${baseUrl}/customer/orders`;
          break;
          
        case 'view_progress':
          targetUrl = data.orderId 
            ? `${baseUrl}/customer/orders/${data.orderId}/progress`
            : `${baseUrl}/customer/orders`;
          break;
          
        // 💬 Actions de Chat
        case 'reply_chat':
        case 'view_chat':
          targetUrl = data.chatId 
            ? `${baseUrl}/customer/chat/${data.chatId}`
            : `${baseUrl}/customer/chat`;
          break;
          
        // 📊 Actions de Progresso
        case 'view_details':
          targetUrl = data.orderId 
            ? `${baseUrl}/customer/orders/${data.orderId}`
            : `${baseUrl}/customer/dashboard`;
          break;
          
        // 🏪 Actions de Loja
        case 'open_dashboard':
        case 'open_store':
          targetUrl = data.storeId 
            ? `${baseUrl}/store/dashboard`
            : `${baseUrl}/store/dashboard`;
          break;
          
        // 🛍️ Actions de Compra
        case 'view_offer':
        case 'shop_now':
          targetUrl = data.link || data.url || `${baseUrl}/customer/offers`;
          break;
          
        case 'view_products':
          targetUrl = `${baseUrl}/customer/products`;
          break;
          
        // 🔔 Actions Gerais
        case 'view_notifications':
          targetUrl = `${baseUrl}/customer/notifications`;
          break;
          
        case 'open_app':
        default:
          targetUrl = data.url || `${baseUrl}/customer/dashboard`;
      }
    } else {
      // Clique na notificação principal - usar URL personalizada v7.0
      targetUrl = data.url || '/customer/dashboard';
      
      // Se não tem protocolo, adicionar base URL
      if (!targetUrl.startsWith('http')) {
        targetUrl = `https://projeto-rafael-53f73.web.app${targetUrl}`;
      }
    }
    
    console.log(`[SW ${SW_VERSION}] 🌐 Navegando para URL v7.0:`, targetUrl);
    
    // 🎯 NAVEGAÇÃO INTELIGENTE v7.0 - Focar janela existente ou abrir nova
    const urlToOpen = new URL(targetUrl).href;
    
    try {
      const windowClients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      });
      
      // Procurar janela já aberta com a mesma origem
      for (const client of windowClients) {
        const clientUrl = new URL(client.url);
        const targetUrlObj = new URL(urlToOpen);
        
        if (clientUrl.origin === targetUrlObj.origin) {
          console.log(`[SW ${SW_VERSION}] 🎯 Focando janela existente e navegando`);
          
          // Focar e navegar
          await client.focus();
          
          // Tentar navegar na janela existente
          if ('navigate' in client) {
            await client.navigate(urlToOpen);
          } else {
            // Fallback: enviar mensagem para navegar
            client.postMessage({
              type: 'NAVIGATE',
              url: urlToOpen,
              source: 'notification_click'
            });
          }
          return;
        }
      }
      
      // Se não encontrou janela compatível, abrir nova
      console.log(`[SW ${SW_VERSION}] 🆕 Abrindo nova janela`);
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
      
    } catch (error) {
      console.error(`[SW ${SW_VERSION}] ❌ Erro na navegação inteligente:`, error);
      // Fallback simples
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    }
  };
  
  event.waitUntil(handleClick());
});

// 📍 PUSH SUBSCRIPTION CHANGE v7.0 - Re-subscription inteligente
self.addEventListener('pushsubscriptionchange', event => {
  console.log(`[SW ${SW_VERSION}] 🔄 Subscription mudou v7.0`);
  
  const resubscribe = async () => {
    try {
      const subscription = await self.registration.pushManager.getSubscription();
      if (subscription) {
        console.log(`[SW ${SW_VERSION}] ✅ Ainda inscrito v7.0`);
        return;
      }
      
      console.log(`[SW ${SW_VERSION}] 🔄 Tentando re-inscrever v7.0...`);
      
      // Buscar clientes ativos para solicitar re-subscription
      const clients = await self.clients.matchAll();
      if (clients.length > 0) {
        clients[0].postMessage({
          type: 'RESUBSCRIBE_NEEDED',
          version: SW_VERSION,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.error(`[SW ${SW_VERSION}] ❌ Erro ao verificar subscription v7.0:`, error);
    }
  };
  
  event.waitUntil(resubscribe());
});

// 🔧 INSTALL v7.0 - Cache inteligente
self.addEventListener('install', event => {
  console.log(`[SW ${SW_VERSION}] 🔧 Instalando v7.0...`);
  
  const installProcess = async () => {
    try {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(STATIC_ASSETS);
      console.log(`[SW ${SW_VERSION}] ✅ Assets v7.0 cacheados`);
      
      // Forçar ativação imediata
      await self.skipWaiting();
    } catch (error) {
      console.error(`[SW ${SW_VERSION}] ❌ Erro na instalação v7.0:`, error);
    }
  };
  
  event.waitUntil(installProcess());
});

// ✅ ACTIVATE v7.0 - Limpeza inteligente de caches
self.addEventListener('activate', event => {
  console.log(`[SW ${SW_VERSION}] ✅ Ativando v7.0...`);
  
  const activateProcess = async () => {
    try {
      // Limpar caches antigos (versões anteriores)
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
      console.log(`[SW ${SW_VERSION}] ✅ Service Worker v7.0 ativo e no controle`);
      
      // Notificar clientes sobre nova versão
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'SW_ACTIVATED',
          version: SW_VERSION,
          features: [
            'URL Personalizada',
            'Actions Inteligentes', 
            'Imagens Grandes',
            'Navegação Otimizada',
            'Cache Inteligente'
          ]
        });
      });
      
    } catch (error) {
      console.error(`[SW ${SW_VERSION}] ❌ Erro na ativação v7.0:`, error);
    }
  };
  
  event.waitUntil(activateProcess());
});

// 🌐 FETCH v7.0 - Cache Strategy otimizada
self.addEventListener('fetch', event => {
  // Ignorar requisições que não sejam GET
  if (event.request.method !== 'GET') return;
  
  // Ignorar requisições para outros domínios
  if (!event.request.url.startsWith(self.location.origin)) return;
  
  // Ignorar APIs
  if (event.request.url.includes('/api/') || event.request.url.includes('cloudfunctions.net')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // Cache hit - retornar do cache mas buscar atualização em background
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
        
        // Cache miss - buscar da rede
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

// 💬 MESSAGE v7.0 - Comunicação bidirecional aprimorada
self.addEventListener('message', event => {
  console.log(`[SW ${SW_VERSION}] 💬 Mensagem v7.0 recebida:`, event.data);
  
  const { type, data } = event.data || {};
  
  switch (type) {
    case 'DEBUG_SW':
      event.ports[0].postMessage({
        version: SW_VERSION,
        status: 'active',
        cached: STATIC_ASSETS.length,
        timestamp: new Date().toISOString(),
        features: {
          urlPersonalizada: true,
          actionsInteligentes: true,
          imagensGrandes: true,
          navegacaoOtimizada: true,
          cacheInteligente: true
        }
      });
      break;
      
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CLEAR_CACHE':
      caches.keys().then(names => {
        Promise.all(names.map(name => caches.delete(name)));
      });
      break;
      
    case 'NAVIGATE':
      // Listener para navegação via postMessage
      if (data?.url) {
        console.log(`[SW ${SW_VERSION}] 🔄 Redirecionamento solicitado:`, data.url);
      }
      break;
      
    default:
      console.log(`[SW ${SW_VERSION}] ❓ Tipo de mensagem desconhecido:`, type);
  }
});

// 🚫 ERROR v7.0 - Error handling aprimorado
self.addEventListener('error', event => {
  console.error(`[SW ${SW_VERSION}] 💥 Erro no Service Worker v7.0:`, event.error);
});

self.addEventListener('unhandledrejection', event => {
  console.error(`[SW ${SW_VERSION}] 💥 Promise rejeitada v7.0:`, event.reason);
});

console.log(`[SW ${SW_VERSION}] 📍 Web Push Service Worker v7.0 carregado com sucesso!`);
console.log(`[SW ${SW_VERSION}] ✨ Funcionalidades: URL Personalizada, Actions Inteligentes, Imagens Grandes, Navegação Otimizada`);
