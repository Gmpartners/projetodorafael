# 🔄 TESTE DE ALTERNÂNCIA DE USUÁRIOS

## ✅ **CORREÇÃO APLICADA - SISTEMA DE TROCA DE USUÁRIOS**

Agora o sistema permite **alternar entre usuários** no mesmo navegador sem problemas!

## 🎯 **TESTE PASSO A PASSO:**

### **1. Estado Inicial:**
- Acesse: `http://localhost:5173/login`
- **Deve mostrar:** Tela de login limpa

### **2. Login como CUSTOMER:**
1. Clique em **"👤 Login como CUSTOMER"**
2. **Console deve mostrar:**
   ```
   👤 Login rápido como customer
   🔐 Tentando login: maria.customer@teste.com
   ⚡ Definindo perfil de teste imediatamente
   ✅ Login bem-sucedido, redirecionando...
   👤 Redirecionando para customer dashboard
   ```
3. **Vai para:** `/customer/dashboard` (Maria Silva)

### **3. Logout do CUSTOMER:**
1. **No dashboard customer:** Clique no ícone 🚪 (vermelho) no header
2. **Console deve mostrar:**
   ```
   🚪 Fazendo logout...
   🧹 Estado de autenticação completamente limpo
   ✅ Logout completo - pronto para novo login
   ```
3. **Vai para:** `/login` LIMPO

### **4. Login como LOJA:**
1. **Na tela de login:** Clique em **"🏪 Login como LOJA"**
2. **Console deve mostrar:**
   ```
   🏪 Login rápido como loja
   🔐 Tentando login: teste@loja.com
   ⚡ Definindo perfil de teste imediatamente
   🏪 Redirecionando para store dashboard
   ```
3. **Vai para:** `/store/dashboard` (Loja)

### **5. Voltar para Login (sem logout):**
1. **Na barra de endereços:** Digite `http://localhost:5173/login`
2. **Deve mostrar:** Tela de login COM aviso de usuário logado
3. **Card amarelo** mostrando: "Usuário atual: Loja Teste Rafael"
4. **Botões:** "Dashboard" e "Logout"

### **6. Alternar Usuário:**
1. **Na tela de login com aviso:** Clique em **"Logout"**
2. **Deve limpar** o aviso e mostrar tela limpa
3. **Clique:** "👤 Login como CUSTOMER"
4. **Deve ir** para dashboard do customer

## 🔍 **Verificações:**

### **✅ Deve Funcionar:**
- Logout completo limpa tudo
- Pode acessar `/login` mesmo logado
- Alterna entre usuários sem problemas
- Não redireciona automaticamente
- Console mostra logs claros

### **❌ NÃO deve acontecer:**
- Redirecionamento automático após logout
- Ficar "preso" em um dashboard
- Não conseguir trocar de usuário
- Página de login redirecionar sozinha

## 🐛 **Se der problema:**

### **Force Refresh Total:**
```
Ctrl + Shift + R + F5 (ou Cmd + Shift + R no Mac)
```

### **Limpar TUDO:**
1. F12 → Console:
```javascript
// Limpar completamente
localStorage.clear();
sessionStorage.clear();
window.location.href = '/login';
```

## 🎉 **Resultado Esperado:**

Você deve conseguir fazer este fluxo quantas vezes quiser:
```
Login Customer → Dashboard Customer → Logout → 
Login Loja → Dashboard Loja → Logout → 
Login Customer → etc...
```

**Sem nenhum redirecionamento forçado ou loop!**