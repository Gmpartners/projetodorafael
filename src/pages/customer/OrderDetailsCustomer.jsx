import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
  HeadphonesIcon,
  ShoppingBag,
  PackageCheck,
  Factory,
  TruckIcon,
  Home,
  Timer,
  Zap,
  Activity,
  CheckCircle2,
  ArrowRight,
  Eye,
  ShieldCheck,
  Gift,
  Settings,
  Target,
  Shield,
  Search
} from 'lucide-react';
import { apiService } from '@/services/apiService';

const OrderDetailsCustomer = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState(null);
  const [pulseStep, setPulseStep] = useState(0);

  // Get customer email from localStorage or state
  const customerEmail = location.state?.customerEmail || localStorage.getItem('customerEmail');
  const storeId = 'E47OkrK3IcNu1Ys8gD4CA29RrHk2';

  // Pulse animation for current step
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseStep(prev => (prev + 1) % 3);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!customerEmail) {
      navigate('/customer/lookup');
      return;
    }

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId, customerEmail, navigate]);

  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔍 Fetching order details:', orderId, 'for email:', customerEmail);

      const progressData = await apiService.getOrderProgressByEmail(orderId, customerEmail);
      
      if (progressData.success && progressData.data) {
        const orderData = progressData.data;
        console.log('✅ Order details loaded:', orderData);
        setOrderDetails(orderData.orderDetails);
      } else {
        throw new Error('Order not found or access denied');
      }

    } catch (error) {
      console.error('❌ Error loading order details:', error);
      
      if (error.response?.status === 403) {
        setError('You do not have access to this order');
      } else if (error.response?.status === 404) {
        setError('Order not found');
      } else {
        setError(error.message || 'Failed to load order details');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 CORRIGIDO: Função que usa dados REAIS da API
  const getEnhancedSteps = (orderDetails) => {
    const baseProgress = orderDetails.progress || 0;
    
    // ✅ USAR DADOS REAIS: customSteps da API
    if (orderDetails.customSteps && orderDetails.customSteps.length > 0) {
      console.log('📊 Using REAL customSteps from API:', orderDetails.customSteps);
      
      return orderDetails.customSteps.map((step, index) => {
        // Determinar status baseado na API
        let status = 'pending';
        if (step.completed) {
          status = 'completed';
        } else if (step.current || step.active) {
          status = 'current';
        }
        
        // 🔥 CORRIGIDO: Calcular progresso DINÂMICO por etapa
        const totalSteps = orderDetails.customSteps.length;
        const stepProgress = Math.floor((100 / totalSteps) * (index + 1));
        
        return {
          id: index + 1,
          name: step.name,
          description: step.description || `Step ${index + 1} in your order process`,
          icon: getStepIcon(step.name),
          progress: stepProgress,
          status: status,
          estimatedTime: step.estimatedTime || step.scheduledFor || 'Processing',
          color: getStepColor(status, index),
          scheduledDate: step.scheduledDate,
          completedDate: step.completedDate
        };
      });
    }
    
    // ✅ FALLBACK: Se não tiver customSteps, usar estrutura genérica baseada no progresso
    console.log('⚠️  No customSteps found, using fallback based on progress:', baseProgress);
    
    const genericSteps = [
      {
        id: 1,
        name: "Order Placed",
        description: "Your order has been successfully placed and payment confirmed",
        icon: ShoppingBag,
        progress: 16.67,
        status: "completed",
        estimatedTime: "Completed",
        color: "emerald"
      },
      {
        id: 2,
        name: "Order Confirmed",
        description: "We've received your order and are preparing to process it",
        icon: CheckCircle2,
        progress: 33.33,
        status: baseProgress >= 33.33 ? "completed" : "current",
        estimatedTime: baseProgress >= 33.33 ? "Completed" : "Processing",
        color: "emerald"
      },
      {
        id: 3,
        name: "Processing",
        description: "Your order is being prepared and quality checked",
        icon: Settings,
        progress: 50,
        status: baseProgress >= 50 ? "completed" : baseProgress >= 33.33 ? "current" : "pending",
        estimatedTime: baseProgress >= 50 ? "Completed" : "In Progress",
        color: "blue"
      },
      {
        id: 4,
        name: "Packaging",
        description: "Your order is being carefully packaged for shipping",
        icon: Package,
        progress: 66.67,
        status: baseProgress >= 66.67 ? "completed" : baseProgress >= 50 ? "current" : "pending",
        estimatedTime: baseProgress >= 66.67 ? "Completed" : "Processing",
        color: "violet"
      },
      {
        id: 5,
        name: "Shipped",
        description: "Your package is on its way to your delivery address",
        icon: TruckIcon,
        progress: 83.33,
        status: baseProgress >= 83.33 ? "completed" : baseProgress >= 66.67 ? "current" : "pending",
        estimatedTime: baseProgress >= 83.33 ? "Shipped" : "Preparing",
        color: "orange"
      },
      {
        id: 6,
        name: "Delivered",
        description: "Successfully delivered to your address",
        icon: Home,
        progress: 100,
        status: baseProgress >= 100 ? "completed" : baseProgress >= 83.33 ? "current" : "pending",
        estimatedTime: baseProgress >= 100 ? "Delivered" : "In Transit",
        color: "emerald"
      }
    ];

    return genericSteps;
  };

  // Função para determinar ícone baseado no nome da etapa
  const getStepIcon = (stepName) => {
    if (!stepName) return Clock;
    
    const name = stepName.toLowerCase();
    
    // Mapeamento inteligente de nomes para ícones
    if (name.includes('placed') || name.includes('received')) return ShoppingBag;
    if (name.includes('confirmed') || name.includes('accepted')) return CheckCircle2;
    if (name.includes('payment') || name.includes('paid')) return ShieldCheck;
    if (name.includes('processing') || name.includes('preparing')) return Settings;
    if (name.includes('separating') || name.includes('picking')) return Search;
    if (name.includes('quality') || name.includes('check')) return Eye;
    if (name.includes('packaging') || name.includes('packing')) return Package;
    if (name.includes('ready') || name.includes('pickup')) return PackageCheck;
    if (name.includes('shipped') || name.includes('transit') || name.includes('sending')) return TruckIcon;
    if (name.includes('delivery') || name.includes('delivered')) return Home;
    
    // Ícones por posição se não conseguir determinar pelo nome
    return Clock;
  };

  // Função para determinar cor baseada no status
  const getStepColor = (status, index) => {
    if (status === 'completed') return 'emerald';
    if (status === 'current') return 'blue';
    
    // Cores alternadas para etapas pendentes
    const colors = ['blue', 'violet', 'orange', 'amber'];
    return colors[index % colors.length] || 'blue';
  };

  const handleOpenChat = async () => {
    try {
      console.log('💬 Opening chat for order:', {
        orderId: orderId,
        customerEmail: customerEmail,
        storeId: storeId
      });

      navigate(`/customer/chat`, {
        state: {
          orderId: orderId,
          customerEmail: customerEmail,
          orderDetails: orderDetails
        }
      });
      
    } catch (error) {
      console.error('❌ Error opening chat:', error);
      alert('Failed to open chat. Please try again.');
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value || 0);
  };

  // 🔥 CORRIGIDO: Função de formatação de data
  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    try {
      let date;
      if (dateString.seconds) {
        // Timestamp do Firestore
        date = new Date(dateString.seconds * 1000);
      } else if (typeof dateString === 'string') {
        // String ISO
        date = new Date(dateString);
      } else {
        // Objeto Date
        date = new Date(dateString);
      }
      
      // Verificar se a data é válida
      if (isNaN(date.getTime())) {
        return 'Date not available';
      }
      
      return date.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date not available';
    }
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = dateString.seconds ? new Date(dateString.seconds * 1000) : new Date(dateString);
      return date.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  // 🔥 CORRIGIDO: Função para calcular progresso DINÂMICO
  const calculateCurrentProgress = (orderDetails, enhancedSteps) => {
    if (!enhancedSteps || enhancedSteps.length === 0) return 0;
    
    // Se tiver customSteps, usar progresso real
    if (orderDetails.customSteps && orderDetails.customSteps.length > 0) {
      const completedSteps = orderDetails.customSteps.filter(step => step.completed).length;
      const currentStepIndex = orderDetails.customSteps.findIndex(step => step.current || step.active);
      
      if (currentStepIndex >= 0) {
        // Se há etapa atual, calcular progresso até ela
        return Math.floor((100 / orderDetails.customSteps.length) * (currentStepIndex + 0.5));
      } else if (completedSteps > 0) {
        // Se só há etapas completas
        return Math.floor((100 / orderDetails.customSteps.length) * completedSteps);
      }
    }
    
    // Fallback para progresso da API
    return orderDetails.progress || 0;
  };

  const getProgressColor = (progress) => {
    if (progress >= 100) return 'from-emerald-400 via-emerald-500 to-emerald-600';
    if (progress >= 80) return 'from-orange-400 via-orange-500 to-orange-600';
    if (progress >= 60) return 'from-violet-400 via-violet-500 to-violet-600';
    if (progress >= 40) return 'from-blue-400 via-blue-500 to-blue-600';
    return 'from-amber-400 via-amber-500 to-amber-600';
  };

  const getStatusColor = (progress) => {
    if (progress >= 100) return 'text-emerald-600';
    if (progress >= 80) return 'text-orange-600';
    if (progress >= 60) return 'text-violet-600';
    if (progress >= 40) return 'text-blue-600';
    return 'text-amber-600';
  };

  const getStepColorClasses = (step) => {
    const colors = {
      emerald: {
        bg: 'bg-emerald-500',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        glow: 'shadow-emerald-200'
      },
      blue: {
        bg: 'bg-blue-500',
        text: 'text-blue-700',
        border: 'border-blue-200',
        glow: 'shadow-blue-200'
      },
      violet: {
        bg: 'bg-violet-500',
        text: 'text-violet-700',
        border: 'border-violet-200',
        glow: 'shadow-violet-200'
      },
      orange: {
        bg: 'bg-orange-500',
        text: 'text-orange-700',
        border: 'border-orange-200',
        glow: 'shadow-orange-200'
      },
      amber: {
        bg: 'bg-amber-500',
        text: 'text-amber-700',
        border: 'border-amber-200',
        glow: 'shadow-amber-200'
      }
    };
    return colors[step.color] || colors.blue;
  };

  // 🔥 CORRIGIDO: Função para obter número do pedido correto
  const getOrderNumber = (orderDetails) => {
    return orderDetails.externalOrderNumber || 
           orderDetails.orderNumber || 
           (orderDetails.orderId || orderDetails.id || orderDetails.externalOrderId || 'N/A').toString().slice(-6);
  };

  // 🔥 CORRIGIDO: Função para obter nome do produto
  const getProductName = (orderDetails) => {
    return orderDetails.productDetails?.displayName || 
           orderDetails.productDetails?.title || 
           orderDetails.productName || 
           orderDetails.product?.name || 
           'Product';
  };

  // 🔥 CORRIGIDO: Função para obter imagem do produto
  const getProductImage = (orderDetails) => {
    return orderDetails.productDetails?.image || 
           orderDetails.product?.image || 
           null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
            <div className="absolute inset-0 animate-ping">
              <div className="h-8 w-8 bg-blue-200 rounded-full mx-auto opacity-20"></div>
            </div>
          </div>
          <p className="text-slate-600 text-sm font-medium">Loading order details...</p>
          <p className="text-xs text-slate-400 mt-1">Order: {orderId}</p>
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
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Order not found</h3>
            <p className="text-slate-500 mb-4 text-sm">{error || 'This order does not exist or you do not have access to it.'}</p>
            <div className="space-y-2">
              <Button onClick={() => navigate('/customer/dashboard')} className="w-full bg-blue-600 hover:bg-blue-700">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Orders
              </Button>
              <Button onClick={fetchOrderDetails} variant="outline" className="w-full">
                <Loader2 className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ✅ USAR DADOS REAIS: Obter etapas da API
  const enhancedSteps = getEnhancedSteps(orderDetails);
  const currentStepIndex = enhancedSteps.findIndex(step => step.status === 'current');
  const completedSteps = enhancedSteps.filter(step => step.status === 'completed').length;
  
  // 🔥 CORRIGIDO: Calcular progresso DINÂMICO
  const currentProgress = calculateCurrentProgress(orderDetails, enhancedSteps);

  // ✅ DADOS REAIS: Status atual baseado na API
  const currentStepName = orderDetails.currentStepName || 
                          enhancedSteps.find(s => s.status === 'current')?.name || 
                          'Processing';

  // 🔥 CORRIGIDO: Dados do produto
  const productName = getProductName(orderDetails);
  const productImage = getProductImage(orderDetails);
  const orderNumber = getOrderNumber(orderDetails);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 🔥 CORRIGIDO: Header focado no PRODUTO */}
      <header className="bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 px-4 pt-8 pb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-10 -translate-x-10 animate-pulse delay-500"></div>
        <div className="absolute top-1/2 right-1/4 w-6 h-6 bg-white/10 rounded-full animate-bounce delay-1000"></div>
        
        <div className="relative z-10">
          <div className="flex items-center mb-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/customer/dashboard')}
              className="text-white/80 hover:text-white hover:bg-white/10 p-2 mr-3 rounded-lg transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-white text-lg font-medium">Order Details</h1>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {/* 🔥 CORRIGIDO: Imagem do PRODUTO */}
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-3 backdrop-blur-sm border border-white/20 shadow-lg overflow-hidden">
                {productImage ? (
                  <img 
                    src={productImage} 
                    alt={productName}
                    className="w-full h-full object-cover rounded-xl"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`${productImage ? 'hidden' : 'flex'} items-center justify-center text-xl w-full h-full`}>
                  📦
                </div>
              </div>
              <div>
                <div className="flex items-center">
                  {/* 🔥 CORRIGIDO: Nome do PRODUTO */}
                  <h2 className="text-white text-lg font-medium mr-2">
                    {productName}
                  </h2>
                  <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center animate-pulse">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div className="flex items-center mt-1">
                  <span className="text-blue-100 text-sm flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {/* 🔥 CORRIGIDO: Número do pedido */}
                    Order #{orderNumber}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-5 -mt-3 relative z-10">
        {/* ✅ DADOS REAIS: Order Progress Card */}
        <Card className="bg-white shadow-lg mb-6 border-0 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-1">
            <CardContent className="p-6 bg-white m-0 rounded-lg">
              <div className="flex justify-between items-center mb-6">
                <div>
                  {/* 🔥 CORRIGIDO: Nome do produto no título */}
                  <h3 className="text-blue-600 font-semibold text-xl flex items-center">
                    <Sparkles className="h-5 w-5 mr-2 text-blue-500" />
                    {productName}
                  </h3>
                  <p className="text-slate-500 text-sm mt-1">
                    {/* 🔥 CORRIGIDO: Data formatada */}
                    Created on {formatDate(orderDetails.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  {/* 🔥 CORRIGIDO: Progresso dinâmico */}
                  <div className={`text-2xl font-bold ${getStatusColor(currentProgress)}`}>
                    {currentProgress}%
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {completedSteps} of {enhancedSteps.length} steps
                  </div>
                </div>
              </div>
              
              {/* Enhanced Progress Bar with Segments */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-semibold text-sm ${getStatusColor(currentProgress)} flex items-center`}>
                    <Activity className="h-4 w-4 mr-1" />
                    {currentProgress >= 100 ? 'Order Completed!' : currentStepName}
                  </span>
                  <span className="text-slate-600 font-medium text-sm flex items-center">
                    <Timer className="h-3 w-3 mr-1" />
                    {currentProgress >= 100 ? 'Delivered' : 
                     enhancedSteps.find(s => s.status === 'current')?.estimatedTime || 'Processing...'}
                  </span>
                </div>
                
                {/* 🔥 CORRIGIDO: Progress bar com progresso dinâmico */}
                <div className="relative">
                  <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden shadow-inner">
                    <div 
                      className={`h-4 rounded-full bg-gradient-to-r ${getProgressColor(currentProgress)} transition-all duration-1000 ease-out relative overflow-hidden`}
                      style={{ width: `${currentProgress}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20 animate-shimmer"></div>
                    </div>
                  </div>
                  
                  {/* 🔥 CORRIGIDO: Progress markers dinâmicos */}
                  <div className="flex justify-between mt-2">
                    {enhancedSteps.map((step, index) => {
                      const stepPercentage = Math.floor((100 / enhancedSteps.length) * (index + 1));
                      return (
                        <div key={index} className="flex flex-col items-center">
                          <div className={`w-2 h-2 rounded-full ${currentProgress >= stepPercentage ? 'bg-blue-500' : 'bg-slate-300'} transition-colors duration-500`}></div>
                          <span className="text-xs text-slate-400 mt-1">{stepPercentage}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              {/* Current Step Description */}
              {enhancedSteps.find(s => s.status === 'current') && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200/20 rounded-full -translate-y-10 translate-x-10"></div>
                  <div className="relative flex items-start">
                    <div className={`p-2 rounded-lg mr-3 ${getStepColorClasses(enhancedSteps.find(s => s.status === 'current')).bg} shadow-lg`}>
                      {React.createElement(enhancedSteps.find(s => s.status === 'current').icon, {
                        className: "h-5 w-5 text-white"
                      })}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-800 mb-1 flex items-center">
                        Currently: {enhancedSteps.find(s => s.status === 'current').name}
                        <div className="ml-2 flex space-x-1">
                          <div className={`w-2 h-2 bg-blue-500 rounded-full animate-pulse ${pulseStep === 0 ? 'opacity-100' : 'opacity-30'}`}></div>
                          <div className={`w-2 h-2 bg-blue-500 rounded-full animate-pulse ${pulseStep === 1 ? 'opacity-100' : 'opacity-30'}`}></div>
                          <div className={`w-2 h-2 bg-blue-500 rounded-full animate-pulse ${pulseStep === 2 ? 'opacity-100' : 'opacity-30'}`}></div>
                        </div>
                      </h4>
                      <p className="text-slate-600 text-sm mb-2">
                        {enhancedSteps.find(s => s.status === 'current').description}
                      </p>
                      <div className="flex items-center text-xs text-slate-500">
                        <Clock className="h-3 w-3 mr-1" />
                        Estimated completion: {enhancedSteps.find(s => s.status === 'current').estimatedTime}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </div>
        </Card>

        {/* ✅ DADOS REAIS: Enhanced Timeline */}
        <Card className="bg-white shadow-lg mb-6 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-slate-800 text-lg flex items-center">
                <Zap className="h-5 w-5 mr-2 text-blue-500" />
                Order Journey
                {orderDetails.customSteps && orderDetails.customSteps.length > 0 && (
                  <span className="ml-2 bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                    Real-time
                  </span>
                )}
              </h3>
              <div className="text-sm text-slate-500 bg-slate-50 px-3 py-1 rounded-full">
                {completedSteps}/{enhancedSteps.length} completed
              </div>
            </div>
            
            <div className="space-y-4">
              {enhancedSteps.map((step, index) => {
                const isLast = index === enhancedSteps.length - 1;
                const colors = getStepColorClasses(step);
                
                return (
                  <div key={step.id} className="flex items-start relative group">
                    {/* Connecting line */}
                    {!isLast && (
                      <div className={`absolute left-6 top-12 w-0.5 h-8 transition-all duration-500
                        ${step.status === 'completed' ? 'bg-gradient-to-b from-emerald-400 to-emerald-500' : 
                          step.status === 'current' ? 'bg-gradient-to-b from-blue-400 to-blue-300' : 
                          'bg-slate-200'}`}>
                        {step.status === 'current' && (
                          <div className="absolute inset-0 bg-gradient-to-b from-blue-400 to-blue-300 animate-pulse"></div>
                        )}
                      </div>
                    )}
                    
                    {/* Step icon with enhanced styling */}
                    <div className="relative">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 mr-4 border-2 transition-all duration-300 shadow-lg
                        ${step.status === 'completed' ? `${colors.bg} border-emerald-200 ${colors.glow} shadow-lg` : 
                          step.status === 'current' ? `${colors.bg} border-blue-200 shadow-blue-200 shadow-lg animate-pulse` : 
                          'bg-slate-100 border-slate-200 shadow-sm'}`}>
                        {React.createElement(step.icon, {
                          className: `h-6 w-6 transition-colors duration-300 ${
                            step.status === 'completed' || step.status === 'current' ? 'text-white' : 'text-slate-400'
                          }`
                        })}
                        
                        {/* Animated ring for current step */}
                        {step.status === 'current' && (
                          <div className="absolute inset-0 rounded-xl border-2 border-blue-300 animate-ping"></div>
                        )}
                        
                        {/* Completion checkmark overlay */}
                        {step.status === 'completed' && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white">
                            <CheckCircle2 className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Step content with enhanced styling */}
                    <div className="flex-1 min-w-0 pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <h4 className={`font-semibold text-base transition-colors duration-300
                            ${step.status === 'completed' ? colors.text : 
                              step.status === 'current' ? 'text-blue-700' : 'text-slate-500'}`}>
                            {step.name}
                          </h4>
                          
                          {step.status === 'current' && (
                            <div className="ml-3 flex items-center">
                              <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium animate-pulse">
                                In Progress
                              </span>
                              <div className="ml-2 flex space-x-1">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                              </div>
                            </div>
                          )}
                          
                          {step.status === 'completed' && (
                            <CheckCircle className="ml-2 h-4 w-4 text-emerald-500" />
                          )}
                        </div>
                        
                        <div className="text-right">
                          {step.status === 'completed' ? (
                            <div className="flex items-center text-emerald-600">
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              <span className="text-sm font-medium">Done</span>
                            </div>
                          ) : (
                            <span className={`text-sm font-medium
                              ${step.status === 'current' ? 'text-blue-600' : 'text-slate-400'}`}>
                              {step.estimatedTime}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <p className={`text-sm mb-3 transition-colors duration-300
                        ${step.status === 'completed' ? 'text-emerald-600' : 
                          step.status === 'current' ? 'text-blue-600' : 'text-slate-400'}`}>
                        {step.description}
                      </p>
                      
                      {/* Progress indicator for current step */}
                      {step.status === 'current' && (
                        <div className="w-full bg-blue-100 rounded-full h-2 overflow-hidden">
                          <div className="h-2 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full animate-pulse" style={{width: '60%'}}></div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Chat with store - Enhanced */}
        <Card className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 shadow-lg mb-6 border-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/20 rounded-full -translate-y-16 translate-x-16"></div>
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-800 text-lg">Chat with Store</h3>
                  <p className="text-blue-600 text-sm">Ask questions about your order</p>
                </div>
              </div>
              {(orderDetails.unreadMessages || 0) > 0 && (
                <div className="relative">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                    <span className="text-sm text-white font-bold">{orderDetails.unreadMessages}</span>
                  </div>
                  <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-50"></div>
                </div>
              )}
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-blue-200 mb-4 shadow-sm">
              <div className="flex items-start">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <HeadphonesIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-sm">
                  <p className="text-blue-800 font-semibold mb-1 flex items-center">
                    Customer Support Available
                    <div className="ml-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </p>
                  <p className="text-blue-700">
                    Our team is ready to help with questions about delivery, 
                    products, or any issues related to your order.
                  </p>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleOpenChat}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
              size="lg"
            >
              <MessageSquare className="h-5 w-5 mr-2" />
              Start Conversation
              <Send className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* ✅ DADOS REAIS: Product details */}
        <Card className="bg-white shadow-lg mb-6 border-0">
          <CardContent className="p-6">
            <h3 className="text-slate-800 font-semibold mb-5 text-lg flex items-center">
              <Gift className="h-5 w-5 mr-2 text-slate-600" />
              Product Details
            </h3>
            
            <div className="flex items-center">
              {/* 🔥 CORRIGIDO: Imagem do produto */}
              {productImage ? (
                <div className="w-20 h-20 rounded-xl mr-4 flex-shrink-0 border border-blue-100 shadow-sm overflow-hidden">
                  <img 
                    src={productImage} 
                    alt={productName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="hidden w-full h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 items-center justify-center text-3xl">
                    📦
                  </div>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center text-3xl mr-4 flex-shrink-0 border border-blue-100 shadow-sm">
                  📦
                </div>
              )}
              
              <div className="flex-1">
                {/* 🔥 CORRIGIDO: Nome do produto */}
                <h4 className="font-semibold text-slate-800 text-lg">
                  {productName}
                </h4>
                <p className="text-slate-600 text-sm mt-1 mb-3">
                  {orderDetails.productDetails?.description || 
                   orderDetails.product?.description || 
                   orderDetails.description ||
                   'Store product'}
                </p>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center">
                    <span className="text-sm text-slate-500 mr-1">Quantity:</span>
                    <span className="font-semibold text-slate-800">
                      {orderDetails.productDetails?.quantity || orderDetails.quantity || 1}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-slate-500 mr-1">Total:</span>
                    <span className="font-bold text-lg text-blue-600">
                      {formatCurrency(
                        orderDetails.totalValue || 
                        orderDetails.productDetails?.price || 
                        orderDetails.price || 
                        0
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ✅ DADOS REAIS: Customer and address info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {(orderDetails.customer || orderDetails.customerName || customerEmail) && (
            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-5">
                <div className="flex items-center mb-4">
                  <User className="h-5 w-5 text-slate-500 mr-2" />
                  <span className="font-semibold text-slate-700">Customer Information</span>
                </div>
                <div className="space-y-3">
                  <p className="text-slate-900 font-semibold">
                    {orderDetails.customer?.name || orderDetails.customerName || 'Customer'}
                  </p>
                  <p className="text-slate-600 text-sm flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-slate-400" />
                    {orderDetails.customerEmail || customerEmail}
                  </p>
                  {orderDetails.customer?.phone && (
                    <p className="text-slate-600 text-sm flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-slate-400" />
                      {orderDetails.customer.phone}
                    </p>
                  )}
                  {orderDetails.customer?.documentId && (
                    <p className="text-slate-600 text-sm flex items-center">
                      <User className="h-4 w-4 mr-2 text-slate-400" />
                      ID: {orderDetails.customer.documentId}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
          {orderDetails.shippingAddress && (
            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-5">
                <div className="flex items-center mb-4">
                  <MapPin className="h-5 w-5 text-slate-500 mr-2" />
                  <span className="font-semibold text-slate-700">Shipping Address</span>
                </div>
                <div className="text-sm text-slate-600 space-y-1">
                  <p className="font-medium">{orderDetails.shippingAddress.street}</p>
                  {orderDetails.shippingAddress.complement && 
                    <p>{orderDetails.shippingAddress.complement}</p>
                  }
                  {orderDetails.shippingAddress.neighborhood && 
                    <p>{orderDetails.shippingAddress.neighborhood}</p>
                  }
                  <p>{orderDetails.shippingAddress.city} - {orderDetails.shippingAddress.state}</p>
                  <p className="font-mono text-xs bg-slate-100 inline-block px-2 py-1 rounded">
                    {orderDetails.shippingAddress.zipCode}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="h-20"></div>
      </main>

      {/* Enhanced Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/60 px-4 py-3 shadow-lg">
        <div className="flex justify-center items-center max-w-sm mx-auto">
          <button 
            className="flex flex-col items-center text-slate-400 p-3 rounded-lg transition-all duration-200 hover:bg-slate-50"
            onClick={() => navigate('/customer/dashboard')}
          >
            <Package className="h-5 w-5" />
            <span className="text-xs mt-1">Orders</span>
          </button>
          
          <button 
            className="flex flex-col items-center text-blue-600 p-3 mx-6 relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm transition-all duration-200 hover:shadow-md"
            onClick={handleOpenChat}
          >
            <MessageSquare className="h-5 w-5" />
            <span className="text-xs mt-1 font-medium">Chat</span>
            {(orderDetails.unreadMessages || 0) > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-xs text-white font-bold">{orderDetails.unreadMessages}</span>
              </div>
            )}
          </button>
          
          <button 
            className="flex flex-col items-center text-slate-400 p-3 rounded-lg transition-all duration-200 hover:bg-slate-50"
            onClick={() => navigate('/customer/lookup')}
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-xs mt-1">Back</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsCustomer;