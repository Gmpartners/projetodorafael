// public/firebase-messaging-sw.js - VERSÃO CORRIGIDA COM FIREBASE 11.8.0
importScripts('https://www.gstatic.com/firebasejs/11.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.8.0/firebase-messaging-compat.js');

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

// ✅ HANDLER CORRIGIDO COM VERSÃO ATUALIZADA
messaging.onBackgroundMessage((payload) => {
  console.log('[SW v11.8.0] 📨 Mensagem recebida:', payload);
  
  // ✅ EXTRAÇÃO DIRETA COM LOGS DETALHADOS
  const title = payload.notification?.title || 'Projeto Rafael';
  const body = payload.notification?.body || 'Nova notificação';
  
  console.log('[SW v11.8.0] 📋 Título extraído:', title);
  console.log('[SW v11.8.0] 📋 Corpo extraído:', body);
  console.log('[SW v11.8.0] 📋 Payload completo:', JSON.stringify(payload, null, 2));
  
  // ✅ MOSTRAR NOTIFICAÇÃO
  return self.registration.showNotification(title, {
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
  });
});

// ✅ EVENTOS DO SW
self.addEventListener('install', (event) => {
  console.log('[SW v11.8.0] 🔧 Service Worker instalado - Versão Firebase 11.8.0');
  self.skipWaiting(); // Forçar ativação imediata
});

self.addEventListener('activate', (event) => {
  console.log('[SW v11.8.0] ✅ Service Worker ativado - Versão Firebase 11.8.0');
  // Limpar caches antigos
  event.waitUntil(
    Promise.all([
      clients.claim(),
      // Limpar caches antigos se existirem
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName.startsWith('projeto-rafael-')) {
              console.log('[SW v11.8.0] 🧹 Limpando cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
});

// ✅ CLICK HANDLER MELHORADO
self.addEventListener('notificationclick', (event) => {
  console.log('[SW v11.8.0] 🖱️ Notificação clicada - Ação:', event.action);
  event.notification.close();
  
  let targetUrl = '/customer/dashboard';
  
  // Determinar URL baseado na ação ou dados
  if (event.action === 'view' && event.notification.data) {
    if (event.notification.data.link) {
      targetUrl = event.notification.data.link;
    } else if (event.notification.data.orderId) {
      targetUrl = `/customer/orders/${event.notification.data.orderId}`;
    } else if (event.notification.data.chatId) {
      targetUrl = `/customer/chat/${event.notification.data.chatId}`;
    }
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Se já tem uma janela aberta, focar nela
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus().then(() => {
            return client.navigate(targetUrl);
          });
        }
      }
      // Se não tem janela aberta, abrir uma nova
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// ✅ PUSH EVENT HANDLER (para garantir que funcione mesmo sem onBackgroundMessage)
self.addEventListener('push', (event) => {
  console.log('[SW v11.8.0] 🔔 Push event recebido');
  
  if (!event.data) {
    console.log('[SW v11.8.0] ⚠️ Push sem dados');
    return;
  }
  
  try {
    const payload = event.data.json();
    console.log('[SW v11.8.0] 📦 Push payload:', payload);
    
    // Se onBackgroundMessage não processar, processar aqui
    if (payload.notification) {
      const title = payload.notification.title || 'Projeto Rafael';
      const body = payload.notification.body || 'Nova notificação';
      
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
    console.error('[SW v11.8.0] ❌ Erro ao processar push:', error);
  }
});

// ✅ DEBUG HANDLER
self.addEventListener('message', (event) => {
  if (event.data?.type === 'DEBUG_SW') {
    console.log('[SW v11.8.0] 🔍 Debug solicitado');
    event.ports[0]?.postMessage({
      status: 'ok',
      version: 'v11.8.0-firebase',
      firebase: '11.8.0',
      timestamp: new Date().toISOString()
    });
  }
  
  // Forçar atualização do SW se solicitado
  if (event.data?.type === 'SKIP_WAITING') {
    console.log('[SW v11.8.0] ⏩ Skip waiting solicitado');
    self.skipWaiting();
  }
});

console.log('[SW v11.8.0] 📍 Service Worker carregado - Firebase 11.8.0');