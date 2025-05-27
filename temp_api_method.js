  // 🆕 v7.1: Enviar para todos os inscritos da loja (SEM BRANDING AUTOMÁTICO)
  async sendWebPushToStore(storeId, notification, customUrl = null) {
    // Usar a API de notificações modificada (v7.1)
    const response = await api.post('/notifications/sendImmediateNotification', {
      ...notification,
      target: 'subscribers',
      data: {
        ...(notification.data || {}),
        link: customUrl
      }
    });
    return response.data;
  },