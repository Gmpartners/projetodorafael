// public/firebase-messaging-sw.js - VERSÃO CORRIGIDA v2 - SEM LOCALHOST
importScripts('https://www.gstatic.com/firebasejs/11.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.8.0/firebase-messaging-compat.js');

const SW_VERSION = 'v2.0.0-no-localhost';

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

// ✅ HANDLER CORRIGIDO - FORÇA USO DO TÍTULO/BODY CORRETOS
messaging.onBackgroundMessage((payload) => {
  console.log(`[SW ${SW_VERSION}] 📨 Mensagem recebida:`, payload);
  
  // ✅ BUSCAR TÍTULO E BODY EM TODOS OS LUGARES POSSÍVEIS
  let title = '';
  let body = '';
  
  // Prioridade 1: notification root
  if (payload.notification) {
    title = payload.notification.title || '';
    body = payload.notification.body || '';
  }
  
  // Prioridade 2: data (se não tiver em notification)
  if (!title && payload.data) {
    title = payload.data.title || payload.data.gcm?.notification?.title || '';
    body = payload.data.body || payload.data.gcm?.notification?.body || '';
  }
  
  // Prioridade 3: webpush
  if (!title && payload.webpush?.notification) {
    title = payload.webpush.notification.title || '';
    body = payload.webpush.notification.body || '';
  }
  
  // Valores padrão (NUNCA usar localhost)
  if (!title) title = 'Nova notificação - Projeto Rafael';
  if (!body) body = 'Você tem uma nova atualização';
  
  console.log(`[SW ${SW_VERSION}] ✅ Título final:`, title);
  console.log(`[SW ${SW_VERSION}] ✅ Corpo final:`, body);
  
  // ✅ GARANTIR QUE NÃO HÁ LOCALHOST NO TÍTULO/BODY
  if (title.includes('localhost') || body.includes('localhost')) {
    console.warn(`[SW ${SW_VERSION}] ⚠️ Detectado localhost, substituindo...`);
    title = 'Nova notificação - Projeto Rafael';
    body = 'Você tem uma nova atualização';
  }
  
  const notificationOptions = {
    body: body,
    icon: '/vite.svg',
    badge: '/vite.svg',
    tag: 'projeto-rafael-' + Date.now(),
    requireInteraction: false,
    data: payload.data || {},
    vibrate: [200, 100, 200],
    actions: [
      { action: 'view', title: 'Ver Detalhes' },
      { action: 'dismiss', title: 'Dispensar' }
    ]
  };
  
  return self.registration.showNotification(title, notificationOptions);
});

// ✅ EVENTOS DO SW - FORÇAR ATUALIZAÇÃO
self.addEventListener('install', (event) => {
  console.log(`[SW ${SW_VERSION}] 🔧 Service Worker instalado`);
  // Forçar ativação imediata
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log(`[SW ${SW_VERSION}] ✅ Service Worker ativado`);
  event.waitUntil(
    Promise.all([
      // Tomar controle de todas as páginas imediatamente
      clients.claim(),
      // Limpar TODOS os caches antigos
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
            version: SW_VERSION
          });
        });
      })
    ])
  );
});

// ✅ CLICK HANDLER MELHORADO
self.addEventListener('notificationclick', (event) => {
  console.log(`[SW ${SW_VERSION}] 🖱️ Notificação clicada - Ação:`, event.action);
  event.notification.close();
  
  let targetUrl = 'https://projeto-rafael-53f73.web.app/customer/dashboard';
  
  if (event.action === 'view' && event.notification.data) {
    if (event.notification.data.link) {
      targetUrl = event.notification.data.link;
    } else if (event.notification.data.orderId) {
      targetUrl = `https://projeto-rafael-53f73.web.app/customer/orders/${event.notification.data.orderId}`;
    } else if (event.notification.data.chatId) {
      targetUrl = `https://projeto-rafael-53f73.web.app/customer/chat/${event.notification.data.chatId}`;
    }
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus().then(() => {
            return client.navigate(targetUrl);
          });
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
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
      
      // Garantir que não há localhost
      if (title.includes('localhost') || body.includes('localhost')) {
        title = 'Nova notificação - Projeto Rafael';
        body = 'Você tem uma nova atualização';
      }
      
      event.waitUntil(
        self.registration.showNotification(title, {
          body: body,
          icon: '/vite.svg',
          badge: '/vite.svg',
          tag: 'push-' + Date.now(),
          data: payload.data || {}
        })
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
      timestamp: new Date().toISOString()
    });
  }
  
  if (event.data?.type === 'SKIP_WAITING') {
    console.log(`[SW ${SW_VERSION}] ⏩ Skip waiting solicitado`);
    self.skipWaiting();
  }
});

console.log(`[SW ${SW_VERSION}] 📍 Service Worker carregado - SEM LOCALHOST`);