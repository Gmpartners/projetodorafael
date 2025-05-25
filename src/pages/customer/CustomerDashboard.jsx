import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Package, 
  MessageSquare,
  LogOut,
  RefreshCw,
  User,
  CheckCircle,
  Clock,
  Truck,
  AlertCircle,
  ArrowRight,
  Sparkles,
  BellIcon,
  XIcon,
  Loader2
} from 'lucide-react';
import { apiService } from '@/services/apiService';
import { notificationService } from '@/services/notificationService';
import { toast } from 'sonner';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { logout, userProfile, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // ✅ Estados para notificações
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState('unknown');
  
  // ✅ USAR UID REAL DO USUÁRIO LOGADO
  const storeId = 'E47OkrK3IcNu1Ys8gD4CA29RrHk2';
  const customerId = user?.uid || userProfile?.uid || '0HeRINZTlvOM5raS8J4AkITanWP2';
  
  // Estados para dados REAIS da API
  const [customerOrders, setCustomerOrders] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalOrders: 0,
    inProgress: 0,
    completed: 0,
    messages: 0
  });

  // ✅ VERIFICAR STATUS DE NOTIFICAÇÕES AO CARREGAR
  useEffect(() => {
    const checkNotificationStatus = () => {
      try {
        const systemStatus = notificationService.getSystemStatus();
        console.log('🔔 Status do sistema de notificações:', systemStatus);
        
        if (!systemStatus.supported) {
          setNotificationStatus('not-supported');
        } else if (systemStatus.permission === 'denied') {
          setNotificationStatus('denied');
        } else if (systemStatus.permission === 'granted') {
          setNotificationStatus('granted');
        } else {
          // Permissão ainda não foi solicitada
          setNotificationStatus('default');
          
          // ✅ MOSTRAR PROMPT AUTOMATICAMENTE APÓS 3 SEGUNDOS
          setTimeout(() => {
            if (systemStatus.supported) {
              setShowNotificationPrompt(true);
            }
          }, 3000);
        }
      } catch (error) {
        console.error('❌ Erro ao verificar status de notificações:', error);
        setNotificationStatus('error');
      }
    };

    if (customerId) {
      checkNotificationStatus();
      fetchRealCustomerData();
    }
  }, [customerId]);

  // ✅ FUNÇÃO PARA ATIVAR NOTIFICAÇÕES
  const handleEnableNotifications = async () => {
    try {
      setNotificationLoading(true);
      console.log('🔔 Ativando notificações para cliente:', customerId);
      
      // 1. Solicitar permissão e obter token
      const token = await notificationService.requestPermissionAndGetToken();
      console.log('✅ Token FCM obtido:', token.substring(0, 40) + '...');
      
      // 2. Registrar token no backend
      const deviceInfo = notificationService.getDeviceInfo();
      await apiService.registerFCMToken(token, deviceInfo);
      console.log('✅ Token registrado no backend');
      
      // 3. Inscrever na loja para receber notificações
      await apiService.subscribeToStore(storeId);
      console.log('✅ Inscrito na loja:', storeId);
      
      // Atualizar status
      setNotificationStatus('granted');
      setShowNotificationPrompt(false);
      
      // Sucesso!
      toast.success('🎉 Notificações ativadas!', {
        description: 'Você receberá atualizações dos seus pedidos em tempo real'
      });
      
    } catch (error) {
      console.error('❌ Erro ao ativar notificações:', error);
      
      if (error.message.includes('negada')) {
        setNotificationStatus('denied');
        toast.error('❌ Permissão negada', {
          description: 'Você pode ativar nas configurações do navegador'
        });
      } else {
        toast.error('❌ Erro ao ativar notificações', {
          description: error.message
        });
      }
    } finally {
      setNotificationLoading(false);
    }
  };

  const fetchRealCustomerData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔍 Buscando dados REAIS do customer:', customerId);
      console.log('👤 User info:', { uid: user?.uid, email: user?.email });
      
      // ✅ BUSCAR PEDIDOS REAIS DO CLIENTE VIA API
      const realOrders = await apiService.getCustomerOrders(customerId);
      console.log('📋 Pedidos recebidos da API:', realOrders);
      
      if (realOrders && realOrders.length > 0) {
        // ✅ FILTRAR APENAS PEDIDOS COM DADOS REAIS E PROGRESSO
        const validOrders = realOrders.filter(order => {
          // Manter pedidos que têm productId OU têm custom steps
          const hasProductId = order.productId && order.productId !== 'N/A';
          const hasCustomSteps = order.customSteps && order.customSteps.length > 0;
          const hasProgress = order.progress > 0;
          
          return hasProductId || hasCustomSteps || hasProgress || order.product?.name;
        });
        
        console.log(`✅ Pedidos válidos filtrados: ${validOrders.length}/${realOrders.length}`);
        
        // ✅ ENRIQUECER PEDIDOS COM DADOS DE PROGRESSO
        const enrichedOrders = await Promise.all(
          validOrders.map(async (order) => {
            try {
              // Buscar progresso detalhado se não tiver
              if (!order.customSteps || order.customSteps.length === 0) {
                const progressData = await apiService.getCustomerOrderProgress(order.id, customerId);
                if (progressData && progressData.customSteps) {
                  order.customSteps = progressData.customSteps;
                  order.progress = progressData.progress;
                  order.currentStep = progressData.currentStep;
                }
              }
              
              // Garantir que tem progresso calculado
              if (!order.progress && order.customSteps) {
                const completedSteps = order.customSteps.filter(step => step.completed).length;
                order.progress = Math.round((completedSteps / order.customSteps.length) * 100);
              }
              
              return order;
            } catch (progressError) {
              console.log(`⚠️ Erro ao buscar progresso do pedido ${order.id}:`, progressError.message);
              return order;
            }
          })
        );
        
        setCustomerOrders(enrichedOrders);
        
        // ✅ Calcular estatísticas REAIS
        const stats = {
          totalOrders: enrichedOrders.length,
          inProgress: enrichedOrders.filter(order => 
            order.progress < 100 && !['entregue', 'cancelado', 'finalizado'].includes(order.status?.toLowerCase())
          ).length,
          completed: enrichedOrders.filter(order => 
            order.progress >= 100 || ['entregue', 'finalizado'].includes(order.status?.toLowerCase())
          ).length,
          messages: enrichedOrders.reduce((sum, order) => 
            sum + (order.unreadMessages || 0), 0
          )
        };
        
        console.log('📊 Estatísticas calculadas:', stats);
        setDashboardStats(stats);
        
      } else {
        console.log('📋 Nenhum pedido encontrado para o cliente');
        setCustomerOrders([]);
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar dados do cliente:', error);
      setError(`Erro ao carregar seus pedidos: ${error.message}`);
      setCustomerOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  const getStatusColor = (order) => {
    if (order.progress >= 100) return 'text-emerald-600';
    if (order.progress >= 66) return 'text-violet-600';
    if (order.progress >= 33) return 'text-blue-600';
    return 'text-amber-600';
  };

  const getProgressBarColor = (order) => {
    if (order.progress >= 100) return 'from-emerald-400 to-emerald-500';
    if (order.progress >= 66) return 'from-violet-400 to-violet-500';
    if (order.progress >= 33) return 'from-blue-400 to-blue-500';
    return 'from-amber-400 to-amber-500';
  };

  const getStatusText = (order) => {
    if (order.progress >= 100) return 'Entregue';
    if (order.currentStep?.name) return order.currentStep.name;
    if (order.customSteps) {
      const currentStep = order.customSteps.find(step => step.current);
      if (currentStep) return currentStep.name;
      
      const nextStep = order.customSteps.find(step => !step.completed);
      if (nextStep) return nextStep.name;
    }
    return order.status || 'Processando';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Hoje';
    try {
      const date = dateString.seconds ? new Date(dateString.seconds * 1000) : new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short'
      });
    } catch {
      return 'Hoje';
    }
  };

  const getStepIcon = (stepName) => {
    if (!stepName) return Clock;
    const name = stepName.toLowerCase();
    if (name.includes('confirmado') || name.includes('recebido')) return CheckCircle;
    if (name.includes('preparando') || name.includes('separando')) return Package;
    if (name.includes('enviado') || name.includes('transito')) return Truck;
    if (name.includes('entregue')) return CheckCircle;
    return Clock;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-500 border-t-transparent mx-auto mb-3"></div>
          <p className="text-slate-600 text-sm font-medium">Carregando seus pedidos...</p>
          <p className="text-xs text-slate-400 mt-1">Cliente: {customerId}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ✅ Header mais clean e moderno */}
      <header className="bg-gradient-to-r from-violet-500 to-purple-600 px-4 pt-8 pb-6 relative overflow-hidden">
        {/* Elementos decorativos sutis */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-12 translate-x-12"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-violet-100 text-sm font-normal mb-1">
                Olá,
              </p>
              <h1 className="text-white text-xl font-semibold">
                {userProfile?.name || 'Maria Silva'}
              </h1>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleLogout}
              className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-violet-100/80 text-sm max-w-xs">
            Acompanhe seus pedidos em tempo real
          </p>
        </div>
      </header>

      {/* ✅ Content area com design mais limpo */}
      <main className="px-4 py-5 -mt-3 relative z-10">
        
        {/* ✅ PROMPT DE NOTIFICAÇÕES - NÃO INTRUSIVO MAS VISÍVEL */}
        {showNotificationPrompt && notificationStatus === 'default' && (
          <Card className="mb-6 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <BellIcon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900 mb-1">
                    Quer receber atualizações dos seus pedidos?
                  </h3>
                  <p className="text-blue-700 text-sm mb-3">
                    Ative as notificações para ser avisado quando seus pedidos forem atualizados, enviados ou entregues.
                  </p>
                  <div className="flex space-x-3">
                    <Button 
                      onClick={handleEnableNotifications}
                      disabled={notificationLoading}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2"
                    >
                      {notificationLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Ativando...
                        </>
                      ) : (
                        <>
                          <BellIcon className="h-4 w-4 mr-2" />
                          Ativar Notificações
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => setShowNotificationPrompt(false)}
                      className="border-blue-300 text-blue-700 hover:bg-blue-100"
                    >
                      Agora Não
                    </Button>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotificationPrompt(false)}
                  className="text-blue-500 hover:text-blue-700 hover:bg-blue-100 p-1"
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ✅ FEEDBACK DE STATUS DAS NOTIFICAÇÕES */}
        {notificationStatus === 'granted' && (
          <Alert className="mb-6 border-emerald-200 bg-emerald-50">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <AlertDescription className="text-emerald-800">
              <strong>🎉 Notificações ativadas!</strong> Você receberá atualizações dos seus pedidos em tempo real.
            </AlertDescription>
          </Alert>
        )}

        {notificationStatus === 'denied' && (
          <Alert className="mb-6 border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>⚠️ Notificações bloqueadas.</strong> Para ativar, vá nas configurações do seu navegador e permita notificações para este site.
            </AlertDescription>
          </Alert>
        )}

        {/* Stats cards mais delicados */}
        <div className="grid grid-cols-4 gap-2.5 mb-6">
          <div className="bg-white rounded-lg p-3 text-center shadow-sm border border-slate-100">
            <div className="text-lg font-semibold text-slate-800">{dashboardStats.totalOrders}</div>
            <div className="text-xs text-slate-500 font-medium">Pedidos</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center shadow-sm border border-slate-100">
            <div className="text-lg font-semibold text-blue-600">{dashboardStats.inProgress}</div>
            <div className="text-xs text-slate-500 font-medium">Andamento</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center shadow-sm border border-slate-100">
            <div className="text-lg font-semibold text-emerald-600">{dashboardStats.completed}</div>
            <div className="text-xs text-slate-500 font-medium">Finalizados</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center shadow-sm border border-slate-100">
            <div className="text-lg font-semibold text-violet-600">{dashboardStats.messages}</div>
            <div className="text-xs text-slate-500 font-medium">Mensagens</div>
          </div>
        </div>

        {/* ✅ Seção Meus Pedidos mais clean */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-slate-800 text-lg font-medium">Meus Pedidos</h2>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={fetchRealCustomerData}
            className="text-slate-400 hover:text-slate-600 p-2"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        
        {/* ✅ Debug info para desenvolvimento */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-xs">
            <p><strong>Debug Info:</strong></p>
            <p>Customer ID: {customerId}</p>
            <p>Email: {user?.email}</p>
            <p>Store ID: {storeId}</p>
            <p>Notification Status: {notificationStatus}</p>
          </div>
        )}
        
        {/* ✅ Tratamento de erro mais elegante */}
        {error && (
          <Card className="bg-red-50/50 border-red-100 mb-4">
            <CardContent className="p-4">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-red-800 text-sm font-medium">Erro ao carregar dados</p>
                  <p className="text-red-600 text-xs mt-1">{error}</p>
                  <Button 
                    onClick={fetchRealCustomerData} 
                    className="mt-2 bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1.5"
                    size="sm"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Tentar Novamente
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {customerOrders.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-slate-100">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="font-medium text-slate-800 mb-2">Nenhum pedido encontrado</h3>
            <p className="text-slate-500 text-sm mb-4">
              Você ainda não possui pedidos ou eles estão sendo processados
            </p>
            <Button onClick={fetchRealCustomerData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {customerOrders.map((order, index) => (
              <Card 
                key={order.id || index}
                className="bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-200 cursor-pointer group"
                onClick={() => navigate(`/customer/orders/${order.id || order.orderId}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    {/* ✅ Ícone da loja mais sutil */}
                    <div className="w-11 h-11 bg-gradient-to-br from-violet-50 to-purple-50 rounded-lg flex items-center justify-center text-lg flex-shrink-0 border border-violet-100">
                      🏪
                    </div>
                    
                    {/* ✅ Info principal redesenhada */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium text-slate-800 text-sm">
                              Pedido #{(order.orderId || order.id).toString().slice(-6)}
                            </h3>
                            {order.progress >= 100 && (
                              <div className="w-3 h-3 bg-emerald-500 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-2 h-2 text-white" />
                              </div>
                            )}
                            {(order.unreadMessages || 0) > 0 && (
                              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                            )}
                          </div>
                          
                          <p className="text-slate-600 text-sm font-medium">
                            {order.productName || order.productDetails?.name || order.product?.name || 'Produto da loja'}
                          </p>
                          
                          {(order.quantity > 1) && (
                            <p className="text-slate-400 text-xs">
                              {order.quantity} itens
                            </p>
                          )}
                        </div>
                        
                        <div className="text-right flex-shrink-0">
                          <span className="text-slate-400 text-xs">
                            {formatDate(order.createdAt || order.orderDate)}
                          </span>
                          <ArrowRight className="h-3 w-3 text-slate-400 mt-1 ml-auto group-hover:text-slate-600 transition-colors" />
                        </div>
                      </div>
                      
                      {/* ✅ Status atual mais delicado */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Sparkles className={`h-3 w-3 ${getStatusColor(order)}`} />
                          <span className={`text-sm font-medium ${getStatusColor(order)}`}>
                            {getStatusText(order)}
                          </span>
                        </div>
                        <span className="text-slate-500 text-xs font-medium">
                          {order.progress || 0}%
                        </span>
                      </div>
                      
                      {/* ✅ BARRA DE PROGRESSO MAIS DELICADA */}
                      <div className="space-y-2">
                        {/* Progress bar principal mais sutil */}
                        <div className="relative">
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div 
                              className={`h-2 rounded-full bg-gradient-to-r ${getProgressBarColor(order)} transition-all duration-700 ease-out`}
                              style={{ width: `${order.progress || 0}%` }}
                            >
                              <div className="h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                            </div>
                          </div>
                        </div>
                        
                        {/* ✅ Timeline mini mais clean */}
                        {order.customSteps && order.customSteps.length > 0 && (
                          <div className="flex justify-between items-center pt-2">
                            {order.customSteps.slice(0, 4).map((step, stepIndex) => {
                              const StepIcon = getStepIcon(step.name);
                              return (
                                <div key={stepIndex} className="flex flex-col items-center">
                                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs border border-white shadow-sm
                                    ${step.completed 
                                      ? 'bg-emerald-500 text-white' 
                                      : step.current 
                                        ? 'bg-blue-500 text-white' 
                                        : 'bg-slate-200 text-slate-400'}`}>
                                    <StepIcon className="h-2.5 w-2.5" />
                                  </div>
                                  <span className={`text-xs mt-1 text-center max-w-14 leading-tight
                                    ${step.completed 
                                      ? 'text-emerald-600 font-medium' 
                                      : step.current 
                                        ? 'text-blue-600 font-medium' 
                                        : 'text-slate-400'}`}>
                                    {step.name.length > 6 ? step.name.substring(0, 4) + '...' : step.name}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        
                        {/* ✅ Descrição mais sutil */}
                        <div className="flex items-center justify-between pt-1">
                          <p className="text-xs text-slate-400">
                            {order.currentStep?.description || 
                             (order.customSteps && order.customSteps.find(step => step.current)?.description) ||
                             'Acompanhe o progresso'}
                          </p>
                          
                          {order.progress < 100 && (
                            <span className="text-xs text-blue-500 font-medium">
                              Em andamento
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {/* ✅ Padding para bottom navigation */}
        <div className="h-20"></div>
      </main>

      {/* ✅ Bottom Navigation mais moderna */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/60 px-4 py-2">
        <div className="flex justify-center items-center max-w-sm mx-auto">
          <button 
            className="flex flex-col items-center text-violet-600 p-3"
            onClick={() => navigate('/customer/dashboard')}
          >
            <Package className="h-5 w-5" />
            <span className="text-xs mt-1 font-medium">Pedidos</span>
          </button>
          
          <button 
            className="flex flex-col items-center text-slate-400 p-3 mx-6 relative"
            onClick={() => navigate('/customer/chat')}
          >
            <MessageSquare className="h-5 w-5" />
            <span className="text-xs mt-1">Mensagens</span>
            {dashboardStats.messages > 0 && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-medium">{dashboardStats.messages}</span>
              </div>
            )}
          </button>
          
          <button 
            className="flex flex-col items-center text-slate-400 p-3"
            onClick={() => navigate('/customer/profile')}
          >
            <User className="h-5 w-5" />
            <span className="text-xs mt-1">Perfil</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;