// 🚀 SERVICE WORKER ENHANCED - PWA com Botões Personalizados
// Versão 6.0 - Suporte completo a botões e actions

importScripts('https://www.gstatic.com/firebasejs/11.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.8.0/firebase-messaging-compat.js');

const SW_VERSION = 'v6.0.0-enhanced-buttons';

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

// 🎯 INTERCEPTAR PUSH MESSAGES DIRETAMENTE
self.addEventListener('push', event => {
  console.log(`[SW ${SW_VERSION}] 📨 PUSH RECEBIDO:`, event);
  
  if (!event.data) {
    console.warn(`[SW ${SW_VERSION}] ⚠️ Push sem data`);
    return;
  }

  try {
    const payload = event.data.json();
    console.log(`[SW ${SW_VERSION}] 📋 PAYLOAD COMPLETO:`, JSON.stringify(payload, null, 2));
    
    // Extrair dados do payload
    const data = payload.data || {};
    
    // 🎯 TÍTULO E CORPO
    const title = payload.notification?.title || data.title || 'Nova notificação';
    const body = payload.notification?.body || data.body || 'Você tem uma nova atualização';
    
    // 🎨 LOGO PERSONALIZADO (PRIORIDADE)
    let customIcon = null;
    
    console.log(`[SW ${SW_VERSION}] 🔍 Buscando logo personalizado...`);
    console.log(`[SW ${SW_VERSION}] - data.icon:`, data.icon);
    console.log(`[SW ${SW_VERSION}] - data.logoUrl:`, data.logoUrl);
    
    if (data.icon && data.icon.includes('firebasestorage.googleapis.com')) {
      customIcon = data.icon;
      console.log(`[SW ${SW_VERSION}] ✅ LOGO ENCONTRADO:`, customIcon.substring(0, 80) + '...');
    } else if (data.logoUrl && data.logoUrl.includes('firebasestorage.googleapis.com')) {
      customIcon = data.logoUrl;
      console.log(`[SW ${SW_VERSION}] ✅ LOGO ENCONTRADO (logoUrl):`, customIcon.substring(0, 80) + '...');
    } else {
      console.log(`[SW ${SW_VERSION}] ⚠️ NENHUM LOGO PERSONALIZADO - usando padrão`);
    }
    
    // 📸 IMAGEM GRANDE PERSONALIZADA
    let customImage = null;
    
    if (data.image && data.image.includes('firebasestorage.googleapis.com')) {
      customImage = data.image;
      console.log(`[SW ${SW_VERSION}] ✅ IMAGEM ENCONTRADA:`, customImage.substring(0, 80) + '...');
    } else if (data.imageUrl && data.imageUrl.includes('firebasestorage.googleapis.com')) {
      customImage = data.imageUrl;
      console.log(`[SW ${SW_VERSION}] ✅ IMAGEM ENCONTRADA (imageUrl):`, customImage.substring(0, 80) + '...');
    }
    
    // 🔘 BOTÕES PERSONALIZADOS
    let actions = [];
    if (data.actions) {
      try {
        actions = typeof data.actions === 'string' ? JSON.parse(data.actions) : data.actions;
        console.log(`[SW ${SW_VERSION}] 🎯 ${actions.length} botões encontrados:`, actions);
      } catch (e) {
        console.warn(`[SW ${SW_VERSION}] ⚠️ Erro ao parsear actions:`, e);
        actions = [];
      }
    }
    
    // 🎯 ACTIONS PADRÃO se não houver customizadas
    if (actions.length === 0) {
      actions = getDefaultActions(data);
      console.log(`[SW ${SW_VERSION}] 🔧 Usando actions padrão:`, actions);
    }
    
    // 🔗 LINK PERSONALIZADO
    const customLink = data.link || data.click_action || '/';
    console.log(`[SW ${SW_VERSION}] 🔗 Link:`, customLink);
    
    // 📱 CONSTRUIR NOTIFICAÇÃO
    const notificationOptions = {
      body: body,
      icon: customIcon || 'https://projeto-rafael-53f73.web.app/vite.svg',
      badge: data.badge || data.faviconUrl || customIcon || '/vite.svg',
      
      // 🔥 BOTÕES PERSONALIZADOS
      actions: actions,
      
      // ⚙️ CONFIGURAÇÕES AVANÇADAS
      requireInteraction: true,  // Fica na tela até clicar
      silent: false,
      vibrate: [200, 100, 200],
      timestamp: Date.now(),
      renotify: true,
      
      // 🎯 Tag para agrupamento
      tag: `${data.type || 'general'}_${data.storeId || 'default'}_${Date.now()}`,
      
      // 📋 Dados para click handling
      data: {
        url: customLink,
        storeId: data.storeId,
        orderId: data.orderId,
        chatId: data.chatId,
        type: data.type || 'general',
        storeName: data.storeName || 'Loja',
        timestamp: data.timestamp,
        ...data
      }
    };
    
    // 📸 ADICIONAR IMAGEM GRANDE
    if (customImage) {
      notificationOptions.image = customImage;
      console.log(`[SW ${SW_VERSION}] 🎨 IMAGEM GRANDE ADICIONADA`);
    }
    
    // 🎨 COR DE FUNDO (alguns browsers suportam)
    if (data.primaryColor) {
      notificationOptions.backgroundColor = data.primaryColor;
    }
    
    console.log(`[SW ${SW_VERSION}] 🚀 EXIBINDO NOTIFICAÇÃO:`, {
      title,
      hasCustomIcon: !!customIcon,
      hasCustomImage: !!customImage,
      actionsCount: actions.length,
      finalIcon: notificationOptions.icon
    });
    
    event.waitUntil(
      self.registration.showNotification(title, notificationOptions)
    );
    
  } catch (error) {
    console.error(`[SW ${SW_VERSION}] ❌ ERRO:`, error);
    
    // Fallback - notificação básica
    event.waitUntil(
      self.registration.showNotification('Nova notificação', {
        body: 'Você recebeu uma nova notificação',
        icon: '/vite.svg',
        badge: '/vite.svg'
      })
    );
  }
});

// 🎯 CLICK HANDLER - Lidar com cliques em botões
self.addEventListener('notificationclick', event => {
  console.log(`[SW ${SW_VERSION}] 👆 CLIQUE:`, event);
  
  event.notification.close();
  
  const data = event.notification.data || {};
  const action = event.action;
  
  console.log(`[SW ${SW_VERSION}] 🎯 Action:`, action, 'Data:', data);
  
  let targetUrl = data.url || '/';
  
  // 🔄 Roteamento baseado na action
  switch (action) {
    case 'view_order':
      targetUrl = data.orderId ? `/customer/order/${data.orderId}` : '/customer/orders';
      break;
      
    case 'track_order':
      targetUrl = data.orderId ? `/customer/track/${data.orderId}` : '/customer/orders';
      break;
      
    case 'reply_chat':
    case 'view_chat':
      targetUrl = data.chatId ? `/customer/chat/${data.chatId}` : `/customer/order/${data.orderId}/chat`;
      break;
      
    case 'contact_store':
      targetUrl = data.storeId ? `/customer/store/${data.storeId}/contact` : '/customer/contact';
      break;
      
    case 'view_progress':
      targetUrl = data.orderId ? `/customer/order/${data.orderId}/progress` : '/customer/orders';
      break;
      
    case 'open_dashboard':
    case 'open_store':
      targetUrl = '/customer/dashboard';
      break;
      
    case 'view_offer':
      targetUrl = '/customer/offers';
      break;
      
    case 'shop_now':
      targetUrl = data.storeId ? `/customer/store/${data.storeId}/products` : '/customer/products';
      break;
      
    case 'view_notifications':
      targetUrl = '/customer/notifications';
      break;
      
    case 'view_products':
      targetUrl = '/customer/products';
      break;
      
    case 'view_store':
      targetUrl = '/customer/dashboard';
      break;
      
    case 'test_feature':
      targetUrl = '/customer/dashboard?test=true';
      break;
      
    default:
      // Clique no corpo da notificação (sem action)
      targetUrl = data.url || '/customer/dashboard';
  }
  
  console.log(`[SW ${SW_VERSION}] 🌐 NAVEGANDO PARA:`, targetUrl);
  
  // 📱 Abrir/focar janela
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // Procurar janela já aberta
        for (const client of clientList) {
          if (client.url && 'focus' in client) {
            client.navigate(targetUrl);
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

// 🎯 ACTIONS PADRÃO baseadas no tipo de notificação
function getDefaultActions(data) {
  const storeName = data.storeName || 'Loja';
  
  // Actions baseadas no tipo
  switch (data.type) {
    case 'order_status':
      return [
        {
          action: 'view_order',
          title: '📦 Ver Pedido'
        },
        {
          action: 'track_order',
          title: '🚚 Rastrear'
        }
      ];
      
    case 'chat_message':
      return [
        {
          action: 'reply_chat',
          title: '💬 Responder'
        },
        {
          action: 'view_chat',
          title: '👁️ Ver Conversa'
        }
      ];
      
    case 'custom_step':
      return [
        {
          action: 'view_progress',
          title: '📊 Ver Progresso'
        },
        {
          action: 'view_order',
          title: '📦 Ver Pedido'
        }
      ];
      
    case 'test':
    case 'custom':
    case 'custom_buttons':
      return [
        {
          action: 'open_dashboard',
          title: `🏪 Abrir ${storeName}`
        },
        {
          action: 'view_notifications',
          title: '🔔 Ver Notificações'
        }
      ];
      
    default:
      return [
        {
          action: 'open_dashboard',
          title: `🏪 Abrir ${storeName}`
        }
      ];
  }
}

// ✅ INSTALL & ACTIVATE
self.addEventListener('install', event => {
  console.log(`[SW ${SW_VERSION}] 🔧 INSTALANDO - Enhanced Buttons`);
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log(`[SW ${SW_VERSION}] ✅ ATIVADO - Enhanced Buttons`);
  event.waitUntil(
    Promise.all([
      clients.claim(),
      // Limpar caches antigos
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      })
    ])
  );
});

console.log(`[SW ${SW_VERSION}] 📍 SERVICE WORKER ENHANCED CARREGADO`);

// 🆕 FALLBACK: Também registrar o messaging handler
messaging.onBackgroundMessage((payload) => {
  console.log(`[SW ${SW_VERSION}] 📨 FALLBACK messaging handler:`, payload);
  // Este será chamado apenas se o listener de 'push' não funcionar
});