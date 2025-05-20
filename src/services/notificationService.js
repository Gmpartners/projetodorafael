// Serviço para gerenciar push notifications
// Em um ambiente real, isso se conectaria com um serviço de push notifications

// Mock de dados para desenvolvimento
const mockNotifications = [
  {
    id: 'pn_1',
    title: 'Seu pedido foi enviado!',
    body: 'O pedido #8452 foi enviado e chegará em breve.',
    type: 'order_update',
    status: 'sent',
    sentAt: '2025-05-18T14:30:00Z',
    readAt: '2025-05-18T14:35:00Z',
    targetCustomer: {
      id: 'cust_1',
      name: 'João Silva',
      email: 'joao@exemplo.com'
    },
    metadata: {
      orderId: 'order_8452',
      deepLink: '/customer/orders/8452'
    }
  },
  {
    id: 'pn_2',
    title: 'Promoção exclusiva para você!',
    body: 'Aproveite 20% de desconto em todos os produtos até domingo.',
    type: 'promotion',
    status: 'sent',
    sentAt: '2025-05-17T10:00:00Z',
    readAt: null,
    targetSegment: 'all_customers',
    metadata: {
      promotionId: 'promo_123',
      deepLink: '/customer/promotions/123'
    }
  },
  {
    id: 'pn_3',
    title: 'Confirme a entrega do seu pedido',
    body: 'Seu pedido #8449 foi entregue? Confirme o recebimento.',
    type: 'order_confirmation',
    status: 'sent',
    sentAt: '2025-05-16T09:15:00Z',
    readAt: '2025-05-16T12:20:00Z',
    targetCustomer: {
      id: 'cust_2',
      name: 'Maria Oliveira',
      email: 'maria@exemplo.com'
    },
    metadata: {
      orderId: 'order_8449',
      deepLink: '/customer/orders/8449'
    }
  },
  {
    id: 'pn_4',
    title: 'Novos produtos disponíveis',
    body: 'Acabamos de receber novos produtos na categoria Eletrônicos.',
    type: 'news',
    status: 'scheduled',
    scheduledFor: '2025-05-25T09:00:00Z',
    targetSegment: 'electronics_customers',
    metadata: {
      categoryId: 'cat_electronics',
      deepLink: '/customer/categories/electronics'
    }
  },
  {
    id: 'pn_5',
    title: 'Avalie sua experiência de compra',
    body: 'Conte-nos o que achou da sua compra recente.',
    type: 'feedback',
    status: 'draft',
    targetSegment: 'recent_customers',
    metadata: {
      surveyId: 'survey_123',
      deepLink: '/customer/surveys/123'
    }
  }
];

// Estatísticas simuladas
const mockStats = {
  total: 45,
  sent: 38,
  scheduled: 4,
  draft: 3,
  read: 27,
  clicked: 18,
  conversionRate: 14.5
};

// Tipos de notificação disponíveis
export const notificationTypes = [
  { id: 'order_update', name: 'Atualização de Pedido', icon: 'package' },
  { id: 'order_confirmation', name: 'Confirmação de Pedido', icon: 'check-circle' },
  { id: 'promotion', name: 'Promoção', icon: 'tag' },
  { id: 'news', name: 'Novidades', icon: 'bell' },
  { id: 'feedback', name: 'Avaliação', icon: 'star' },
  { id: 'custom', name: 'Personalizada', icon: 'message-square' }
];

// Segmentos de clientes disponíveis
export const customerSegments = [
  { id: 'all_customers', name: 'Todos os clientes' },
  { id: 'recent_customers', name: 'Clientes recentes (30 dias)' },
  { id: 'inactive_customers', name: 'Clientes inativos (90+ dias)' },
  { id: 'high_value_customers', name: 'Clientes de alto valor' },
  { id: 'electronics_customers', name: 'Compradores de Eletrônicos' },
  { id: 'clothing_customers', name: 'Compradores de Vestuário' }
];

// Função para buscar notificações
export const fetchNotifications = async (filters = {}) => {
  // Simular atraso de rede
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Filtrar notificações com base nos critérios
  let filteredNotifications = [...mockNotifications];
  
  if (filters.status) {
    filteredNotifications = filteredNotifications.filter(n => n.status === filters.status);
  }
  
  if (filters.type) {
    filteredNotifications = filteredNotifications.filter(n => n.type === filters.type);
  }
  
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filteredNotifications = filteredNotifications.filter(n => 
      n.title.toLowerCase().includes(searchLower) || 
      n.body.toLowerCase().includes(searchLower) ||
      (n.targetCustomer?.name && n.targetCustomer.name.toLowerCase().includes(searchLower))
    );
  }
  
  // Ordenar notificações (padrão: mais recentes primeiro)
  filteredNotifications.sort((a, b) => {
    const dateA = a.sentAt ? new Date(a.sentAt) : a.scheduledFor ? new Date(a.scheduledFor) : new Date();
    const dateB = b.sentAt ? new Date(b.sentAt) : b.scheduledFor ? new Date(b.scheduledFor) : new Date();
    return dateB - dateA;
  });
  
  return {
    notifications: filteredNotifications,
    total: filteredNotifications.length
  };
};

// Função para obter estatísticas
export const fetchNotificationStats = async () => {
  // Simular atraso de rede
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return mockStats;
};

// Função para buscar uma notificação específica
export const fetchNotificationById = async (id) => {
  // Simular atraso de rede
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const notification = mockNotifications.find(n => n.id === id);
  if (!notification) {
    throw new Error('Notificação não encontrada');
  }
  
  return notification;
};

// Função para criar uma nova notificação
export const createNotification = async (notificationData) => {
  // Simular atraso de rede
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Criar nova notificação com ID gerado
  const newNotification = {
    id: `pn_${Date.now()}`,
    ...notificationData,
    status: notificationData.scheduledFor ? 'scheduled' : notificationData.status || 'draft',
    createdAt: new Date().toISOString()
  };
  
  // Adicionar à lista (em um cenário real, seria adicionado a um banco de dados)
  mockNotifications.unshift(newNotification);
  
  return newNotification;
};

// Função para atualizar uma notificação existente
export const updateNotification = async (id, notificationData) => {
  // Simular atraso de rede
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = mockNotifications.findIndex(n => n.id === id);
  if (index === -1) {
    throw new Error('Notificação não encontrada');
  }
  
  // Atualizar notificação
  const updatedNotification = {
    ...mockNotifications[index],
    ...notificationData,
    updatedAt: new Date().toISOString()
  };
  
  mockNotifications[index] = updatedNotification;
  
  return updatedNotification;
};

// Função para enviar uma notificação
export const sendNotification = async (id) => {
  // Simular atraso de rede
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const index = mockNotifications.findIndex(n => n.id === id);
  if (index === -1) {
    throw new Error('Notificação não encontrada');
  }
  
  // Atualizar status da notificação
  mockNotifications[index] = {
    ...mockNotifications[index],
    status: 'sent',
    sentAt: new Date().toISOString()
  };
  
  return mockNotifications[index];
};

// Função para excluir uma notificação
export const deleteNotification = async (id) => {
  // Simular atraso de rede
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const index = mockNotifications.findIndex(n => n.id === id);
  if (index === -1) {
    throw new Error('Notificação não encontrada');
  }
  
  // Remover notificação
  mockNotifications.splice(index, 1);
  
  return { success: true, id };
};

// Buscar clientes (para seleção ao criar notificações)
export const fetchCustomers = async (search = '') => {
  // Simular atraso de rede
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Lista simulada de clientes
  const customers = [
    { id: 'cust_1', name: 'João Silva', email: 'joao@exemplo.com' },
    { id: 'cust_2', name: 'Maria Oliveira', email: 'maria@exemplo.com' },
    { id: 'cust_3', name: 'Carlos Santos', email: 'carlos@exemplo.com' },
    { id: 'cust_4', name: 'Ana Pereira', email: 'ana@exemplo.com' },
    { id: 'cust_5', name: 'Roberto Lima', email: 'roberto@exemplo.com' }
  ];
  
  // Filtrar clientes com base na busca
  if (search) {
    const searchLower = search.toLowerCase();
    return customers.filter(c => 
      c.name.toLowerCase().includes(searchLower) || 
      c.email.toLowerCase().includes(searchLower)
    );
  }
  
  return customers;
};