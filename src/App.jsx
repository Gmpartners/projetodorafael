import React, { lazy, Suspense, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import './index.css';

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
              href="/"
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
            >
              Voltar para Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <Router>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Rotas públicas - Placeholder por enquanto */}
              <Route path="/login" element={<PlaceholderPage title="Login" />} />
              <Route path="/register" element={<PlaceholderPage title="Registro" />} />
              
              {/* Rotas de cliente */}
              <Route path="/customer/dashboard" element={<CustomerDashboard />} />
              <Route path="/customer/orders" element={<PlaceholderPage title="Pedidos do Cliente" />} />
              <Route path="/customer/orders/:orderId" element={<OrderDetailsCustomer />} />
              
              {/* Rotas atualizadas de chat do cliente */}
              <Route path="/customer/chat" element={<ChatPage />} />
              <Route path="/customer/chat/:id" element={<ChatPage />} />
              
              {/* Novas rotas do customer portal */}
              <Route path="/customer/profile" element={<ProfilePage />} />
              <Route path="/customer/support" element={<SupportPage />} />
              <Route path="/customer/faq" element={<FAQPage />} />

              {/* Rotas de loja */}
              <Route path="/store/dashboard" element={<StoreDashboard />} />
              <Route path="/store/orders" element={<PlaceholderPage title="Todos os Pedidos" />} />
              <Route path="/store/orders/:orderId" element={<PlaceholderPage title="Detalhes do Pedido" />} />
              <Route path="/store/orders/new" element={<PlaceholderPage title="Pedidos Novos" />} />
              <Route path="/store/orders/processing" element={<PlaceholderPage title="Pedidos em Processamento" />} />
              <Route path="/store/orders/shipped" element={<PlaceholderPage title="Pedidos Enviados" />} />
              <Route path="/store/orders/delivered" element={<PlaceholderPage title="Pedidos Entregues" />} />
              <Route path="/store/orders/completed" element={<PlaceholderPage title="Pedidos Concluídos" />} />
              <Route path="/store/orders/cancelled" element={<PlaceholderPage title="Pedidos Cancelados" />} />
              
              {/* Rotas atualizadas de chat da loja */}
              <Route path="/store/chats" element={<ChatManagementPage />} />
              <Route path="/store/chat/:orderId?" element={<ChatPage userType="store" />} />

              {/* Nova rota de push notifications da loja */}
              <Route path="/store/push-notifications" element={<NotificationManagementPage />} />
              
              <Route path="/store/settings" element={<PlaceholderPage title="Configurações" />} />

              {/* Redirecionamento */}
              <Route path="/" element={<Navigate to="/store/dashboard" />} />
              <Route path="/store" element={<Navigate to="/store/dashboard" />} />
              <Route path="/customer" element={<Navigate to="/customer/dashboard" />} />
              
              {/* Fallback para rotas não encontradas */}
              <Route path="*" element={<Navigate to="/store/dashboard" />} />
            </Routes>
          </Suspense>
        </Router>
      </SidebarProvider>
    </ThemeProvider>
  );
}

export default App;