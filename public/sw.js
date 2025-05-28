// Web Push Service Worker v7.5 - Clean Version
const SW_VERSION = 'v7.5-clean';
const CACHE_NAME = `pwa-cache-${SW_VERSION}`;

// Assets para cache
const urlsToCache = [
  '/',
  '/manifest.json',
  '/vite.svg'
];

// 🚀 EVENTO PUSH - WEB PUSH v7.5
self.addEventListener('push', async (event) => {
  console.log(`[SW ${SW_VERSION}] 📨 Web Push recebido`);
  
  if (!event.data) {
    console.warn(`[SW ${SW_VERSION}] ⚠️ Push sem dados`);
    return;
  }

  try {
    const payload = event.data.json();
    console.log(`[SW ${SW_VERSION}] 📋 Payload:`, payload);
    
    event.waitUntil(
      handleWebPushNotification(payload)
    );
  } catch (error) {
    console.error(`[SW ${SW_VERSION}] ❌ Erro ao processar push:`, error);
  }
});

// 🔔 PROCESSAR NOTIFICAÇÃO WEB PUSH v7.5
async function handleWebPushNotification(payload) {
  try {
    const {
      title,
      body,
      icon,
      badge,
      image,
      data = {},
      actions = [],
      requireInteraction = true,
      vibrate = [200, 100, 200],
      renotify = true,
      tag,
      silent
    } = payload;

    // 🎯 Opções da notificação
    const notificationOptions = {
      body: body || 'Nova notificação',
      icon: icon || '/vite.svg',
      badge: badge || '/vite.svg',
      data: {
        ...data,
        timestamp: Date.now(),
        version: SW_VERSION,
        url: data?.url || '/'
      },
      requireInteraction,
      silent: silent || false,
      vibrate,
      renotify,
      tag: tag || `notification-${Date.now()}`
    };
    
    // 🖼️ Adicionar imagem grande se existir
    if (image) {
      notificationOptions.image = image;
    }

    // 🎯 Actions - adicionar APENAS se existirem
    if (actions && Array.isArray(actions) && actions.length > 0) {
      notificationOptions.actions = actions.slice(0, 2); // Máximo 2 actions
      console.log(`[SW ${SW_VERSION}] ✅ Actions adicionadas:`, actions);
    } else {
      console.log(`[SW ${SW_VERSION}] ℹ️ Sem actions personalizadas`);
    }

    console.log(`[SW ${SW_VERSION}] 🚀 Exibindo notificação:`, {
      title,
      hasImage: !!image,
      hasCustomIcon: !!icon,
      actionsCount: actions?.length || 0,
      customUrl: data?.url
    });

    try {
      await self.registration.showNotification(
        title || 'Nova Notificação',
        notificationOptions
      );
      console.log(`[SW ${SW_VERSION}] ✅ Notificação exibida com sucesso!`);
    } catch (showError) {
      console.error(`[SW ${SW_VERSION}] ❌ Erro ao exibir notificação:`, showError);
    }
  } catch (error) {
    console.error(`[SW ${SW_VERSION}] ❌ Erro no processamento:`, error);
  }
}

// 🖱️ CLIQUE NA NOTIFICAÇÃO
self.addEventListener('notificationclick', (event) => {
  console.log(`[SW ${SW_VERSION}] 🖱️ Notificação clicada`, {
    action: event.action,
    data: event.notification.data
  });

  event.notification.close();

  const notificationData = event.notification.data || {};
  
  // 🎯 URL personalizada ou padrão
  let targetUrl = notificationData.url || 'https://projeto-rafael-53f73.web.app';
  
  // Se uma action específica foi clicada
  if (event.action) {
    console.log(`[SW ${SW_VERSION}] 🎯 Ação clicada:`, event.action);
    // Aqui você pode mapear actions para URLs específicas se necessário
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Procurar janela existente
        for (const client of clientList) {
          if (client.url === targetUrl && 'focus' in client) {
            return client.focus();
          }
        }
        // Abrir nova janela
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});

// 📦 INSTALAÇÃO - Cache de assets
self.addEventListener('install', (event) => {
  console.log(`[SW ${SW_VERSION}] 📦 Instalando...`);
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log(`[SW ${SW_VERSION}] 📦 Cacheando assets iniciais`);
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error(`[SW ${SW_VERSION}] ❌ Erro no cache:`, error);
      })
  );
});

// 🔄 ATIVAÇÃO - Limpar caches antigos
self.addEventListener('activate', (event) => {
  console.log(`[SW ${SW_VERSION}] 🔄 Ativado!`);
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName.startsWith('pwa-cache-')) {
            console.log(`[SW ${SW_VERSION}] 🗑️ Removendo cache antigo:`, cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  return self.clients.claim();
});

// 🌐 FETCH - Estratégia Network First com fallback para cache
self.addEventListener('fetch', (event) => {
  // Ignorar requisições que não sejam GET
  if (event.request.method !== 'GET') {
    return;
  }

  // Ignorar URLs externas
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clonar a resposta
        const responseToCache = response.clone();
        
        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, responseToCache);
          });
        
        return response;
      })
      .catch(() => {
        // Se falhar, buscar do cache
        return caches.match(event.request);
      })
  );
});

// 🧪 MENSAGEM DE TESTE
self.addEventListener('message', (event) => {
  console.log(`[SW ${SW_VERSION}] 📨 Mensagem recebida:`, event.data);
  
  if (event.data && event.data.type === 'TEST_NOTIFICATION') {
    console.log(`[SW ${SW_VERSION}] 🧪 Teste de notificação solicitado`);
    
    const testPayload = {
      title: '🧪 Teste SW v7.5',
      body: 'Teste de notificação limpa sem actions padrão',
      icon: '/vite.svg',
      badge: '/vite.svg',
      tag: 'test-' + Date.now(),
      requireInteraction: true,
      data: {
        url: 'https://projeto-rafael-53f73.web.app',
        source: 'test-message'
      }
    };
    
    handleWebPushNotification(testPayload);
  }
});

console.log(`[SW ${SW_VERSION}] ✅ Service Worker carregado - versão limpa`);