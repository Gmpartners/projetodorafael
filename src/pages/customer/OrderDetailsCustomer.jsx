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
  Search,
  RefreshCw
} from 'lucide-react';
import { apiService } from '@/services/apiService';
import { 
  formatDate, 
  formatRelativeTime, 
  formatDuration, 
  formatStepDate,
  shouldShowStepTime,
  formatStepTime,
  isValidDate 
} from '@/utils/dateFormatter';

const OrderDetailsCustomer = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState(null);
  const [pulseStep, setPulseStep] = useState(0);

  const customerEmail = location.state?.customerEmail || localStorage.getItem('customerEmail');

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

  const getEnhancedSteps = (orderDetails) => {
    const baseProgress = orderDetails.progress || 0;
    
    if (orderDetails.customSteps && orderDetails.customSteps.length > 0) {
      console.log('📊 Using REAL customSteps from API:', orderDetails.customSteps);
      
      return orderDetails.customSteps.map((step, index) => {
        let status = 'pending';
        if (step.completed) {
          status = 'completed';
        } else if (step.current || step.active) {
          status = 'current';
        }
        
        const formattedDate = formatStepDate(step);
        const showTime = shouldShowStepTime(step);
        const timeDisplay = showTime ? formatStepTime(step) : "";
        
        const totalSteps = orderDetails.customSteps.length;
        const stepProgress = Math.floor((100 / totalSteps) * (index + 1));
        
        return {
          id: index + 1,
          name: translateStepName(step.name),
          description: translateStepDescription(step.description || `Step ${index + 1} of your order`),
          icon: getStepIcon(step.name),
          progress: stepProgress,
          status: status,
          estimatedTime: translateEstimatedTime(formattedDate),
          timeDisplay: timeDisplay,
          showTime: showTime,
          color: getStepColor(status, index),
          scheduledAt: step.scheduledAt,
          completedAt: step.completedAt,
          estimatedDuration: step.estimatedDuration
        };
      });
    }
    
    console.log('⚠️  No customSteps found, using fallback based on progress:', baseProgress);
    
    const genericSteps = [
      {
        id: 1,
        name: "Order Placed",
        description: "Your order has been successfully placed",
        icon: ShoppingBag,
        progress: 16.67,
        status: "completed",
        estimatedTime: "Completed",
        showTime: false,
        color: "emerald"
      },
      {
        id: 2,
        name: "Confirmed",
        description: "We received your order and are preparing it",
        icon: CheckCircle2,
        progress: 33.33,
        status: baseProgress >= 33.33 ? "completed" : "current",
        estimatedTime: baseProgress >= 33.33 ? "Completed" : "Processing",
        showTime: false,
        color: "emerald"
      },
      {
        id: 3,
        name: "Preparing",
        description: "Your order is being carefully prepared",
        icon: Settings,
        progress: 50,
        status: baseProgress >= 50 ? "completed" : baseProgress >= 33.33 ? "current" : "pending",
        estimatedTime: baseProgress >= 50 ? "Completed" : "Est: 2 hours",
        showTime: false,
        color: "blue"
      },
      {
        id: 4,
        name: "Packaging",
        description: "Product being packaged for shipping",
        icon: Package,
        progress: 66.67,
        status: baseProgress >= 66.67 ? "completed" : baseProgress >= 50 ? "current" : "pending",
        estimatedTime: baseProgress >= 66.67 ? "Completed" : "Est: 4 hours",
        showTime: false,
        color: "violet"
      },
      {
        id: 5,
        name: "Shipped",
        description: "Your order is on its way",
        icon: TruckIcon,
        progress: 83.33,
        status: baseProgress >= 83.33 ? "completed" : baseProgress >= 66.67 ? "current" : "pending",
        estimatedTime: baseProgress >= 83.33 ? "Shipped" : "Est: 1 day",
        showTime: false,
        color: "orange"
      },
      {
        id: 6,
        name: "Delivered",
        description: "Order successfully delivered",
        icon: Home,
        progress: 100,
        status: baseProgress >= 100 ? "completed" : baseProgress >= 83.33 ? "current" : "pending",
        estimatedTime: baseProgress >= 100 ? "Delivered" : "Est: 3 days",
        showTime: false,
        color: "emerald"
      }
    ];

    return genericSteps;
  };

  const translateStepName = (stepName) => {
    if (!stepName) return "Processing";
    
    const translations = {
      'Pedido Realizado': 'Order Placed',
      'Pedido Recebido': 'Order Received',
      'Pedido Confirmado': 'Order Confirmed',
      'Confirmado': 'Confirmed',
      'Aceito': 'Accepted',
      'Pagamento': 'Payment',
      'Pago': 'Paid',
      'Processando': 'Processing',
      'Preparando': 'Preparing',
      'Em Preparação': 'Preparing',
      'Preparando Envio': 'Preparing Shipping',
      'Separando': 'Picking',
      'Qualidade': 'Quality Check',
      'Conferindo': 'Checking',
      'Embalando': 'Packaging',
      'Empacotando': 'Packaging',
      'Pronto': 'Ready',
      'Despachado': 'Dispatched',
      'Enviado': 'Shipped',
      'Produto Enviado': 'Product Shipped',
      'Em Trânsito': 'In Transit',
      'Transportadora': 'With Carrier',
      'Saiu para Entrega': 'Out for Delivery',
      'Entregue': 'Delivered',
      'Finalizado': 'Completed'
    };
    
    return translations[stepName] || stepName;
  };

  const translateStepDescription = (description) => {
    if (!description) return "Processing your order";
    
    const translations = {
      'Seu pedido foi realizado com sucesso': 'Your order has been successfully placed',
      'Pedido recebido e confirmado no sistema': 'Order received and confirmed in system',
      'Recebemos seu pedido e estamos preparando': 'We received your order and are preparing it',
      'Seu pedido está sendo preparado com cuidado': 'Your order is being carefully prepared',
      'Produto sendo preparado para envio': 'Product being prepared for shipping',
      'Produto sendo embalado para envio': 'Product being packaged for shipping',
      'Produto despachado e em trânsito': 'Product dispatched and in transit',
      'Seu pedido está a caminho': 'Your order is on its way',
      'Pedido entregue com sucesso': 'Order successfully delivered',
      'Em processamento': 'Processing'
    };
    
    return translations[description] || description;
  };

  const translateEstimatedTime = (timeText) => {
    if (!timeText) return "Processing";
    
    const translations = {
      'Aguardando': 'Pending',
      'Em processamento': 'Processing',
      'Processando': 'Processing',
      'Concluído': 'Completed',
      'Finalizado': 'Completed',
      'Entregue': 'Delivered',
      'A caminho': 'On the way',
      'Em andamento': 'In progress'
    };
    
    return translations[timeText] || timeText;
  };

  const translateRelativeTime = (timeText) => {
    if (!timeText) return timeText;
    
    // Traduzir expressões de tempo relativo
    let translated = timeText;
    
    translated = translated.replace(/há (\d+) dia/g, '$1 day ago');
    translated = translated.replace(/há (\d+) dias/g, '$1 days ago');
    translated = translated.replace(/há (\d+) hora/g, '$1 hour ago');
    translated = translated.replace(/há (\d+) horas/g, '$1 hours ago');
    translated = translated.replace(/há (\d+) minuto/g, '$1 minute ago');
    translated = translated.replace(/há (\d+) minutos/g, '$1 minutes ago');
    
    // Traduzir meses
    translated = translated.replace('jan', 'Jan');
    translated = translated.replace('fev', 'Feb');
    translated = translated.replace('mar', 'Mar');
    translated = translated.replace('abr', 'Apr');
    translated = translated.replace('mai', 'May');
    translated = translated.replace('jun', 'Jun');
    translated = translated.replace('jul', 'Jul');
    translated = translated.replace('ago', 'Aug');
    translated = translated.replace('set', 'Sep');
    translated = translated.replace('out', 'Oct');
    translated = translated.replace('nov', 'Nov');
    translated = translated.replace('dez', 'Dec');
    
    // Traduzir "Completed"
    translated = translated.replace('Completed', 'Completed');
    
    return translated;
  };

  const getStepIcon = (stepName) => {
    if (!stepName) return Clock;
    
    const name = stepName.toLowerCase();
    
    if (name.includes('pedido') && (name.includes('realizado') || name.includes('recebido') || name.includes('confirmado'))) return ShoppingBag;
    if (name.includes('confirmad') || name.includes('aceito')) return CheckCircle2;
    if (name.includes('pagamento') || name.includes('pago')) return ShieldCheck;
    if (name.includes('processando') || name.includes('preparando')) return Settings;
    if (name.includes('separando') || name.includes('picking')) return Search;
    if (name.includes('qualidade') || name.includes('conferindo')) return Eye;
    if (name.includes('embalando') || name.includes('empacotando')) return Package;
    if (name.includes('pronto') || name.includes('despachado')) return PackageCheck;
    if (name.includes('enviado') || name.includes('transito') || name.includes('transportadora')) return TruckIcon;
    if (name.includes('saiu') && name.includes('entrega')) return TruckIcon;
    if (name.includes('entregue') || name.includes('finalizado')) return Home;
    
    return Clock;
  };

  const getStepColor = (status, index) => {
    if (status === 'completed') return 'emerald';
    if (status === 'current') return 'blue';
    
    const colors = ['blue', 'violet', 'orange', 'amber'];
    return colors[index % colors.length] || 'blue';
  };

  const handleOpenChat = async () => {
    try {
      console.log('💬 Opening chat for order:', {
        orderId: orderId,
        customerEmail: customerEmail,
        storeId: orderDetails?.storeId || location.state?.storeId
      });

      navigate(`/customer/chat`, {
        state: {
          orderId: orderId,
          customerEmail: customerEmail,
          orderDetails: orderDetails,
          storeId: orderDetails?.storeId,        }
      });
      
    } catch (error) {
      console.error('❌ Error opening chat:', error);
      alert('Failed to open chat. Please try again.');
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const calculateCurrentProgress = (orderDetails, enhancedSteps) => {
    if (!enhancedSteps || enhancedSteps.length === 0) return 0; // Default para teste
    
    if (orderDetails.customSteps && orderDetails.customSteps.length > 0) {
      const completedSteps = orderDetails.customSteps.filter(step => step.completed).length;
      const currentStepIndex = orderDetails.customSteps.findIndex(step => step.current || step.active);
      
      if (currentStepIndex >= 0) {
        return Math.floor((100 / orderDetails.customSteps.length) * (currentStepIndex + 0.5));
      } else if (completedSteps > 0) {
        return Math.floor((100 / orderDetails.customSteps.length) * completedSteps);
      }
    }
    
    // Garantir que sempre retorne um valor maior que 0 para mostrar a cor
    return orderDetails.progress || 0;
  };

  // Simplificada para sempre retornar azul
  const getProgressColor = (progress) => {
    if (progress >= 100) return 'bg-emerald-500';
    return 'bg-blue-500'; // Azul sólido sempre
  };

  const getStatusColor = (progress) => {
    if (progress >= 100) return 'text-emerald-600';
    return 'text-blue-600';
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

  const getOrderNumber = (orderDetails) => {
    return orderDetails.externalOrderNumber || 
           orderDetails.orderNumber || 
           (orderDetails.orderId || orderDetails.id || orderDetails.externalOrderId || 'N/A').toString().slice(-6);
  };

  const getProductName = (orderDetails) => {
    return orderDetails.productDetails?.displayName || 
           orderDetails.productDetails?.title || 
           orderDetails.productName || 
           orderDetails.product?.name || 
           'Product';
  };

  const getProductImage = (orderDetails) => {
    return orderDetails.productDetails?.image || 
           orderDetails.product?.image || 
           null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
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
            <p className="text-slate-500 mb-4 text-sm">{error || 'This order does not exist or you do not have access.'}</p>
            <div className="space-y-2">
              <Button onClick={() => navigate('/customer/dashboard')} className="w-full bg-blue-600 hover:bg-blue-700">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Orders
              </Button>
              <Button onClick={fetchOrderDetails} variant="outline" className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const enhancedSteps = getEnhancedSteps(orderDetails);
  const currentStepIndex = enhancedSteps.findIndex(step => step.status === 'current');
  const completedSteps = enhancedSteps.filter(step => step.status === 'completed').length;
  const currentProgress = calculateCurrentProgress(orderDetails, enhancedSteps);
  const currentStepName = translateStepName(orderDetails.currentStepName || 
                          enhancedSteps.find(s => s.status === 'current')?.name || 
                          'Processing');
  const productName = getProductName(orderDetails);
  const productImage = getProductImage(orderDetails);
  const orderNumber = getOrderNumber(orderDetails);

  console.log('🎯 Debug Progress:', {
    currentProgress,
    orderDetailsProgress: orderDetails.progress,
    enhancedSteps: enhancedSteps.length,
    completedSteps
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 px-3 sm:px-4 pt-6 sm:pt-8 pb-4 sm:pb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-white/5 rounded-full -translate-y-12 sm:-translate-y-16 translate-x-12 sm:translate-x-16 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-16 sm:w-20 h-16 sm:h-20 bg-white/5 rounded-full translate-y-8 sm:translate-y-10 -translate-x-8 sm:-translate-x-10 animate-pulse delay-500"></div>
        <div className="absolute top-1/2 right-1/4 w-4 sm:w-6 h-4 sm:h-6 bg-white/10 rounded-full animate-bounce delay-1000"></div>
        
        <div className="relative z-10">
          <div className="flex items-center mb-3 sm:mb-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/customer/dashboard')}
              className="text-white/80 hover:text-white hover:bg-white/10 p-2 mr-2 sm:mr-3 rounded-lg transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-white text-base sm:text-lg font-medium">Order Details</h1>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center mr-3 backdrop-blur-sm border border-white/20 shadow-lg overflow-hidden">
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
                  <Package className="h-5 w-5 sm:h-6 sm:w-6 text-white/80" />
                </div>
              </div>
              <div>
                <div className="flex items-center">
                  <h2 className="text-white text-base sm:text-lg font-medium mr-2 truncate max-w-[200px] sm:max-w-none">
                    {productName}
                  </h2>
                  <div className="w-4 h-4 sm:w-5 sm:h-5 bg-emerald-500 rounded-full flex items-center justify-center animate-pulse">
                    <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                  </div>
                </div>
                <div className="flex items-center mt-1">
                  <span className="text-blue-100 text-xs sm:text-sm flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {orderDetails.createdAt && isValidDate(orderDetails.createdAt) ? formatDate(orderDetails.createdAt, 'date') : new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </span>
                  <span className="mx-2 text-blue-200">•</span>
                  <span className="text-blue-100 text-xs sm:text-sm truncate">
                    Order #{orderNumber}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="px-3 sm:px-4 py-4 sm:py-5 -mt-3 relative z-10">
        {/* 🆕 CONTACT STORE MOVED TO TOP */}
        <Card className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 shadow-lg mb-4 sm:mb-6 border-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-blue-200/20 rounded-full -translate-y-12 sm:-translate-y-16 translate-x-12 sm:translate-x-16"></div>
          <CardContent className="p-4 sm:p-6 relative">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-3 sm:mr-4 shadow-lg">
                  <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-800 text-base sm:text-lg">Contact Store</h3>
                  <p className="text-blue-600 text-xs sm:text-sm">Ask questions about your order</p>
                </div>
              </div>
              {(orderDetails.unreadMessages || 0) > 0 && (
                <div className="relative">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                    <span className="text-xs sm:text-sm text-white font-bold">{orderDetails.unreadMessages}</span>
                  </div>
                  <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-50"></div>
                </div>
              )}
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm p-3 sm:p-4 rounded-xl border border-blue-200 mb-3 sm:mb-4 shadow-sm">
              <div className="flex items-start">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <HeadphonesIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
                <div className="text-xs sm:text-sm">
                  <p className="text-blue-800 font-semibold mb-1 flex items-center">
                    Support Available
                    <div className="ml-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </p>
                  <p className="text-blue-700 leading-relaxed">
                    Our team is ready to help with questions about delivery, 
                    products or any issue regarding your order.
                  </p>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleOpenChat}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg transition-all duration-200 transform hover:scale-[1.02] h-11 sm:h-12"
              size="lg"
            >
              <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Start Conversation
              <Send className="h-3 w-3 sm:h-4 sm:w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* 🎯 ORDER TRACKING CARD - CORRIGIDA E MAIS ELEGANTE */}
        <Card className="bg-white shadow-lg mb-4 sm:mb-6 border-0 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-1">
            <CardContent className="p-4 sm:p-6 bg-white m-0 rounded-lg">
              <div className="flex justify-between items-start sm:items-center mb-4 sm:mb-6">
                <div>
                  <h3 className="text-blue-600 font-semibold text-lg sm:text-xl flex items-center">
                    <Activity className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-500" />
                    Order Tracking
                  </h3>
                  <p className="text-slate-500 text-xs sm:text-sm mt-1">
                    Order placed {formatRelativeTime(orderDetails.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <div className={`text-xl sm:text-2xl font-bold ${getStatusColor(currentProgress)}`}>
                    {currentProgress}%
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {completedSteps} of {enhancedSteps.length} steps
                  </div>
                </div>
              </div>
              
              <div className="mb-4 sm:mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className={`font-semibold text-sm ${getStatusColor(currentProgress)} flex items-center`}>
                    <Zap className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    {currentProgress >= 100 ? 'Order Completed!' : currentStepName}
                  </span>
                  <span className="text-slate-600 font-medium text-xs sm:text-sm flex items-center">
                    <Timer className="h-3 w-3 mr-1" />
                    {currentProgress >= 100 ? 'Delivered' : 
                     translateEstimatedTime(enhancedSteps.find(s => s.status === 'current')?.estimatedTime) || 'Processing...'}
                  </span>
                </div>
                
                {/* 🎯 BARRA DE PROGRESSO ELEGANTE E FINA */}
                <div className="relative mb-4">
                  {/* Background da barra - mais fina */}
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    {/* Barra de progresso azul - mais fina */}
                    <div 
                      className={`h-3 rounded-full ${getProgressColor(currentProgress)} transition-all duration-1000 ease-out relative`}
                      style={{ width: `${currentProgress}%` }}
                    >
                      {/* Efeito shimmer sutil */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                      
                      {/* Indicador ativo (bolinha branca) - menor */}
                      {currentProgress > 0 && currentProgress < 100 && (
                        <div className="absolute top-1/2 right-0 w-2.5 h-2.5 bg-white rounded-full transform translate-x-1/2 -translate-y-1/2 shadow-sm border border-blue-500"></div>
                      )}
                    </div>
                  </div>
                  
                  {/* Pontos de progresso abaixo da barra - menores e alinhados */}
                  <div className="flex justify-between mt-2 px-0.5">
                    {enhancedSteps.map((step, index) => {
                      const stepPercentage = Math.floor((100 / enhancedSteps.length) * (index + 1));
                      const isActive = currentProgress >= stepPercentage;
                      const isCurrent = step.status === 'current';
                      
                      return (
                        <div key={index} className="flex flex-col items-center min-w-0">
                          <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 relative ${
                            isActive 
                              ? 'bg-blue-500 scale-110' 
                              : 'bg-gray-300'
                          }`}>
                            {isCurrent && (
                              <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75"></div>
                            )}
                          </div>
                          <span className={`text-xs mt-1.5 text-center max-w-[50px] truncate ${
                            isActive ? 'text-blue-600 font-medium' : 'text-gray-500'
                          }`}>
                            {step.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              {/* Card do status atual */}
              {enhancedSteps.find(s => s.status === 'current') && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 sm:p-4 rounded-xl border border-blue-200 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 sm:w-20 h-16 sm:h-20 bg-blue-200/20 rounded-full -translate-y-8 sm:-translate-y-10 translate-x-8 sm:translate-x-10"></div>
                  <div className="relative flex items-start">
                    <div className={`p-2 rounded-lg mr-3 ${getStepColorClasses(enhancedSteps.find(s => s.status === 'current')).bg} shadow-lg`}>
                      {React.createElement(enhancedSteps.find(s => s.status === 'current').icon, {
                        className: "h-4 w-4 sm:h-5 sm:w-5 text-white"
                      })}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-800 mb-1 flex items-center text-sm sm:text-base">
                        In Progress: {enhancedSteps.find(s => s.status === 'current').name}
                        <div className="ml-2 flex space-x-1">
                          <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-pulse ${pulseStep === 0 ? 'opacity-100' : 'opacity-30'}`}></div>
                          <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-pulse ${pulseStep === 1 ? 'opacity-100' : 'opacity-30'}`}></div>
                          <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-pulse ${pulseStep === 2 ? 'opacity-100' : 'opacity-30'}`}></div>
                        </div>
                      </h4>
                      <p className="text-slate-600 text-xs sm:text-sm mb-2">
                        {enhancedSteps.find(s => s.status === 'current').description}
                      </p>
                      <div className="flex items-center text-xs text-slate-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {translateEstimatedTime(enhancedSteps.find(s => s.status === 'current').estimatedTime)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </div>
        </Card>

        {/* 🎯 ORDER JOURNEY CARD - TRADUZIDO COMPLETAMENTE */}
        <Card className="bg-white shadow-lg mb-4 sm:mb-6 border-0">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="font-semibold text-slate-800 text-base sm:text-lg flex items-center">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-500" />
                Order Journey
                {orderDetails.customSteps && orderDetails.customSteps.length > 0 && (
                  <span className="ml-2 bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                    Real time
                  </span>
                )}
              </h3>
              <div className="text-xs sm:text-sm text-slate-500 bg-slate-50 px-2 sm:px-3 py-1 rounded-full">
                {completedSteps}/{enhancedSteps.length} completed
              </div>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              {enhancedSteps.map((step, index) => {
                const isLast = index === enhancedSteps.length - 1;
                const colors = getStepColorClasses(step);
                
                return (
                  <div key={step.id} className="flex items-start relative group">
                    {!isLast && (
                      <div className={`absolute left-5 sm:left-6 top-10 sm:top-12 w-0.5 h-6 sm:h-8 transition-all duration-500
                        ${step.status === 'completed' ? 'bg-gradient-to-b from-emerald-400 to-emerald-500' : 
                          step.status === 'current' ? 'bg-gradient-to-b from-blue-400 to-blue-300' : 
                          'bg-slate-200'}`}>
                        {step.status === 'current' && (
                          <div className="absolute inset-0 bg-gradient-to-b from-blue-400 to-blue-300 animate-pulse"></div>
                        )}
                      </div>
                    )}
                    
                    <div className="relative">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 mr-3 sm:mr-4 border-2 transition-all duration-300 shadow-lg
                        ${step.status === 'completed' ? `${colors.bg} border-emerald-200 ${colors.glow} shadow-lg` : 
                          step.status === 'current' ? `${colors.bg} border-blue-200 shadow-blue-200 shadow-lg animate-pulse` : 
                          'bg-slate-100 border-slate-200 shadow-sm'}`}>
                        {React.createElement(step.icon, {
                          className: `h-5 w-5 sm:h-6 sm:w-6 transition-colors duration-300 ${
                            step.status === 'completed' || step.status === 'current' ? 'text-white' : 'text-slate-400'
                          }`
                        })}
                        
                        {step.status === 'current' && (
                          <div className="absolute inset-0 rounded-xl border-2 border-blue-300 animate-ping"></div>
                        )}
                        
                        {step.status === 'completed' && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white">
                            <CheckCircle2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0 pb-3 sm:pb-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 mr-2">
                          <div className="flex items-center flex-wrap">
                            <h4 className={`font-semibold text-sm sm:text-base transition-colors duration-300 mr-2
                              ${step.status === 'completed' ? colors.text : 
                                step.status === 'current' ? 'text-blue-700' : 'text-slate-500'}`}>
                              {step.name}
                            </h4>
                            
                            {step.status === 'current' && (
                              <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium animate-pulse">
                                In Progress
                              </span>
                            )}
                            
                            {step.status === 'completed' && (
                              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-500" />
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right flex-shrink-0">
                          {step.showTime ? (
                            <div className="text-xs sm:text-sm text-emerald-600 font-medium">
                              {translateRelativeTime(step.timeDisplay)}
                            </div>
                          ) : (
                            <span className={`text-xs sm:text-sm font-medium
                              ${step.status === 'current' ? 'text-blue-600' : 'text-slate-400'}`}>
                              {translateEstimatedTime(step.estimatedTime)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <p className={`text-xs sm:text-sm mb-2 sm:mb-3 transition-colors duration-300
                        ${step.status === 'completed' ? 'text-emerald-600' : 
                          step.status === 'current' ? 'text-blue-600' : 'text-slate-400'}`}>
                        {step.description}
                      </p>
                      
                      {step.status === 'current' && (
                        <div className="w-full bg-blue-100 rounded-full h-2 overflow-hidden">
                          <div className="h-2 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full animate-pulse" style={{width: '60%'}}></div>
                        </div>
                      )}
                      
                      {step.status === 'completed' && step.completedAt && (
                        <div className="mt-2 text-xs text-emerald-600 flex items-center">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {translateRelativeTime(`Completed ${formatRelativeTime(step.completedAt)} • ${formatDate(step.completedAt, 'short')}`)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* PRODUCT DETAILS CARD */}
        <Card className="bg-white shadow-lg mb-4 sm:mb-6 border-0">
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-slate-800 font-semibold mb-4 sm:mb-5 text-base sm:text-lg flex items-center">
              <Gift className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-slate-600" />
              Product Details
            </h3>
            
            <div className="flex items-center">
              {productImage ? (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl mr-3 sm:mr-4 flex-shrink-0 border border-blue-100 shadow-sm overflow-hidden">
                  <img 
                    src={productImage} 
                    alt={productName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="hidden w-full h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 items-center justify-center">
                    <Package className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-400" />
                  </div>
                </div>
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0 border border-blue-100 shadow-sm">
                  <Package className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-400" />
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-slate-800 text-base sm:text-lg truncate">
                  {productName}
                </h4>
                <p className="text-slate-600 text-xs sm:text-sm mt-1 mb-2 sm:mb-3 line-clamp-2">
                  {orderDetails.productDetails?.description || 
                   orderDetails.product?.description || 
                   orderDetails.description ||
                   'Store product'}
                </p>
                <div className="flex items-center">
                  <span className="text-xs sm:text-sm text-slate-500 mr-1">Details:</span>
                  <span className="font-semibold text-slate-800 text-xs sm:text-sm truncate">
                    {productName} - {orderDetails.productDetails?.quantity || orderDetails.quantity || 1} {
                      (orderDetails.productDetails?.quantity || orderDetails.quantity || 1) > 1 ? 'units' : 'unit'
                    }
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CUSTOMER INFO AND ADDRESS CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {(orderDetails.customer || orderDetails.customerName || customerEmail) && (
            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center mb-3 sm:mb-4">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500 mr-2" />
                  <span className="font-semibold text-slate-700 text-sm sm:text-base">Customer Information</span>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <p className="text-slate-900 font-semibold text-sm sm:text-base">
                    {orderDetails.customer?.name || orderDetails.customerName || 'Customer'}
                  </p>
                  <p className="text-slate-600 text-xs sm:text-sm flex items-center">
                    <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-slate-400" />
                    <span className="truncate">{orderDetails.customerEmail || customerEmail}</span>
                  </p>
                  {orderDetails.customer?.phone && (
                    <p className="text-slate-600 text-xs sm:text-sm flex items-center">
                      <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-slate-400" />
                      {orderDetails.customer.phone}
                    </p>
                  )}
                  {orderDetails.customer?.documentId && (
                    <p className="text-slate-600 text-xs sm:text-sm flex items-center">
                      <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-slate-400" />
                      ID: {orderDetails.customer.documentId}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
          {orderDetails.shippingAddress && orderDetails.shippingAddress.street && (
            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center mb-3 sm:mb-4">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500 mr-2" />
                  <span className="font-semibold text-slate-700 text-sm sm:text-base">Delivery Address</span>
                </div>
                <div className="text-xs sm:text-sm text-slate-600 space-y-1">
                  <p className="font-medium">{orderDetails.shippingAddress.street || 'Address not provided'}</p>
                  {orderDetails.shippingAddress.complement && 
                    <p>{orderDetails.shippingAddress.complement}</p>
                  }
                  {orderDetails.shippingAddress.neighborhood && 
                    <p>{orderDetails.shippingAddress.neighborhood}</p>
                  }
                  <p>
                    {orderDetails.shippingAddress.city || 'City'} - {orderDetails.shippingAddress.state || 'State'}
                  </p>
                  {orderDetails.shippingAddress.zipCode && (
                    <p className="font-mono text-xs bg-slate-100 inline-block px-2 py-1 rounded mt-2">
                      ZIP: {orderDetails.shippingAddress.zipCode}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="h-16 sm:h-20"></div>
      </main>

      {/* BOTTOM NAVIGATION - MOBILE OPTIMIZED */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/60 px-3 sm:px-4 py-2 sm:py-3 shadow-lg">
        <div className="flex justify-center items-center max-w-sm mx-auto">
          <button 
            className="flex flex-col items-center text-slate-400 p-2 sm:p-3 rounded-lg transition-all duration-200 hover:bg-slate-50 min-w-0"
            onClick={() => navigate('/customer/dashboard')}
          >
            <Package className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-xs mt-1 truncate max-w-[60px]">Orders</span>
          </button>
          
          <button 
            className="flex flex-col items-center text-blue-600 p-2 sm:p-3 mx-4 sm:mx-6 relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm transition-all duration-200 hover:shadow-md min-w-0"
            onClick={handleOpenChat}
          >
            <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-xs mt-1 font-medium truncate max-w-[60px]">Chat</span>
            {(orderDetails.unreadMessages || 0) > 0 && (
              <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-xs text-white font-bold">{orderDetails.unreadMessages}</span>
              </div>
            )}
          </button>
          
          <button 
            className="flex flex-col items-center text-slate-400 p-2 sm:p-3 rounded-lg transition-all duration-200 hover:bg-slate-50 min-w-0"
            onClick={() => navigate('/customer/lookup')}
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-xs mt-1 truncate max-w-[60px]">Back</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsCustomer;