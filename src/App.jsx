import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import CustomerBottomBar from '@/components/customer/CustomerBottomBar';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { CustomerChatProvider } from '@/contexts/CustomerChatContext';
import { StoreChatProvider } from '@/contexts/StoreChatContext';
import ServiceWorkerManager from '@/components/common/ServiceWorkerManager';
import { Toaster } from "sonner"; // ✅ ADICIONADO: Toast notifications
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

// 🆕 NOVO: Redirecionamento inteligente baseado no usuário logado
const SmartRedirect = () => {
  const { isAuthenticated, userProfile, loading } = useAuth();

  console.log('🎯 SmartRedirect:', { isAuthenticated, role: userProfile?.role, loading });

  if (loading) {
    return <LoadingFallback />;
  }

  // Se não está autenticado, mostrar opções ou ir para login
  if (!isAuthenticated) {
    console.log('❌ Não autenticado, redirecionando para login');
    return <Navigate to="/login" replace />;
  }

  // Se está autenticado, redirecionar baseado no role
  if (userProfile?.role === 'store') {
    console.log('🏪 Usuário é loja, redirecionando para store dashboard');
    return <Navigate to="/store/dashboard" replace />;
  } else if (userProfile?.role === 'customer') {
    console.log('👤 Usuário é cliente, redirecionando para customer dashboard');
    return <Navigate to="/customer/dashboard" replace />;
  } else {
    console.log('🤔 Role não identificado, redirecionando para login');
    return <Navigate to="/login" replace />;
  }
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

  // Se tem role requerido mas não corresponde, mostrar uma mensagem em vez de redirecionar
  if (requiredRole && userProfile?.role && userProfile.role !== requiredRole) {
    console.log('⚠️ Wrong role:', userProfile.role, 'expected:', requiredRole);
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-50">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-zinc-200 text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-xl font-bold text-zinc-900 mb-2">Access Denied</h1>
          <p className="text-zinc-600 mb-6">
            This page is for {requiredRole === 'store' ? 'store owners' : 'customers'}.<br/>
            You are logged in as {userProfile.role === 'store' ? 'store owner' : 'customer'}.
          </p>
          <div className="flex gap-3 justify-center">
            <a 
              href={userProfile.role === 'store' ? '/store/dashboard' : '/customer/lookup'}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              Go to My Dashboard
            </a>
            <a 
              href="/login"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors shadow-sm"
            >
              Switch Account
            </a>
          </div>
        </div>
      </div>
    );
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
  const location = useLocation();
  
  // Verificar se estamos em uma rota de customer
  const isCustomerRoute = location.pathname.startsWith('/customer');
  
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
        <Route 
          path="/customer/profile" 
          element={
            <PublicRoute>
              <ProfilePage />
            </PublicRoute>
          } 
        />
        
        {/* Store routes - PROTECTED (Auth required) */}
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
      
      {/* 🆕 Customer Bottom Bar - só aparece em rotas de customer */}
      {isCustomerRoute && <CustomerBottomBar />}
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
              {/* ✅ ADICIONADO: Toaster para notificações */}
              <Toaster 
                position="top-right"
                expand={true}
                richColors={true}
                closeButton={true}
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    fontSize: '14px',
                  },
                }}
              />
            </Router>
          </ChatContextProvider>
        </AuthProvider>
      </SidebarProvider>
    </ThemeProvider>
  );
}

export default App;