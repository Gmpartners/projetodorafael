import re

# Ler o arquivo
with open('src/services/apiService.js', 'r') as f:
    content = f.read()

# Padrão para encontrar o método sendCustomWebPushWithUrl
pattern = r'(async sendCustomWebPushWithUrl\(.*?\) \{[^}]*\}),?'

# Novo método
new_method = '''async sendCustomWebPushWithUrl(notificationData, customUrl, targetUserId = null) {
    // v7.1: Usar a API de notificações modificada (SEM BRANDING AUTOMÁTICO)
    const response = await api.post('/notifications/sendImmediateNotification', {
      ...notificationData,
      target: targetUserId ? 'user' : 'subscribers',
      targetId: targetUserId,
      data: {
        ...(notificationData.data || {}),
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

print("✅ Método sendCustomWebPushWithUrl atualizado para v7.1!")
