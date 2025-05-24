// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

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

// Handler para mensagens em background
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Mensagem recebida em background:', payload);
  
  const notificationTitle = payload.notification?.title || 'Projeto Rafael';
  const notificationOptions = {
    body: payload.notification?.body || 'Nova notificação',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: payload.data?.type || 'default',
    data: payload.data || {},
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: 'Ver detalhes'
      },
      {
        action: 'close',
        title: 'Fechar'
      }
    ]
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notificação clicada:', event);
  
  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }
  
  // Determinar URL baseado no tipo de notificação
  const data = event.notification.data;
  let url = '/';
  
  if (data?.type) {
    switch (data.type) {
      case 'order_status':
        url = `/customer/orders/${data.orderId}`;
        break;
      case 'chat_message':
        url = `/customer/chat/${data.chatId}`;
        break;
      case 'store_order':
        url = `/store/orders/${data.orderId}`;
        break;
      case 'store_chat':
        url = `/store/chats`;
        break;
      default:
        url = data.link || '/';
    }
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Tentar focar janela existente
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Abrir nova janela se não encontrar
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Instalação e ativação
self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker instalado');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker ativado');
  event.waitUntil(clients.claim());
});