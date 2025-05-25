import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft,
  Star,
  Clock,
  Package,
  Truck,
  CheckCircle,
  MapPin,
  CreditCard,
  MessageSquare,
  Loader2,
  AlertCircle,
  User,
  Phone,
  Mail,
  Calendar,
  Sparkles,
  Info,
  MessageCircle,
  Send,
  HeadphonesIcon
} from 'lucide-react';
import { apiService } from '@/services/apiService';

const OrderDetailsCustomer = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { userProfile, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState(null);

  // ✅ USAR UID REAL DO USUÁRIO LOGADO
  const customerId = user?.uid || userProfile?.uid || '0HeRINZTlvOM5raS8J4AkITanWP2';
  const storeId = 'E47OkrK3IcNu1Ys8gD4CA29RrHk2';

  useEffect(() => {
    if (customerId && orderId) {
      fetchRealOrderDetails();
    }
  }, [orderId, customerId]);

  const fetchRealOrderDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔍 Buscando detalhes REAIS do pedido:', orderId);

      // ✅ BUSCAR DADOS REAIS DO PEDIDO VIA API
      const realOrder = await apiService.getOrder(orderId);
      
      if (!realOrder) {
        throw new Error(`Pedido ${orderId} não encontrado`);
      }

      // ✅ BUSCAR PROGRESSO CUSTOMIZADO REAL DA LOJA
      let orderWithProgress = { ...realOrder };
      
      try {
        const progressData = await apiService.getCustomerOrderProgress(orderId, customerId);
        if (progressData) {
          orderWithProgress = {
            ...orderWithProgress,
            customSteps: progressData.customSteps || realOrder.customSteps || [],
            progress: progressData.progress || realOrder.progress || 0,
            currentStep: progressData.currentStep || realOrder.currentStep || {}
          };
        }
      } catch (progressError) {
        console.log('⚠️ Usando dados de progresso do próprio pedido');
        // Usar dados do próprio pedido se API de progresso falhar
        if (realOrder.customSteps && realOrder.customSteps.length > 0) {
          const completedSteps = realOrder.customSteps.filter(step => step.completed).length;
          orderWithProgress.progress = Math.round((completedSteps / realOrder.customSteps.length) * 100);
        }
      }

      console.log('✅ Pedido REAL carregado:', orderWithProgress);
      setOrderDetails(orderWithProgress);

    } catch (error) {
      console.error('❌ Erro ao carregar detalhes do pedido:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ FUNÇÃO PARA ABRIR CHAT COM A LOJA
  const handleOpenChat = async () => {
    try {
      console.log('💬 Abrindo chat para o pedido:', {
        orderId: orderId,
        customerId: customerId,
        storeId: storeId
      });

      // Criar/obter chat do pedido via API
      const chatData = await apiService.getOrderChat(orderId, customerId, storeId);
      
      if (chatData && chatData.id) {
        // Navegar para a página de chat específica
        navigate(`/customer/chat/${chatData.id}`, {
          state: {
            orderId: orderId,
            orderDetails: orderDetails,
            chatId: chatData.id
          }
        });
      } else {
        throw new Error('Não foi possível criar o chat');
      }
    } catch (error) {
      console.error('❌ Erro ao abrir chat:', error);
      alert('Erro ao abrir chat. Tente novamente.');
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Data não disponível';
    try {
      const date = dateString.seconds ? new Date(dateString.seconds * 1000) : new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return 'Data não disponível';
    }
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = dateString.seconds ? new Date(dateString.seconds * 1000) : new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
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

  const getProgressColor = (progress) => {
    if (progress >= 100) return 'from-emerald-400 to-emerald-500';
    if (progress >= 66) return 'from-violet-400 to-violet-500';
    if (progress >= 33) return 'from-blue-400 to-blue-500';
    return 'from-amber-400 to-amber-500';
  };

  const getStatusColor = (progress) => {
    if (progress >= 100) return 'text-emerald-600';
    if (progress >= 66) return 'text-violet-600';
    if (progress >= 33) return 'text-blue-600';
    return 'text-amber-600';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-violet-600 mx-auto mb-3" />
          <p className="text-slate-600 text-sm font-medium">Carregando detalhes...</p>
          <p className="text-xs text-slate-400 mt-1">Pedido: {orderId}</p>
        </div>
      </div>
    );
  }

  if (error || !orderDetails) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Pedido não encontrado</h3>
            <p className="text-slate-500 mb-4 text-sm">{error || 'Este pedido não existe ou você não tem acesso a ele.'}</p>
            <div className="space-y-2">
              <Button onClick={() => navigate('/customer/dashboard')} className="w-full bg-violet-600 hover:bg-violet-700">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar aos Pedidos
              </Button>
              <Button onClick={fetchRealOrderDetails} variant="outline" className="w-full">
                <Loader2 className="h-4 w-4 mr-2" />
                Tentar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ✅ Header mais clean */}
      <header className="bg-gradient-to-r from-violet-500 to-purple-600 px-4 pt-8 pb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-12 translate-x-12"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8"></div>
        
        <div className="relative z-10">
          <div className="flex items-center mb-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/customer/dashboard')}
              className="text-white/80 hover:text-white hover:bg-white/10 p-2 mr-3 rounded-lg"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-white text-lg font-medium">Detalhes do Pedido</h1>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-lg mr-3 backdrop-blur-sm">
                🏪
              </div>
              <div>
                <div className="flex items-center">
                  <h2 className="text-white text-lg font-medium mr-2">
                    {orderDetails.storeName || 'Loja GM Partners'}
                  </h2>
                  <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-2.5 h-2.5 text-white" />
                  </div>
                </div>
                <div className="flex items-center mt-1">
                  <span className="text-violet-200 text-sm">
                    <Clock className="h-3 w-3 inline mr-1" />
                    Pedido #{(orderDetails.orderId || orderDetails.id).toString().slice(-6)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ✅ Content redesenhado */}
      <main className="px-4 py-5 -mt-3 relative z-10">
        {/* ✅ Card principal do pedido mais clean */}
        <Card className="bg-white shadow-sm mb-6 border border-slate-100">
          <CardContent className="p-5">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-violet-600 font-medium text-lg">
                  Pedido #{(orderDetails.orderId || orderDetails.id).toString().slice(-6)}
                </h3>
                <p className="text-slate-500 text-sm">
                  Criado em {formatDate(orderDetails.createdAt)}
                </p>
              </div>
            </div>
            
            {/* ✅ PROGRESSO PRINCIPAL MAIS DELICADO */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Sparkles className={`h-4 w-4 ${getStatusColor(orderDetails.progress || 0)}`} />
                  <span className={`font-medium text-sm ${getStatusColor(orderDetails.progress || 0)}`}>
                    {orderDetails.progress >= 100 ? 'Pedido Finalizado' : 
                     orderDetails.currentStep?.name || 
                     (orderDetails.customSteps && orderDetails.customSteps.find(step => step.current)?.name) ||
                     'Em processamento'}
                  </span>
                </div>
                <span className="text-slate-600 font-medium text-sm">
                  {orderDetails.progress || 0}%
                </span>
              </div>
              
              {/* Barra de progresso principal mais sutil */}
              <div className="relative mb-3">
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-3 rounded-full bg-gradient-to-r ${getProgressColor(orderDetails.progress || 0)} transition-all duration-700 ease-out`}
                    style={{ width: `${orderDetails.progress || 0}%` }}
                  >
                    <div className="h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-medium text-slate-700 drop-shadow-sm">
                    {orderDetails.progress || 0}%
                  </span>
                </div>
              </div>
              
              {orderDetails.currentStep?.description && (
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="flex items-start">
                    <Info className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-slate-600">
                      {orderDetails.currentStep.description}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ✅ CHAT COM A LOJA - SEMPRE VISÍVEL (FUNCIONALIDADE PRINCIPAL) */}
        <Card className="bg-gradient-to-r from-violet-50 to-purple-50 shadow-sm mb-6 border border-violet-100">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-violet-500 rounded-full flex items-center justify-center mr-3">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-violet-800">Conversar com a Loja</h3>
                  <p className="text-violet-600 text-sm">Tire dúvidas sobre seu pedido</p>
                </div>
              </div>
              {orderDetails.unreadMessages > 0 && (
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-medium">{orderDetails.unreadMessages}</span>
                </div>
              )}
            </div>
            
            <div className="bg-white/70 p-4 rounded-lg border border-violet-200 mb-4">
              <div className="flex items-start">
                <HeadphonesIcon className="h-4 w-4 text-violet-500 mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-violet-700 font-medium mb-1">Suporte disponível</p>
                  <p className="text-violet-600">
                    Nossa equipe está pronta para ajudar com dúvidas sobre entrega, 
                    produto ou qualquer questão relacionada ao seu pedido.
                  </p>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleOpenChat}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white shadow-sm"
              size="lg"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Iniciar Conversa
              <Send className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* ✅ Detalhes do produto mais clean */}
        <Card className="bg-white shadow-sm mb-6 border border-slate-100">
          <CardContent className="p-5">
            <h3 className="text-slate-800 font-medium mb-4">Produto</h3>
            
            <div className="flex items-center">
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-violet-50 to-purple-50 flex items-center justify-center text-2xl mr-4 flex-shrink-0 border border-violet-100">
                📦
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-slate-800">
                  {orderDetails.productName || orderDetails.productDetails?.name || orderDetails.product?.name || 'Produto'}
                </h4>
                <p className="text-slate-600 text-sm mt-1">
                  {orderDetails.productDetails?.description || orderDetails.product?.description || 'Produto da loja'}
                </p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-sm text-slate-500">
                    Qtd: {orderDetails.quantity || orderDetails.order?.quantity || 1}
                  </span>
                  <span className="text-sm font-medium text-slate-800">
                    {formatCurrency(orderDetails.totalValue || orderDetails.order?.totalValue || orderDetails.productDetails?.price || 0)}
                  </span>
                  {orderDetails.productId && (
                    <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                      ID: {orderDetails.productId}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ✅ Dados do cliente e endereço - SE EXISTIREM */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Dados do cliente */}
          {(orderDetails.customer || orderDetails.customerName) && (
            <Card className="bg-white shadow-sm border border-slate-100">
              <CardContent className="p-5">
                <div className="flex items-center mb-3">
                  <User className="h-4 w-4 text-slate-500 mr-2" />
                  <span className="font-medium text-slate-700 text-sm">Dados do Cliente</span>
                </div>
                <div className="space-y-2">
                  <p className="text-slate-900 font-medium text-sm">
                    {orderDetails.customer?.name || orderDetails.customerName || userProfile?.name || 'Maria Silva'}
                  </p>
                  {(orderDetails.customer?.email || orderDetails.customerEmail) && (
                    <p className="text-slate-600 text-sm flex items-center">
                      <Mail className="h-3 w-3 mr-2" />
                      {orderDetails.customer?.email || orderDetails.customerEmail}
                    </p>
                  )}
                  {(orderDetails.customer?.phone || orderDetails.customerPhone) && (
                    <p className="text-slate-600 text-sm flex items-center">
                      <Phone className="h-3 w-3 mr-2" />
                      {orderDetails.customer?.phone || orderDetails.customerPhone}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Endereço de entrega */}
          {(orderDetails.shippingAddress || orderDetails.shipping?.address) && (
            <Card className="bg-white shadow-sm border border-slate-100">
              <CardContent className="p-5">
                <div className="flex items-center mb-3">
                  <MapPin className="h-4 w-4 text-slate-500 mr-2" />
                  <span className="font-medium text-slate-700 text-sm">Endereço de Entrega</span>
                </div>
                <div className="text-sm text-slate-600 space-y-1">
                  {(() => {
                    const address = orderDetails.shippingAddress || orderDetails.shipping?.address;
                    return (
                      <>
                        <p>{address.street}</p>
                        {address.complement && <p>{address.complement}</p>}
                        <p>{address.neighborhood}</p>
                        <p>{address.city} - {address.state}</p>
                        <p className="font-mono text-xs">{address.zipCode}</p>
                      </>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ✅ Timeline completa das etapas REAIS */}
        {orderDetails.customSteps && orderDetails.customSteps.length > 0 && (
          <Card className="bg-white shadow-sm mb-6 border border-slate-100">
            <CardContent className="p-5">
              <h3 className="font-medium text-slate-800 mb-5">Acompanhamento Detalhado</h3>
              <div className="space-y-5">
                {orderDetails.customSteps.map((step, index) => {
                  const StepIcon = getStepIcon(step.name);
                  const isLast = index === orderDetails.customSteps.length - 1;
                  
                  return (
                    <div key={step.id || index} className="flex items-start relative">
                      {/* Linha conectora */}
                      {!isLast && (
                        <div className={`absolute left-4 top-8 w-0.5 h-6 
                          ${step.completed ? 'bg-emerald-400' : 'bg-slate-200'}`}>
                        </div>
                      )}
                      
                      {/* Ícone do step */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mr-3 border-2 border-white shadow-sm
                        ${step.completed ? 'bg-emerald-500' : 
                          step.current ? 'bg-blue-500' : 'bg-slate-300'}`}>
                        <StepIcon className="h-4 w-4 text-white" />
                      </div>
                      
                      {/* Conteúdo do step */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className={`font-medium text-sm
                            ${step.completed ? 'text-emerald-700' : 
                              step.current ? 'text-blue-700' : 'text-slate-500'}`}>
                            {step.name}
                            {step.current && (
                              <span className="ml-2 inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                                Em andamento
                              </span>
                            )}
                          </h4>
                          
                          {step.completedAt ? (
                            <span className="text-xs text-slate-500">
                              {formatDateShort(step.completedAt)}
                            </span>
                          ) : step.estimatedTime ? (
                            <span className="text-xs text-blue-600 font-medium">
                              ~{step.estimatedTime}
                            </span>
                          ) : null}
                        </div>
                        
                        {step.description && (
                          <p className={`text-sm
                            ${step.completed ? 'text-emerald-600' : 
                              step.current ? 'text-blue-600' : 'text-slate-400'}`}>
                            {step.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ✅ Padding para bottom navigation */}
        <div className="h-20"></div>
      </main>

      {/* ✅ Bottom Navigation com destaque para chat */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/60 px-4 py-2">
        <div className="flex justify-center items-center max-w-sm mx-auto">
          <button 
            className="flex flex-col items-center text-slate-400 p-3"
            onClick={() => navigate('/customer/dashboard')}
          >
            <Package className="h-5 w-5" />
            <span className="text-xs mt-1">Pedidos</span>
          </button>
          
          <button 
            className="flex flex-col items-center text-violet-600 p-3 mx-6 relative bg-violet-50 rounded-lg border border-violet-200"
            onClick={handleOpenChat}
          >
            <MessageSquare className="h-5 w-5" />
            <span className="text-xs mt-1 font-medium">Chat</span>
            {orderDetails.unreadMessages > 0 && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-medium">{orderDetails.unreadMessages}</span>
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

export default OrderDetailsCustomer;