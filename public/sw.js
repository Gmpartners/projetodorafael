// Web Push Service Worker v7.4 - Mobile Optimized
const SW_VERSION = 'v7.4-mobile-optimized';
const CACHE_NAME = `pwa-cache-${SW_VERSION}`;

// Assets para cache
const urlsToCache = [
  '/',
  '/manifest.json',
  '/vite.svg'
];

// 📱 Detectar se é dispositivo móvel
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    self.navigator.userAgent
  );
};

// 🚀 EVENTO PUSH - WEB PUSH v7.4 COM OTIMIZAÇÃO MOBILE
self.addEventListener('push', async (event) => {
  console.log(`[SW ${SW_VERSION}] 📨 Web Push v7.4 recebido`);
  
  if (!event.data) {
    console.warn(`[SW ${SW_VERSION}] ⚠️ Push sem dados`);
    return;
  }

  try {
    const payload = event.data.json();
    console.log(`[SW ${SW_VERSION}] 📋 Payload v7.4:`, payload);
    
    event.waitUntil(
      handleWebPushNotification(payload)
    );
  } catch (error) {
    console.error(`[SW ${SW_VERSION}] ❌ Erro ao processar push:`, error);
  }
});

// 🔔 PROCESSAR NOTIFICAÇÃO WEB PUSH v7.4
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

    const mobile = isMobile();
    
    // 📱 Se for mobile, adicionar informações dos botões no corpo
    let enhancedBody = body || 'Nova notificação';
    
    if (mobile && actions && actions.length > 0) {
      // Adicionar botões como texto no final da mensagem
      const actionText = actions.map(a => a.title).join(' • ');
      enhancedBody = `${body}\n\n💡 ${actionText}`;
      console.log(`[SW ${SW_VERSION}] 📱 Mobile detectado - botões no corpo:`, actionText);
    }

    // 🎯 Opções da notificação otimizadas
    const notificationOptions = {
      body: enhancedBody,
      icon: icon || '/vite.svg',
      badge: badge || '/vite.svg',
      data: {
        ...data,
        timestamp: Date.now(),
        version: SW_VERSION,
        url: data?.url || '/',
        isMobile: mobile,
        originalActions: actions // Guardar ações originais
      },
      requireInteraction: mobile ? false : requireInteraction, // Mobile: não forçar interação
      silent: silent || false,
      vibrate: mobile ? [200] : vibrate, // Mobile: vibração mais curta
      renotify,
      tag: tag || `notification-v7-${Date.now()}`
    };
    
    // 🖼️ Adicionar imagem grande se existir
    if (image) {
      notificationOptions.image = image;
    }

    // 🎯 Actions - só adicionar em desktop
    if (!mobile && actions && actions.length > 0) {
      notificationOptions.actions = actions.slice(0, 2); // Máximo 2 actions
      console.log(`[SW ${SW_VERSION}] 💻 Desktop - actions adicionadas:`, actions);
    }

    console.log(`[SW ${SW_VERSION}] 🚀 Exibindo notificação v7.4:`, {
      title,
      hasImage: !!image,
      hasCustomIcon: !!icon,
      actionsCount: actions?.length || 0,
      customUrl: data?.url,
      isMobile: mobile,
      bodyLength: enhancedBody.length
    });

    try {
      const permission = await Notification.permission;
      console.log(`[SW ${SW_VERSION}] 🔐 Permissão atual:`, permission);
      
      if (permission === 'granted') {
        await self.registration.showNotification(
          title || 'Nova Notificação',
          notificationOptions
        );
        console.log(`[SW ${SW_VERSION}] ✅ Notificação exibida com sucesso!`);
      } else {
        console.warn(`[SW ${SW_VERSION}] ⚠️ Sem permissão para notificações`);
      }
    } catch (showError) {
      console.error(`[SW ${SW_VERSION}] ❌ Erro ao exibir notificação:`, showError);
      // Fallback simples
      await self.registration.showNotification(
        title || 'Notificação',
        {
          body: body || 'Nova mensagem',
          icon: '/vite.svg'
        }
      );
    }
  } catch (error) {
    console.error(`[SW ${SW_VERSION}] ❌ Erro no processamento:`, error);
  }
}

// 🖱️ CLIQUE NA NOTIFICAÇÃO v7.4
self.addEventListener('notificationclick', (event) => {
  console.log(`[SW ${SW_VERSION}] 🖱️ Notificação clicada`, {
    action: event.action,
    data: event.notification.data
  });

  event.notification.close();

  const notificationData = event.notification.data || {};
  const originalActions = notificationData.originalActions || [];
  
  // 🎯 URL personalizada ou padrão
  let targetUrl = notificationData.url || 'https://projeto-rafael-53f73.web.app';
  
  // 📱 Em mobile, tratar clique baseado na ação simulada
  if (notificationData.isMobile && event.action === '' && originalActions.length > 0) {
    // Mobile: usar primeira ação como padrão
    console.log(`[SW ${SW_VERSION}] 📱 Mobile: usando primeira ação como padrão`);
    targetUrl = notificationData.url || targetUrl;
  } else if (event.action) {
    // Desktop: ação específica clicada
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
      title: '🧪 Teste SW v7.4 Mobile',
      body: 'Teste com otimização para dispositivos móveis',
      icon: '/vite.svg',
      badge: '/vite.svg',
      tag: 'test-' + Date.now(),
      requireInteraction: true,
      actions: [
        { action: 'test1', title: '✅ Botão 1' },
        { action: 'test2', title: '🎯 Botão 2' }
      ],
      data: {
        url: 'https://projeto-rafael-53f73.web.app',
        source: 'test-message',
        testMode: true
      }
    };
    
    handleWebPushNotification(testPayload);
  }
});

console.log(`[SW ${SW_VERSION}] ✅ Service Worker carregado com otimização mobile`);