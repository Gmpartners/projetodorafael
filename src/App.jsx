import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { CustomerChatProvider } from '@/contexts/CustomerChatContext';
import { StoreChatProvider } from '@/contexts/StoreChatContext';
import ServiceWorkerManager from '@/components/common/ServiceWorkerManager';
import './index.css';

// Páginas de autenticação
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));

// Layout e componentes base
import MainLayout from './components/common/layout/MainLayout';

// 🆕 NEW: Customer Lookup (Email-based, NO AUTH)
const CustomerLookup = lazy(() => import('./pages/customer/CustomerLookup'));

// Lazy loading para páginas principais
const CustomerDashboard = lazy(() => import('./pages/customer/CustomerDashboard'));
const OrderDetailsCustomer = lazy(() => import('./pages/customer/OrderDetailsCustomer'));
const StoreDashboard = lazy(() => import('./pages/store/StoreDashboard'));

// Novos componentes de chat
const ChatPage = lazy(() => import('./pages/customer/ChatPage'));
const ChatListPage = lazy(() => import('./pages/customer/ChatListPage'));
const ChatManagementPage = lazy(() => import('./pages/store/ChatManagementPage'));

// Novos componentes do customer portal
const ProfilePage = lazy(() => import('./pages/customer/ProfilePage'));
const SupportPage = lazy(() => import('./pages/customer/SupportPage'));
const FAQPage = lazy(() => import('./pages/customer/FAQPage'));

// Componentes de push notifications v7.0
const NotificationManagementPage = lazy(() => import('./pages/store/push-notifications/NotificationManagementPage'));

// Nova página de produtos
const ProductsManagementPage = lazy(() => import('./pages/store/ProductsManagementPage'));

// Componente de loading aprimorado
const LoadingFallback = () => (
  <div className="h-screen flex items-center justify-center bg-zinc-50">
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <div className="absolute inset-0 rounded-full border-2 border-blue-200"></div>
      </div>
      <div className="text-sm text-zinc-600 animate-pulse">Loading...</div>
    </div>
  </div>
);

// Componente placeholder aprimorado para páginas ainda não implementadas
const PlaceholderPage = ({ title }) => {
  return (
    <div className="h-screen flex items-center justify-center bg-zinc-50">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-zinc-200">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">🚧</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">Customer Portal</h1>
          <p className="text-zinc-600 mb-6">
            Page under construction: <span className="font-medium text-blue-600">{title}</span>
          </p>
          <div className="flex justify-center">
            <a 
              href="/customer/lookup"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              Back to Order Lookup
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// 🆕 CORRIGIDO: Redirecionamento inteligente - Clientes não fazem login
const SmartRedirect = () => {
  const { isAuthenticated, userProfile, loading } = useAuth();

  console.log('🎯 SmartRedirect:', { isAuthenticated, role: userProfile?.role, loading });

  if (loading) {
    return <LoadingFallback />;
  }

  // Se não está autenticado, ir para customer lookup (não login)
  if (!isAuthenticated) {
    console.log('❌ Não autenticado, redirecionando para customer lookup');
    return <Navigate to="/customer/lookup" replace />;
  }

  // Se está autenticado e é loja, ir para dashboard da loja
  if (userProfile?.role === 'store') {
    console.log('🏪 Usuário é loja, redirecionando para store dashboard');
    return <Navigate to="/store/dashboard" replace />;
  } else {
    // Se está autenticado mas não é loja, fazer logout e ir para customer lookup
    console.log('❌ Usuário autenticado mas não é loja, redirecionando para customer lookup');
    return <Navigate to="/customer/lookup" replace />;
  }
};

// 🔥 NOVO: Componente para fornecer Chat Context baseado no role do usuário
const ChatContextProvider = ({ children }) => {
  const { userProfile } = useAuth();
  
  // Clientes não fazem mais login, então não precisam de contexto autenticado
  if (userProfile?.role === 'store') {
    return (
      <StoreChatProvider>
        {children}
      </StoreChatProvider>
    );
  }
  
  // Para rotas de cliente, usar CustomerChatProvider sem autenticação
  return (
    <CustomerChatProvider>
      {children}
    </CustomerChatProvider>
  );
};

// Componente para proteger rotas autenticadas (ONLY FOR STORES)
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, userProfile, loading } = useAuth();

  console.log('🛡️ ProtectedRoute check:', { isAuthenticated, role: userProfile?.role, requiredRole, loading });

  if (loading) {
    return <LoadingFallback />;
  }

  if (!isAuthenticated) {
    console.log('❌ Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Se tem role requerido mas não corresponde
  if (requiredRole && userProfile?.role && userProfile.role !== requiredRole) {
    console.log('⚠️ Wrong role:', userProfile.role, 'expected:', requiredRole);
    
    // Se é store mas tentando acessar área de cliente
    if (userProfile.role === 'store' && requiredRole === 'customer') {
      return (
        <div className="h-screen flex items-center justify-center bg-zinc-50">
          <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-zinc-200 text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h1 className="text-xl font-bold text-zinc-900 mb-2">Acesso Negado</h1>
            <p className="text-zinc-600 mb-6">
              Esta área é para clientes.<br/>
              Você está logado como loja.
            </p>
            <a 
              href="/store/dashboard"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              Ir para Dashboard da Loja
            </a>
          </div>
        </div>
      );
    }
    
    // Outros casos
    return <Navigate to="/login" replace />;
  }

  console.log('✅ Access granted');
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
    <>
      {/* 🆕 v7.0: Service Worker Manager Global */}
      <ServiceWorkerManager />
      
      <Routes>
        {/* 🆕 NEW: Customer Lookup - Email-based entry point (NO AUTH) */}
        <Route 
          path="/customer/lookup" 
          element={
            <PublicRoute>
              <CustomerLookup />
            </PublicRoute>
          } 
        />

        {/* 🆕 NEW: Customer routes - Email-based (NO AUTH REQUIRED) */}
        <Route 
          path="/customer/dashboard" 
          element={
            <PublicRoute>
              <CustomerDashboard />
            </PublicRoute>
          } 
        />
        <Route 
          path="/customer/orders/:orderId" 
          element={
            <PublicRoute>
              <OrderDetailsCustomer />
            </PublicRoute>
          } 
        />
        <Route 
          path="/customer/chat-list" 
          element={
            <PublicRoute>
              <ChatListPage />
            </PublicRoute>
          } 
        />
        <Route 
          path="/customer/chat" 
          element={
            <PublicRoute>
              <ChatPage />
            </PublicRoute>
          } 
        />
        <Route 
          path="/customer/chat/:id" 
          element={
            <PublicRoute>
              <ChatPage />
            </PublicRoute>
          } 
        />
        
        {/* Store routes - Auth pages */}
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

        {/* Store dashboard - PROTECTED */}
        <Route 
          path="/store/dashboard" 
          element={
            <ProtectedRoute requiredRole="store">
              <StoreDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Store products */}
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
              <PlaceholderPage title="All Orders" />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/store/orders/:orderId" 
          element={
            <ProtectedRoute requiredRole="store">
              <PlaceholderPage title="Order Details" />
            </ProtectedRoute>
          } 
        />
        
        {/* Store chat routes */}
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

        {/* Store notifications */}
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
              <PlaceholderPage title="Settings" />
            </ProtectedRoute>
          } 
        />

        {/* ✅ CORREÇÃO: Redirecionamento inteligente baseado no usuário */}
        <Route path="/" element={<SmartRedirect />} />
        
        {/* Fallback for unknown routes - também usa redirecionamento inteligente */}
        <Route path="*" element={<SmartRedirect />} />
      </Routes>
    </>
  );
}

function App() {
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