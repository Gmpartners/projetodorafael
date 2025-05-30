import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Sidebar from '@/components/common/layout/Sidebar';
import CustomerBottomBar from '@/components/customer/CustomerBottomBar';
import { CustomerChatProvider } from '@/contexts/CustomerChatContext';

// Lazy load components
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const StoreDashboard = lazy(() => import('./pages/store/StoreDashboard'));
const StoreOrders = lazy(() => import('./pages/store/StoreOrders'));
const StoreOrderDetails = lazy(() => import('./pages/store/StoreOrderDetails'));
const StoreProducts = lazy(() => import('./pages/store/StoreProducts'));
const StoreCustomers = lazy(() => import('./pages/store/StoreCustomers'));
const StoreChats = lazy(() => import('./pages/store/StoreChats'));
const ChatManagementPage = lazy(() => import('./pages/store/ChatManagementPage'));
const StoreSettings = lazy(() => import('./pages/store/StoreSettings'));
const NotificationCenterPage = lazy(() => import('./pages/store/NotificationCenterPage'));

// 🆕 NEW: Customer Lookup (Email-based, NO AUTH)
const CustomerLookup = lazy(() => import('./pages/customer/CustomerLookup'));
const CustomerDashboard = lazy(() => import('./pages/customer/CustomerDashboard'));
const OrderDetailsCustomer = lazy(() => import('./pages/customer/OrderDetailsCustomer'));
const ChatPage = lazy(() => import('./pages/customer/ChatPage'));
const ChatListPage = lazy(() => import('./pages/customer/ChatListPage'));

// Novos componentes do customer portal
const ProfilePage = lazy(() => import('./pages/customer/ProfilePage'));
const SupportPage = lazy(() => import('./pages/customer/SupportPage'));
const FAQPage = lazy(() => import('./pages/customer/FAQPage'));

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">Page not found</p>
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Available Access Points:</h2>
          <div className="space-y-2 text-sm">
            <a 
              href="/customer/lookup"
              className="block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              🔍 Customer Portal Access
            </a>
            <a 
              href="/login"
              className="block px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              🏪 Store Login
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const AppContent = () => {
  const { user, userProfile } = useAuth();
  const location = useLocation();

  // Redirect logic based on user role
  if (user && userProfile?.role === 'store') {
    if (location.pathname === '/') {
      return <Navigate to="/store/dashboard" replace />;
    }
  } else if (userProfile?.role === 'customer') {
    console.log('👤 Usuário é cliente, redirecionando para customer dashboard');
    return <Navigate to="/customer/dashboard" replace />;
  }

  // Renderizar com contexto de chat apenas para customers
  if (userProfile?.role === 'customer') {
    return (
      <CustomerChatProvider>
        <AppRoutes />
      </CustomerChatProvider>
    );
  }

  return <AppRoutes />;
};

const AppRoutes = () => {
  const { user, userProfile } = useAuth();
  const location = useLocation();

  const RequiredRoleMessage = ({ requiredRole }) => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h2>
        <p className="text-gray-600 mb-6">
          This page is for {requiredRole === 'store' ? 'store owners' : 'customers'}.<br/>
          You are logged in as {userProfile.role === 'store' ? 'store owner' : 'customer'}.
        </p>
        <a
          href={userProfile.role === 'store' ? '/store/dashboard' : '/customer/lookup'}
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  );

  // 🔧 CORREÇÃO: Verificar se estamos em uma rota de customer e se é chat
  const isCustomerRoute = location.pathname.startsWith('/customer');
  const isChatRoute = location.pathname.includes('/customer/chat');

  return (
    <div className="min-h-screen bg-gray-50">
      {user && <Sidebar />}
      
      <main className={user ? "ml-0 lg:ml-64" : ""}>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* 🆕 NEW: Customer Lookup - Email-based entry point (NO AUTH) */}
            <Route 
              path="/customer/lookup" 
              element={
                <div className="min-h-screen">
                  <CustomerLookup />
                </div>
              } 
            />

            {/* 🆕 NEW: Customer routes - Email-based (NO AUTH REQUIRED) */}
            <Route 
              path="/customer/dashboard" 
              element={
                <div className="min-h-screen">
                  <CustomerDashboard />
                </div>
              } 
            />

            <Route 
              path="/customer/orders/:orderId" 
              element={
                <div className="min-h-screen">
                  <OrderDetailsCustomer />
                </div>
              } 
            />

            <Route 
              path="/customer/chat-list" 
              element={
                <div className="min-h-screen">
                  <ChatListPage />
                </div>
              } 
            />

            <Route 
              path="/customer/chat" 
              element={
                <div className="min-h-screen">
                  <ChatPage />
                </div>
              } 
            />

            <Route 
              path="/customer/chat/:id" 
              element={
                <div className="min-h-screen">
                  <ChatPage />
                </div>
              } 
            />

            <Route 
              path="/customer/profile" 
              element={
                <div className="min-h-screen">
                  <ProfilePage />
                </div>
              } 
            />

            <Route 
              path="/customer/support" 
              element={
                <div className="min-h-screen">
                  <SupportPage />
                </div>
              } 
            />

            <Route 
              path="/customer/faq" 
              element={
                <div className="min-h-screen">
                  <FAQPage />
                </div>
              } 
            />

            {/* Store Routes */}
            <Route path="/store/dashboard" element={
              <ProtectedRoute requiredRole="store">
                <StoreDashboard />
              </ProtectedRoute>
            } />
            
        
            
            <Route path="/store/orders/:orderId" element={
              <ProtectedRoute requiredRole="store">
                <StoreOrderDetails />
              </ProtectedRoute>
            } />
            
            <Route path="/store/products" element={
              <ProtectedRoute requiredRole="store">
                <StoreProducts />
              </ProtectedRoute>
            } />
            
            <Route path="/store/customers" element={
              <ProtectedRoute requiredRole="store">
                <StoreCustomers />
              </ProtectedRoute>
            } />
            
            <Route path="/store/chats" element={
              <ProtectedRoute requiredRole="store">
                <StoreChats />
              </ProtectedRoute>
            } />
            
            <Route path="/store/chats/:chatId" element={
              <ProtectedRoute requiredRole="store">
                <ChatManagementPage />
              </ProtectedRoute>
            } />
            
            <Route path="/store/settings" element={
              <ProtectedRoute requiredRole="store">
                <StoreSettings />
              </ProtectedRoute>
            } />
            
            <Route path="/store/notifications" element={
              <ProtectedRoute requiredRole="store">
                <NotificationCenterPage />
              </ProtectedRoute>
            } />

            {/* Root redirect */}
            <Route path="/" element={<Navigate to="/customer/lookup" replace />} />
            
            {/* 404 - Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      {/* 🔧 CORREÇÃO: Customer Bottom Bar - só aparece em rotas de customer MAS NÃO em chat */}
      {isCustomerRoute && !isChatRoute && <CustomerBottomBar />}
    </div>
  );
};

const App = () => {
  return <AppContent />;
};

export default App;