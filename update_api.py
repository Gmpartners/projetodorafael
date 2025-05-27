import re

# Ler o arquivo original
with open('src/services/apiService.js', 'r') as f:
    content = f.read()

# Padrão para encontrar o método sendWebPushToStore
pattern = r'(async sendWebPushToStore\(.*?\) \{[^}]*\}),?'

# Novo método
new_method = '''async sendWebPushToStore(storeId, notification, customUrl = null) {
    // v7.1: Usar a API de notificações modificada (SEM BRANDING AUTOMÁTICO)
    const response = await api.post('/notifications/sendImmediateNotification', {
      ...notification,
      target: 'subscribers',
      data: {
        ...(notification.data || {}),
        link: customUrl
      }
    });
    return response.data;
  }'''

# Substituir
content_updated = re.sub(pattern, new_method + ',', content, flags=re.DOTALL)

# Salvar
with open('src/services/apiService.js', 'w') as f:
    f.write(content_updated)

print("✅ Método sendWebPushToStore atualizado para v7.1!")
