// public/firebase-messaging-sw.js - VERSÃO 4.0 - CORREÇÃO DE ÍCONES
importScripts('https://www.gstatic.com/firebasejs/11.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.8.0/firebase-messaging-compat.js');

const SW_VERSION = 'v4.0.0-custom-icons-fixed';

const firebaseConfig = {
  apiKey: "AIzaSyChzG6hDW0hKlkMzFG8oKcWAnRMldGiWro",
  authDomain: "projeto-rafael-53f73.firebaseapp.com",
  projectId: "projeto-rafael-53f73",
  storageBucket: "projeto-rafael-53f73.firebasestorage.app",
  messagingSenderId: "572769248919",
  appId: "1:572769248919:web:4b4d4e829098246baeebd2",
  measurementId: "G-HGKQ3P6RWJ"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// 🎯 FUNÇÃO PARA TESTAR SE URL DE IMAGEM É VÁLIDA
async function testImageLoad(imageUrl) {
  try {
    const response = await fetch(imageUrl, { method: 'HEAD', mode: 'cors' });
    return response.ok;
  } catch (error) {
    console.log(`[SW ${SW_VERSION}] ⚠️ Erro ao testar imagem:`, imageUrl, error);
    return false;
  }
}

// ✅ HANDLER CORRIGIDO - PRIORIZA LOGO PERSONALIZADO
messaging.onBackgroundMessage(async (payload) => {
  console.log(`[SW ${SW_VERSION}] 📨 Mensagem recebida:`, payload);
  
  // ✅ TÍTULO E BODY
  let title = payload.notification?.title || payload.data?.title || 'Nova notificação - Projeto Rafael';
  let body = payload.notification?.body || payload.data?.body || 'Você tem uma nova atualização';
  
  // 🎯 BUSCAR LOGO PERSONALIZADO - PRIORIDADE CORRETA
  let customIcon = null;
  
  // 1. Primeiro: notification.icon (vem do backend)
  if (payload.notification?.icon && payload.notification.icon.startsWith('https://')) {
    customIcon = payload.notification.icon;
    console.log(`[SW ${SW_VERSION}] 🎯 Logo notification.icon:`, customIcon);
  }
  // 2. Segundo: data.icon
  else if (payload.data?.icon && payload.data.icon.startsWith('https://')) {
    customIcon = payload.data.icon;
    console.log(`[SW ${SW_VERSION}] 🎯 Logo data.icon:`, customIcon);
  }
  // 3. Terceiro: data.logoUrl  
  else if (payload.data?.logoUrl && payload.data.logoUrl.startsWith('https://')) {
    customIcon = payload.data.logoUrl;
    console.log(`[SW ${SW_VERSION}] 🎯 Logo data.logoUrl:`, customIcon);
  }
  
  // 📸 BUSCAR IMAGEM GRANDE - PRIORIDADE CORRETA
  let customImage = null;
  
  // 1. Primeiro: notification.image (vem do backend) 
  if (payload.notification?.image && payload.notification.image.startsWith('https://')) {
    customImage = payload.notification.image;
    console.log(`[SW ${SW_VERSION}] 📸 Imagem notification.image:`, customImage);
  }
  // 2. Segundo: data.image
  else if (payload.data?.image && payload.data.image.startsWith('https://')) {
    customImage = payload.data.image;
    console.log(`[SW ${SW_VERSION}] 📸 Imagem data.image:`, customImage);
  }
  // 3. Terceiro: data.imageUrl
  else if (payload.data?.imageUrl && payload.data.imageUrl.startsWith('https://')) {
    customImage = payload.data.imageUrl;
    console.log(`[SW ${SW_VERSION}] 📸 Imagem data.imageUrl:`, customImage);
  }
  
  // 🔗 BUSCAR LINK PERSONALIZADO
  let customLink = null;
  if (payload.data?.link && payload.data.link.startsWith('http')) {
    customLink = payload.data.link;
    console.log(`[SW ${SW_VERSION}] 🔗 Link encontrado:`, customLink);
  }
  
  // ✅ TESTAR VALIDADE DAS URLs (opcional - pode ser lento)
  // if (customIcon) {
  //   const iconValid = await testImageLoad(customIcon);
  //   if (!iconValid) {
  //     console.log(`[SW ${SW_VERSION}] ❌ Logo inválido, usando padrão`);
  //     customIcon = null;
  //   }
  // }
  
  // 🎨 USAR LOGO PERSONALIZADO OU PADRÃO
  const finalIcon = customIcon || '/vite.svg';
  const hasCustomIcon = !!customIcon;
  
  console.log(`[SW ${SW_VERSION}] ✅ Configuração final:`, {
    title,
    body: body.substring(0, 50) + '...',
    hasCustomIcon,
    finalIcon: finalIcon.substring(0, 100) + (finalIcon.length > 100 ? '...' : ''),
    hasCustomImage: !!customImage,
    customImage: customImage ? customImage.substring(0, 100) + '...' : null,
    hasCustomLink: !!customLink
  });
  
  // 📱 CONFIGURAR NOTIFICAÇÃO
  const notificationOptions = {
    body: body,
    icon: finalIcon,  // 🎯 USAR LOGO PERSONALIZADO
    badge: hasCustomIcon ? finalIcon : '/vite.svg',
    tag: 'projeto-rafael-' + Date.now(),
    requireInteraction: false,
    data: {
      ...payload.data,
      customLink: customLink  // 🔗 PASSAR LINK PARA O CLICK HANDLER
    },
    vibrate: [200, 100, 200],
    actions: [
      { action: 'view', title: 'Abrir' },
      { action: 'dismiss', title: 'Dispensar' }
    ],
    timestamp: Date.now()
  };
  
  // 📸 ADICIONAR IMAGEM GRANDE SE DISPONÍVEL
  if (customImage) {
    notificationOptions.image = customImage;
    console.log(`[SW ${SW_VERSION}] 🎨 Notificação com imagem grande: ${customImage.substring(0, 80)}...`);
  }
  
  console.log(`[SW ${SW_VERSION}] 🚀 Mostrando notificação com logo personalizado:`, hasCustomIcon);
  
  return self.registration.showNotification(title, notificationOptions);
});

// ✅ CLICK HANDLER CORRIGIDO - USA LINK PERSONALIZADO
self.addEventListener('notificationclick', (event) => {
  console.log(`[SW ${SW_VERSION}] 🖱️ Notificação clicada - Ação:`, event.action);
  event.notification.close();
  
  let targetUrl = 'https://projeto-rafael-53f73.web.app/customer/dashboard';
  
  // 🔗 PRIORIDADE: Link personalizado do payload
  if (event.notification.data?.customLink) {
    targetUrl = event.notification.data.customLink;
    console.log(`[SW ${SW_VERSION}] 🔗 Usando link personalizado:`, targetUrl);
  }
  // 🔗 FALLBACK: Link padrão baseado no tipo
  else if (event.action === 'view' && event.notification.data) {
    if (event.notification.data.orderId) {
      targetUrl = `https://projeto-rafael-53f73.web.app/customer/orders/${event.notification.data.orderId}`;
    } else if (event.notification.data.chatId) {
      targetUrl = `https://projeto-rafael-53f73.web.app/customer/chat/${event.notification.data.chatId}`;
    }
  }
  
  console.log(`[SW ${SW_VERSION}] 🎯 Navegando para:`, targetUrl);
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Tentar focar em uma janela existente
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          console.log(`[SW ${SW_VERSION}] 🔍 Focando janela existente`);
          return client.focus().then(() => {
            return client.navigate(targetUrl);
          });
        }
      }
      // Se não houver janela, abrir uma nova
      if (clients.openWindow) {
        console.log(`[SW ${SW_VERSION}] 🆕 Abrindo nova janela`);
        return clients.openWindow(targetUrl);
      }
    }).catch(error => {
      console.error(`[SW ${SW_VERSION}] ❌ Erro ao navegar:`, error);
    })
  );
});

// ✅ EVENTOS DO SW - FORÇAR ATUALIZAÇÃO
self.addEventListener('install', (event) => {
  console.log(`[SW ${SW_VERSION}] 🔧 Service Worker instalado - FORÇANDO ATUALIZAÇÃO`);
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log(`[SW ${SW_VERSION}] ✅ Service Worker ativado - VERSÃO COM LOGOS PERSONALIZADOS`);
  event.waitUntil(
    Promise.all([
      clients.claim(),
      // Limpar caches antigos
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            console.log(`[SW ${SW_VERSION}] 🧹 Limpando cache:`, cacheName);
            return caches.delete(cacheName);
          })
        );
      }),
      // Notificar clientes sobre atualização
      clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'SW_UPDATED',
            version: SW_VERSION,
            features: ['custom-icons-fixed', 'custom-links-fixed']
          });
        });
      })
    ])
  );
});

// ✅ PUSH EVENT HANDLER - BACKUP
self.addEventListener('push', (event) => {
  console.log(`[SW ${SW_VERSION}] 🔔 Push event recebido`);
  
  if (!event.data) {
    console.log(`[SW ${SW_VERSION}] ⚠️ Push sem dados`);
    return;
  }
  
  try {
    const payload = event.data.json();
    console.log(`[SW ${SW_VERSION}] 📦 Push payload:`, payload);
    
    // Processar apenas se onBackgroundMessage não processar
    if (payload.notification && !payload._processed) {
      let title = payload.notification.title || 'Nova notificação - Projeto Rafael';
      let body = payload.notification.body || 'Você tem uma nova atualização';
      
      // 🎯 BUSCAR LOGO PERSONALIZADO (mesma lógica)
      let customIcon = payload.notification?.icon || payload.data?.icon || payload.data?.logoUrl;
      let customImage = payload.notification?.image || payload.data?.image || payload.data?.imageUrl;
      
      const notificationOptions = {
        body: body,
        icon: customIcon || '/vite.svg',
        badge: customIcon || '/vite.svg',
        tag: 'push-' + Date.now(),
        data: payload.data || {}
      };
      
      if (customImage) {
        notificationOptions.image = customImage;
        console.log(`[SW ${SW_VERSION}] 🖼️ Push com imagem personalizada`);
      }
      
      console.log(`[SW ${SW_VERSION}] 🚀 Push com logo personalizado:`, !!customIcon);
      
      event.waitUntil(
        self.registration.showNotification(title, notificationOptions)
      );
    }
  } catch (error) {
    console.error(`[SW ${SW_VERSION}] ❌ Erro ao processar push:`, error);
  }
});

// ✅ DEBUG HANDLER
self.addEventListener('message', (event) => {
  if (event.data?.type === 'DEBUG_SW') {
    console.log(`[SW ${SW_VERSION}] 🔍 Debug solicitado`);
    event.ports[0]?.postMessage({
      status: 'ok',
      version: SW_VERSION,
      firebase: '11.8.0',
      features: ['custom-icons-prioritized', 'custom-links-working', 'image-support'],
      timestamp: new Date().toISOString()
    });
  }
  
  if (event.data?.type === 'SKIP_WAITING') {
    console.log(`[SW ${SW_VERSION}] ⏩ Skip waiting solicitado`);
    self.skipWaiting();
  }
});

console.log(`[SW ${SW_VERSION}] 📍 Service Worker carregado - LOGOS PERSONALIZADOS CORRIGIDOS`);