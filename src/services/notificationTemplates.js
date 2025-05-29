// src/services/notificationTemplates.js - Sistema de Templates v7.0
import apiService from './apiService';

class NotificationTemplates {
  constructor() {
    this.version = 'v7.0.0-templates';
    this.baseUrl = 'https://projeto-rafael-53f73.web.app';
  }

  /**
   * 🎯 Obter template por tipo de notificação
   */
  getTemplate(type, data = {}) {
    const templates = {
      order_status: this.getOrderStatusTemplate(data),
      chat_message: this.getChatMessageTemplate(data),
      custom_step: this.getCustomStepTemplate(data),
      promotion: this.getPromotionTemplate(data),
      news: this.getNewsTemplate(data),
      feedback: this.getFeedbackTemplate(data),
      delivery: this.getDeliveryTemplate(data),
      payment: this.getPaymentTemplate(data),
      stock: this.getStockTemplate(data),
      welcome: this.getWelcomeTemplate(data),
      custom: this.getCustomTemplate(data)
    };

    return templates[type] || templates.custom;
  }

  /**
   * 📦 Template para Status de Pedido
   */
  getOrderStatusTemplate(data = {}) {
    const { orderId, status, customerName, storeName } = data;
    
    const statusMessages = {
      pending: {
        title: '⏳ Pedido Recebido!',
        body: `Olá ${customerName || 'Cliente'}! Seu pedido #${orderId || 'XXX'} foi recebido e está sendo processado.`,
        icon: '⏳'
      },
      processing: {
        title: '🔄 Preparando seu Pedido',
        body: `Seu pedido #${orderId || 'XXX'} está sendo separado com muito cuidado.`,
        icon: '🔄'
      },
      shipped: {
        title: '🚚 Pedido Enviado!',
        body: `Boa notícia! Seu pedido #${orderId || 'XXX'} saiu para entrega.`,
        icon: '🚚'
      },
      delivered: {
        title: '✅ Pedido Entregue!',
        body: `Seu pedido #${orderId || 'XXX'} foi entregue com sucesso!`,
        icon: '✅'
      }
    };

    const statusData = statusMessages[status] || statusMessages.processing;

    return {
      title: statusData.title,
      body: statusData.body,
      icon: statusData.icon,
      customUrl: `${this.baseUrl}/customer/orders/${orderId}`,
      actions: [
        { action: 'view_order', title: '📦 Ver Pedido' },
        { action: 'track_order', title: '🚚 Rastrear' }
      ],
      data: {
        type: 'order_status',
        orderId,
        status,
        customerName,
        storeName
      }
    };
  }

  /**
   * 💬 Template para Mensagem de Chat
   */
  getChatMessageTemplate(data = {}) {
    const { chatId, senderName, message, storeName } = data;
    
    return {
      title: `💬 ${senderName || storeName || 'Nova mensagem'}`,
      body: message || 'Você recebeu uma nova mensagem sobre seu pedido.',
      icon: '💬',
      customUrl: `${this.baseUrl}/customer/chat/${chatId}`,
      actions: [
        { action: 'reply_chat', title: '💬 Responder' },
        { action: 'view_chat', title: '👁️ Ver Chat' }
      ],
      data: {
        type: 'chat_message',
        chatId,
        senderName,
        storeName
      }
    };
  }

  /**
   * 📊 Template para Etapa Personalizada
   */
  getCustomStepTemplate(data = {}) {
    const { orderId, stepName, stepDescription, progress } = data;
    
    return {
      title: `📊 ${stepName || 'Nova Etapa'}`,
      body: stepDescription || `Seu pedido #${orderId || 'XXX'} avançou para uma nova etapa!`,
      icon: '📊',
      customUrl: `${this.baseUrl}/customer/orders/${orderId}/progress`,
      actions: [
        { action: 'view_progress', title: '📊 Ver Progresso' },
        { action: 'view_details', title: '📋 Detalhes' }
      ],
      data: {
        type: 'custom_step',
        orderId,
        stepName,
        progress: progress || 0
      }
    };
  }

  /**
   * 🎁 Template para Promoção
   */
  getPromotionTemplate(data = {}) {
    const { title, discount, productName, validUntil, promoCode } = data;
    
    return {
      title: title || '🎁 Oferta Especial!',
      body: `${discount || '50%'} OFF ${productName ? `em ${productName}` : 'em produtos selecionados'}! ${promoCode ? `Use: ${promoCode}` : ''}`,
      icon: '🎁',
      customUrl: `${this.baseUrl}/customer/offers`,
      actions: [
        { action: 'view_offer', title: '🛍️ Ver Oferta' },
        { action: 'shop_now', title: '🛒 Comprar' }
      ],
      data: {
        type: 'promotion',
        discount,
        promoCode,
        validUntil
      }
    };
  }

  /**
   * 📢 Template para Novidades
   */
  getNewsTemplate(data = {}) {
    const { title, content, category } = data;
    
    return {
      title: title || '📢 Novidades na Loja!',
      body: content || 'Confira as últimas novidades e lançamentos.',
      icon: '📢',
      customUrl: `${this.baseUrl}/customer/news`,
      actions: [
        { action: 'read_more', title: '📖 Ler Mais' },
        { action: 'share', title: '🔗 Compartilhar' }
      ],
      data: {
        type: 'news',
        category
      }
    };
  }

  /**
   * ⭐ Template para Feedback
   */
  getFeedbackTemplate(data = {}) {
    const { orderId, productName, customerName } = data;
    
    return {
      title: '⭐ Como foi sua experiência?',
      body: `Olá ${customerName || 'Cliente'}! Gostaríamos de saber sua opinião sobre ${productName || 'sua compra'}.`,
      icon: '⭐',
      customUrl: `${this.baseUrl}/customer/feedback`,
      actions: [
        { action: 'rate_now', title: '⭐ Avaliar' },
        { action: 'write_review', title: '✍️ Comentar' }
      ],
      data: {
        type: 'feedback',
        orderId,
        productName
      }
    };
  }

  /**
   * 🚚 Template para Entrega
   */
  getDeliveryTemplate(data = {}) {
    const { orderId, estimatedTime, driverName, trackingCode } = data;
    
    return {
      title: '🚚 Saiu para Entrega!',
      body: `Seu pedido #${orderId || 'XXX'} está a caminho! ${estimatedTime ? `Previsão: ${estimatedTime}` : ''}`,
      icon: '🚚',
      customUrl: `${this.baseUrl}/customer/orders/${orderId}/tracking`,
      actions: [
        { action: 'track_delivery', title: '📍 Rastrear' },
        { action: 'contact_driver', title: '📞 Contatar' }
      ],
      data: {
        type: 'delivery',
        orderId,
        trackingCode,
        driverName
      }
    };
  }

  /**
   * 💳 Template para Pagamento
   */
  getPaymentTemplate(data = {}) {
    const { orderId, status, amount, method } = data;
    
    const paymentMessages = {
      approved: {
        title: '✅ Pagamento Aprovado!',
        body: `Pagamento de R$ ${amount || '0,00'} aprovado para o pedido #${orderId || 'XXX'}.`
      },
      pending: {
        title: '⏳ Aguardando Pagamento',
        body: `Confirmação de pagamento pendente para o pedido #${orderId || 'XXX'}.`
      },
      rejected: {
        title: '❌ Pagamento Rejeitado',
        body: `Houve um problema com o pagamento do pedido #${orderId || 'XXX'}.`
      }
    };

    const paymentData = paymentMessages[status] || paymentMessages.pending;

    return {
      title: paymentData.title,
      body: paymentData.body,
      icon: status === 'approved' ? '✅' : status === 'rejected' ? '❌' : '⏳',
      customUrl: `${this.baseUrl}/customer/orders/${orderId}/payment`,
      actions: [
        { action: 'view_payment', title: '💳 Ver Pagamento' },
        { action: 'view_order', title: '📦 Ver Pedido' }
      ],
      data: {
        type: 'payment',
        orderId,
        status,
        amount,
        method
      }
    };
  }

  /**
   * 📦 Template para Estoque
   */
  getStockTemplate(data = {}) {
    const { productName, status, quantity } = data;
    
    const stockMessages = {
      low: {
        title: '⚠️ Estoque Baixo',
        body: `Apenas ${quantity || 'poucas'} unidades restantes de ${productName || 'produto'}!`
      },
      restock: {
        title: '📦 Produto Reabastecido',
        body: `${productName || 'Produto'} está disponível novamente!`
      },
      out: {
        title: '❌ Produto Esgotado',
        body: `${productName || 'Produto'} está temporariamente esgotado.`
      }
    };

    const stockData = stockMessages[status] || stockMessages.low;

    return {
      title: stockData.title,
      body: stockData.body,
      icon: status === 'restock' ? '📦' : status === 'out' ? '❌' : '⚠️',
      customUrl: `${this.baseUrl}/customer/products`,
      actions: [
        { action: 'view_product', title: '👁️ Ver Produto' },
        { action: 'notify_restock', title: '🔔 Avisar Quando Chegar' }
      ],
      data: {
        type: 'stock',
        productName,
        status,
        quantity
      }
    };
  }

  /**
   * 👋 Template para Boas-vindas
   */
  getWelcomeTemplate(data = {}) {
    const { customerName, storeName, discount } = data;
    
    return {
      title: `👋 Bem-vindo${customerName ? `, ${customerName}` : ''}!`,
      body: `Obrigado por se cadastrar${storeName ? ` na ${storeName}` : ''}! ${discount ? `Ganhe ${discount}% na primeira compra.` : ''}`,
      icon: '👋',
      customUrl: `${this.baseUrl}/customer/dashboard`,
      actions: [
        { action: 'start_shopping', title: '🛍️ Começar a Comprar' },
        { action: 'view_offers', title: '🎁 Ver Ofertas' }
      ],
      data: {
        type: 'welcome',
        customerName,
        storeName
      }
    };
  }

  /**
   * 💬 Template Personalizado
   */
  getCustomTemplate(data = {}) {
    const { title, body, customUrl, actions } = data;
    
    return {
      title: title || '📱 Nova Notificação',
      body: body || 'Você tem uma nova notificação.',
      icon: '📱',
      customUrl: customUrl || `${this.baseUrl}/customer/dashboard`,
      actions: actions || [
        { action: 'open_app', title: '📱 Abrir App' },
        { action: 'view_details', title: '👁️ Ver Detalhes' }
      ],
      data: {
        type: 'custom',
        ...data
      }
    };
  }

  /**
   * 🏪 Templates por Tipo de Negócio
   */
  getBusinessTemplate(businessType, notificationType, data = {}) {
    const businessTemplates = {
      ecommerce: this.getEcommerceTemplates(),
      delivery: this.getDeliveryTemplates(),
      services: this.getServicesTemplates(),
      saas: this.getSaasTemplates()
    };

    const templates = businessTemplates[businessType] || businessTemplates.ecommerce;
    return templates[notificationType] || this.getTemplate(notificationType, data);
  }

  /**
   * 🛒 Templates para E-commerce
   */
  getEcommerceTemplates() {
    return {
      cart_abandonment: (data = {}) => ({
        title: '🛒 Esqueceu algo?',
        body: `Você tem ${data.itemCount || 'itens'} esperando no seu carrinho!`,
        customUrl: `${this.baseUrl}/customer/cart`,
        actions: [
          { action: 'complete_purchase', title: '💳 Finalizar Compra' },
          { action: 'view_cart', title: '🛒 Ver Carrinho' }
        ]
      }),
      
      price_drop: (data = {}) => ({
        title: '📉 Preço Caiu!',
        body: `${data.productName || 'Produto'} está ${data.discount || '20%'} mais barato!`,
        customUrl: `${this.baseUrl}/customer/products/${data.productId}`,
        actions: [
          { action: 'buy_now', title: '🛒 Comprar Agora' },
          { action: 'add_to_cart', title: '➕ Adicionar ao Carrinho' }
        ]
      }),

      wishlist_available: (data = {}) => ({
        title: '💖 Item da Lista Disponível!',
        body: `${data.productName || 'Produto da sua lista'} está disponível novamente!`,
        customUrl: `${this.baseUrl}/customer/wishlist`,
        actions: [
          { action: 'buy_now', title: '🛒 Comprar' },
          { action: 'view_product', title: '👁️ Ver Produto' }
        ]
      })
    };
  }

  /**
   * 🚚 Templates para Delivery
   */
  getDeliveryTemplates() {
    return {
      order_confirmed: (data = {}) => ({
        title: '✅ Pedido Confirmado!',
        body: `Seu pedido está sendo preparado. Tempo estimado: ${data.estimatedTime || '30 min'}.`,
        customUrl: `${this.baseUrl}/customer/orders/${data.orderId}/tracking`,
        actions: [
          { action: 'track_order', title: '📍 Acompanhar' },
          { action: 'contact_restaurant', title: '📞 Contatar' }
        ]
      }),

      driver_assigned: (data = {}) => ({
        title: '🏍️ Entregador a Caminho!',
        body: `${data.driverName || 'Entregador'} está indo buscar seu pedido.`,
        customUrl: `${this.baseUrl}/customer/orders/${data.orderId}/live-tracking`,
        actions: [
          { action: 'track_live', title: '📍 Rastreamento ao Vivo' },
          { action: 'contact_driver', title: '📞 Falar com Entregador' }
        ]
      })
    };
  }

  /**
   * 🔧 Templates para Serviços
   */
  getServicesTemplates() {
    return {
      appointment_confirmed: (data = {}) => ({
        title: '📅 Agendamento Confirmado',
        body: `Seu atendimento foi agendado para ${data.date || 'breve'}.`,
        customUrl: `${this.baseUrl}/customer/appointments/${data.appointmentId}`,
        actions: [
          { action: 'view_appointment', title: '📅 Ver Agendamento' },
          { action: 'reschedule', title: '🔄 Reagendar' }
        ]
      }),

      service_completed: (data = {}) => ({
        title: '✅ Serviço Concluído',
        body: `Seu ${data.serviceName || 'serviço'} foi finalizado com sucesso!`,
        customUrl: `${this.baseUrl}/customer/services/${data.serviceId}`,
        actions: [
          { action: 'rate_service', title: '⭐ Avaliar' },
          { action: 'book_again', title: '🔄 Agendar Novamente' }
        ]
      })
    };
  }

  /**
   * 💻 Templates para SaaS
   */
  getSaasTemplates() {
    return {
      trial_ending: (data = {}) => ({
        title: '⏰ Trial Expirando',
        body: `Seu período de teste expira em ${data.daysLeft || 'poucos'} dias.`,
        customUrl: `${this.baseUrl}/customer/billing`,
        actions: [
          { action: 'upgrade_now', title: '⬆️ Fazer Upgrade' },
          { action: 'extend_trial', title: '⏰ Estender Trial' }
        ]
      }),

      feature_update: (data = {}) => ({
        title: '🚀 Nova Funcionalidade!',
        body: `Confira a nova funcionalidade: ${data.featureName || 'atualização'}.`,
        customUrl: `${this.baseUrl}/customer/features`,
        actions: [
          { action: 'try_feature', title: '🧪 Experimentar' },
          { action: 'learn_more', title: '📖 Saber Mais' }
        ]
      })
    };
  }

  /**
   * 🎨 Personalizar template com dados da loja
   */
  customizeForStore(template, storeData = {}) {
    const { storeName, storeIcon, storeBadge, primaryColor, brandingSettings } = storeData;
    
    return {
      ...template,
      icon: storeIcon || template.icon,
      badge: storeBadge || template.badge,
      data: {
        ...template.data,
        storeName,
        primaryColor,
        brandingSettings
      }
    };
  }

  /**
   * 📊 Obter estatísticas de templates
   */
  getTemplateStats() {
    return {
      totalTemplates: 11,
      businessTypes: 4,
      categories: ['order', 'chat', 'promotion', 'delivery', 'payment', 'stock', 'feedback'],
      version: this.version
    };
  }

  /**
   * 🆕 Criar template dinâmico
   */
  createDynamicTemplate(config) {
    const {
      type,
      title,
      body,
      customUrl,
      actions = [],
      data = {},
      businessType = 'ecommerce'
    } = config;

    // Usar template base se existir
    const baseTemplate = this.getTemplate(type, data);
    
    return {
      ...baseTemplate,
      title: title || baseTemplate.title,
      body: body || baseTemplate.body,
      customUrl: customUrl || baseTemplate.customUrl,
      actions: actions.length > 0 ? actions : baseTemplate.actions,
      data: {
        ...baseTemplate.data,
        ...data,
        businessType,
        dynamic: true,
        createdAt: new Date().toISOString()
      }
    };
  }
}

// Exportar instância única
export default new NotificationTemplates();