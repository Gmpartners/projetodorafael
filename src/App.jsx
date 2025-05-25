import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { CustomerChatProvider } from '@/contexts/CustomerChatContext';
import { StoreChatProvider } from '@/contexts/StoreChatContext';
import { registerServiceWorker } from '@/services/swRegistration';
import './index.css';

// Páginas de autenticação
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));

// Layout e componentes base
import MainLayout from './components/common/layout/MainLayout';

// Lazy loading para páginas principais
const CustomerDashboard = lazy(() => import('./pages/customer/CustomerDashboard'));
const OrderDetailsCustomer = lazy(() => import('./pages/customer/OrderDetailsCustomer'));
const StoreDashboard = lazy(() => import('./pages/store/StoreDashboard'));

// Novos componentes de chat
const ChatPage = lazy(() => import('./pages/customer/ChatPage'));
const ChatManagementPage = lazy(() => import('./pages/store/ChatManagementPage'));

// Novos componentes do customer portal
const ProfilePage = lazy(() => import('./pages/customer/ProfilePage'));
const SupportPage = lazy(() => import('./pages/customer/SupportPage'));
const FAQPage = lazy(() => import('./pages/customer/FAQPage'));

// Componentes de push notifications
const NotificationManagementPage = lazy(() => import('./pages/store/push-notifications/NotificationManagementPage'));

// Nova página de produtos
const ProductsManagementPage = lazy(() => import('./pages/store/ProductsManagementPage'));

// Componente de loading aprimorado
const LoadingFallback = () => (
  <div className="h-screen flex items-center justify-center bg-zinc-50">
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <div className="absolute inset-0 rounded-full border-2 border-purple-200"></div>
      </div>
      <div className="text-sm text-zinc-600 animate-pulse">Carregando...</div>
    </div>
  </div>
);

// Componente placeholder aprimorado para páginas ainda não implementadas
const PlaceholderPage = ({ title }) => {
  return (
    <div className="h-screen flex items-center justify-center bg-zinc-50">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-zinc-200">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">🚧</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">Rafael Portal</h1>
          <p className="text-zinc-600 mb-6">
            Página em construção: <span className="font-medium text-purple-600">{title}</span>
          </p>
          <div className="flex justify-center">
            <a 
              href="/login"
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
            >
              Voltar para Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// 🔥 NOVO: Componente para fornecer Chat Context baseado no role do usuário
const ChatContextProvider = ({ children }) => {
  const { userProfile } = useAuth();
  
  if (userProfile?.role === 'customer') {
    return (
      <CustomerChatProvider>
        {children}
      </CustomerChatProvider>
    );
  }
  
  if (userProfile?.role === 'store') {
    return (
      <StoreChatProvider>
        {children}
      </StoreChatProvider>
    );
  }
  
  // Se não tem role definido ainda, renderizar sem context de chat
  return children;
};

// Componente para proteger rotas autenticadas - SEM redirecionamento por role
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, userProfile, loading } = useAuth();

  console.log('🛡️ ProtectedRoute check:', { isAuthenticated, role: userProfile?.role, requiredRole, loading });

  if (loading) {
    return <LoadingFallback />;
  }

  if (!isAuthenticated) {
    console.log('❌ Não autenticado, redirecionando para login');
    return <Navigate to="/login" replace />;
  }

  // Se tem role requerido mas não corresponde, mostrar uma mensagem em vez de redirecionar
  if (requiredRole && userProfile?.role && userProfile.role !== requiredRole) {
    console.log('⚠️ Role incorreto:', userProfile.role, 'esperado:', requiredRole);
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-50">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-zinc-200 text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-xl font-bold text-zinc-900 mb-2">Acesso Negado</h1>
          <p className="text-zinc-600 mb-6">
            Esta página é para {requiredRole === 'store' ? 'lojistas' : 'clientes'}.<br/>
            Você está logado como {userProfile.role === 'store' ? 'lojista' : 'cliente'}.
          </p>
          <div className="flex gap-3 justify-center">
            <a 
              href={userProfile.role === 'store' ? '/store/dashboard' : '/customer/dashboard'}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
            >
              Ir para Meu Dashboard
            </a>
            <a 
              href="/login"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors shadow-sm"
            >
              Trocar Conta
            </a>
          </div>
        </div>
      </div>
    );
  }

  console.log('✅ Acesso permitido');
  return children;
};

// Componente para rotas públicas - SEMPRE permite acesso
const PublicRoute = ({ children }) => {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingFallback />;
  }

  return children;
};

function AppContent() {
  return (
    <Routes>
      {/* Rotas públicas - SEMPRE acessíveis */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } 
      />
      <Route 
        path="/register" 
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        } 
      />
      
      {/* Rotas de cliente - protegidas */}
      <Route 
        path="/customer/dashboard" 
        element={
          <ProtectedRoute requiredRole="customer">
            <CustomerDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/customer/orders" 
        element={
          <ProtectedRoute requiredRole="customer">
            <PlaceholderPage title="Pedidos do Cliente" />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/customer/orders/:orderId" 
        element={
          <ProtectedRoute requiredRole="customer">
            <OrderDetailsCustomer />
          </ProtectedRoute>
        } 
      />
      
      {/* Rotas atualizadas de chat do cliente */}
      <Route 
        path="/customer/chat" 
        element={
          <ProtectedRoute requiredRole="customer">
            <ChatPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/customer/chat/:id" 
        element={
          <ProtectedRoute requiredRole="customer">
            <ChatPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Novas rotas do customer portal */}
      <Route 
        path="/customer/profile" 
        element={
          <ProtectedRoute requiredRole="customer">
            <ProfilePage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/customer/support" 
        element={
          <ProtectedRoute requiredRole="customer">
            <SupportPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/customer/faq" 
        element={
          <ProtectedRoute requiredRole="customer">
            <FAQPage />
          </ProtectedRoute>
        } 
      />

      {/* Rotas de loja - protegidas */}
      <Route 
        path="/store/dashboard" 
        element={
          <ProtectedRoute requiredRole="store">
            <StoreDashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Nova rota de produtos */}
      <Route 
        path="/store/products" 
        element={
          <ProtectedRoute requiredRole="store">
            <ProductsManagementPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/store/orders" 
        element={
          <ProtectedRoute requiredRole="store">
            <PlaceholderPage title="Todos os Pedidos" />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/store/orders/:orderId" 
        element={
          <ProtectedRoute requiredRole="store">
            <PlaceholderPage title="Detalhes do Pedido" />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/store/orders/new" 
        element={
          <ProtectedRoute requiredRole="store">
            <PlaceholderPage title="Pedidos Novos" />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/store/orders/processing" 
        element={
          <ProtectedRoute requiredRole="store">
            <PlaceholderPage title="Pedidos em Processamento" />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/store/orders/shipped" 
        element={
          <ProtectedRoute requiredRole="store">
            <PlaceholderPage title="Pedidos Enviados" />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/store/orders/delivered" 
        element={
          <ProtectedRoute requiredRole="store">
            <PlaceholderPage title="Pedidos Entregues" />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/store/orders/completed" 
        element={
          <ProtectedRoute requiredRole="store">
            <PlaceholderPage title="Pedidos Concluídos" />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/store/orders/cancelled" 
        element={
          <ProtectedRoute requiredRole="store">
            <PlaceholderPage title="Pedidos Cancelados" />
          </ProtectedRoute>
        } 
      />
      
      {/* Rotas atualizadas de chat da loja */}
      <Route 
        path="/store/chats" 
        element={
          <ProtectedRoute requiredRole="store">
            <ChatManagementPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/store/chat/:orderId?" 
        element={
          <ProtectedRoute requiredRole="store">
            <ChatPage userType="store" />
          </ProtectedRoute>
        } 
      />

      {/* Nova rota de push notifications da loja */}
      <Route 
        path="/store/push-notifications" 
        element={
          <ProtectedRoute requiredRole="store">
            <NotificationManagementPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/store/settings" 
        element={
          <ProtectedRoute requiredRole="store">
            <PlaceholderPage title="Configurações" />
          </ProtectedRoute>
        } 
      />

      {/* Página inicial simples */}
      <Route path="/" element={<Navigate to="/login" />} />
      
      {/* Fallback para rotas não encontradas */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

function App() {
  // 🚀 REGISTRAR SERVICE WORKER AO INICIALIZAR A APLICAÇÃO
  useEffect(() => {
    const initializeServiceWorker = async () => {
      try {
        console.log('🚀 Inicializando Service Worker para notificações push...');
        
        // Aguardar um pouco para o DOM estar totalmente carregado
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Registrar service worker
        const registration = await registerServiceWorker();
        console.log('✅ Service Worker registrado:', registration);
        
        // Salvar registro no localStorage para debug
        localStorage.setItem('sw_registered', 'true');
        localStorage.setItem('sw_registration_time', new Date().toISOString());
        
      } catch (error) {
        console.error('❌ Erro ao inicializar Service Worker:', error);
        
        // Salvar erro no localStorage para debug
        localStorage.setItem('sw_registered', 'false');
        localStorage.setItem('sw_error', error.message);
      }
    };

    // Apenas registrar se estiver em um ambiente que suporte
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      initializeServiceWorker();
    } else {
      console.log('⚠️ Service Workers não suportados neste ambiente');
    }
  }, []); // Executar apenas uma vez na inicialização

  return (
    <ThemeProvider>
      <SidebarProvider>
        <AuthProvider>
          <ChatContextProvider>
            <Router>
              <Suspense fallback={<LoadingFallback />}>
                <AppContent />
              </Suspense>
            </Router>
          </ChatContextProvider>
        </AuthProvider>
      </SidebarProvider>
    </ThemeProvider>
  );
}

export default App;