import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Package, 
  MessageSquare,
  ArrowLeft,
  RefreshCw,
  User,
  CheckCircle,
  Clock,
  Truck,
  AlertCircle,
  ArrowRight,
  Sparkles,
  XIcon,
  Mail,
  Phone,
  MapPin,
  TrendingUp,
  Activity,
  Zap,
  Star,
  Gift,
  Bell,
  Eye,
  Timer,
  BarChart3,
  PieChart,
  Target,
  Award,
  Flame,
  
} from 'lucide-react';
import { apiService } from '@/services/apiService';
import webPushService from '@/services/webPushService';
import notificationTemplates from '@/services/notificationTemplates';
import { toast } from 'sonner';
import { formatDate, formatRelativeTime, isValidDate } from '@/utils/dateFormatter';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerData, setCustomerData] = useState(null);
  
  const [showNotificationCard, setShowNotificationCard] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState('checking');
  
  const storeId = 'E47OkrK3IcNu1Ys8gD4CA29RrHk2';
  
  const [customerOrders, setCustomerOrders] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalOrders: 0,
    inProgress: 0,
    completed: 0,
    messages: 0
  });

  const [statsAnimation, setStatsAnimation] = useState(false);

  useEffect(() => {
    setTimeout(() => setStatsAnimation(true), 300);
  }, []);

  useEffect(() => {
    const storedEmail = localStorage.getItem('customerEmail');
    const storedData = localStorage.getItem('customerData');
    
    if (!storedEmail || !storedData) {
      navigate('/customer/lookup');
      return;
    }
    
    try {
      const parsedData = JSON.parse(storedData);
      setCustomerEmail(storedEmail);
      setCustomerData(parsedData);
      
      if (parsedData.orders) {
        setCustomerOrders(parsedData.orders);
        setDashboardStats(parsedData.stats);
      }
      
      setIsLoading(false);
      checkNotificationStatus();
    } catch (error) {
      console.error('Error parsing customer data:', error);
      navigate('/customer/lookup');
    }
  }, [navigate]);

  const checkNotificationStatus = async () => {
    try {
      const status = await webPushService.checkSubscription();
      
      if (!status.isSupported) {
        setNotificationStatus('not-supported');
      } else if (status.permission === 'denied') {
        setNotificationStatus('denied');
      } else if (status.permission === 'granted' && status.isSubscribed) {
        setNotificationStatus('active');
      } else {
        setNotificationStatus('available');
        setTimeout(() => setShowNotificationCard(true), 3000);
      }
    } catch (error) {
      console.error('Error checking notification status:', error);
      setNotificationStatus('error');
    }
  };

  const handleActivateNotifications = async () => {
    try {
      await webPushService.initialize();
      const subscription = await webPushService.subscribe();
      
      if (subscription) {
        await apiService.subscribeToStoreWebPush(storeId);
        
        setNotificationStatus('active');
        setShowNotificationCard(false);
        
        setTimeout(async () => {
          try {
            const welcomeTemplate = notificationTemplates.getTemplate('welcome', {
              customerName: customerData?.customer?.name || 'Customer',
              storeName: 'Store'
            });
            
            await apiService.sendCustomWebPushWithUrl(
              welcomeTemplate,
              welcomeTemplate.customUrl
            );
          } catch (e) {
            console.log('Welcome notification failed:', e);
          }
        }, 2000);
        
        toast.success('🎉 Notifications activated!', {
          description: 'You will receive alerts about your orders'
        });
      }
    } catch (error) {
      toast.error('❌ Failed to activate notifications', {
        description: error.message
      });
    }
  };

  const refreshData = async () => {
    if (!customerEmail) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔍 Refreshing data for:', customerEmail);
      
      const response = await apiService.lookupCustomerByEmail(customerEmail);
      
      if (response.success && response.data) {
        setCustomerData(response.data);
        setCustomerOrders(response.data.orders);
        setDashboardStats(response.data.stats);
        
        localStorage.setItem('customerData', JSON.stringify(response.data));
        
        toast.success('✅ Data updated successfully');
      }
    } catch (error) {
      console.error('❌ Error refreshing data:', error);
      setError('Failed to update data');
      toast.error('❌ Failed to update data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    localStorage.removeItem('customerEmail');
    localStorage.removeItem('customerData');
    navigate('/customer/lookup');
  };

  const getProductName = (order) => {
    return order.productDetails?.displayName || 
           order.productDetails?.title || 
           order.productName || 
           order.product?.name || 
           'Store Product';
  };

  const getProductImage = (order) => {
    return order.productDetails?.image || 
           order.product?.image || 
           null;
  };

  const getOrderNumber = (order) => {
    return order.externalOrderNumber || 
           order.orderNumber || 
           (order.orderId || order.id || order.externalOrderId || 'N/A').toString().slice(-6);
  };

  // 🔧 CORRIGIDO: Usar EXATAMENTE a mesma lógica do OrderDetailsCustomer
  const calculateOrderProgress = (order) => {
    if (order.customSteps && order.customSteps.length > 0) {
      // Contar apenas etapas completas (igual ao Order Journey)
      const completedSteps = order.customSteps.filter(step => step.completed).length;
      
      // Progresso = (etapas completas / total de etapas) * 100
      const progress = Math.round((completedSteps / order.customSteps.length) * 100);
      return progress;
    }
    
    // Fallback para orders sem customSteps
    return order.progress || 0;
  };

  const getStatusColor = (order) => {
    const progress = calculateOrderProgress(order);
    if (progress >= 100) return 'text-emerald-600';
    if (progress >= 66) return 'text-violet-600';
    if (progress >= 33) return 'text-blue-600';
    return 'text-amber-600';
  };

  const getProgressBarColor = (order) => {
    const progress = calculateOrderProgress(order);
    if (progress >= 100) return 'from-emerald-400 via-emerald-500 to-emerald-600';
    if (progress >= 66) return 'from-violet-400 via-violet-500 to-violet-600';
    if (progress >= 33) return 'from-blue-400 via-blue-500 to-blue-600';
    return 'from-amber-400 via-amber-500 to-amber-600';
  };

  const getStatusText = (order) => {
    const progress = calculateOrderProgress(order);
    if (progress >= 100) return 'Delivered';
    
    // Encontrar a etapa atual (current ou active)
    if (order.customSteps && order.customSteps.length > 0) {
      const currentStep = order.customSteps.find(step => step.current || step.active);
      if (currentStep) return currentStep.name;
      
      // Se não tem etapa marcada como current, pegar a próxima não completada
      const nextStep = order.customSteps.find(step => !step.completed);
      if (nextStep) return nextStep.name;
    }
    
    // Fallback
    if (order.currentStep?.name) return order.currentStep.name;
    return order.status || 'Processing';
  };

  const getStepIcon = (stepName) => {
    if (!stepName) return Clock;
    const name = stepName.toLowerCase();
    if (name.includes('confirm') || name.includes('received')) return CheckCircle;
    if (name.includes('preparing') || name.includes('packing')) return Package;
    if (name.includes('shipped') || name.includes('transit')) return Truck;
    if (name.includes('delivered')) return CheckCircle;
    return Clock;
  };

  const getStatIcon = (index) => {
    const icons = [Package, Activity, CheckCircle, MessageSquare];
    return icons[index] || Package;
  };

  const getStatGradient = (index) => {
    const gradients = [
      'from-blue-500 to-indigo-600',
      'from-orange-500 to-red-600', 
      'from-emerald-500 to-teal-600',
      'from-purple-500 to-pink-600'
    ];
    return gradients[index] || gradients[0];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-3"></div>
          <p className="text-slate-600 text-sm font-medium">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-blue-500 to-indigo-600 px-4 pt-8 pb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-12 translate-x-12"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <p className="text-blue-100 text-sm font-normal">
                  Hello,
                </p>
                {notificationStatus === 'active' && (
                  <div className="bg-green-500/20 px-2 py-1 rounded-full flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-200 font-medium">🔔</span>
                  </div>
                )}
              </div>
              <h1 className="text-white text-xl font-semibold">
                {customerData?.customer?.name || 'Customer'}
              </h1>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleBack}
              className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-blue-100/80 text-sm max-w-xs">
            Track your orders in real time
          </p>
        </div>
      </header>

      <main className="px-4 py-5 -mt-3 relative z-10 pb-24">
        
        <Card className="mb-6 bg-white shadow-sm border border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">{customerEmail}</span>
                </div>
                
                {customerData?.customer?.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-600">{customerData.customer.phone}</span>
                  </div>
                )}
                
                {customerData?.customer?.documentId && (
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-600">ID: {customerData.customer.documentId}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {showNotificationCard && notificationStatus === 'available' && (
          <Card className="mb-6 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900 mb-1 flex items-center">
                    Enable Notifications!
                    <span className="ml-2 bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded-full">NEW</span>
                  </h3>
                  <p className="text-blue-700 text-sm mb-3">
                    Get instant alerts about your order updates!
                  </p>
                  <div className="flex space-x-3">
                    <Button 
                      onClick={handleActivateNotifications}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Enable Notifications
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => setShowNotificationCard(false)}
                      className="border-blue-300 text-blue-700 hover:bg-blue-100"
                    >
                      Later
                    </Button>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotificationCard(false)}
                  className="text-blue-500 hover:text-blue-700 hover:bg-blue-100 p-1"
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {notificationStatus === 'active' && (
          <Alert className="mb-6 border-emerald-200 bg-emerald-50">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <AlertDescription className="text-emerald-800 flex items-center justify-between">
              <span>
                <strong>🎉 Notifications active!</strong> You will receive alerts about your orders.
              </span>
              <Sparkles className="h-4 w-4 text-emerald-600" />
            </AlertDescription>
          </Alert>
        )}

        {notificationStatus === 'denied' && (
          <Alert className="mb-6 border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>⚠️ Notifications blocked.</strong> Enable in browser settings.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-4 gap-2.5 mb-6">
          {[
            { label: 'Orders', value: dashboardStats.totalOrders, icon: Package },
            { label: 'In Progress', value: dashboardStats.inProgress, icon: Activity },
            { label: 'Completed', value: dashboardStats.completed, icon: CheckCircle },
            { label: 'Messages', value: dashboardStats.messages, icon: MessageSquare }
          ].map((stat, index) => {
            const IconComponent = stat.icon;
            
            return (
              <div key={index} className={`
                bg-white rounded-lg p-3 text-center shadow-sm border border-slate-100 transition-all duration-300
                ${statsAnimation ? 'animate-fadeInUp' : 'opacity-0'}
              `} style={{animationDelay: `${index * 100}ms`}}>
                
                <div className={`
                  w-8 h-8 mx-auto mb-2 rounded-lg bg-gradient-to-br ${getStatGradient(index)} 
                  flex items-center justify-center shadow-sm
                `}>
                  <IconComponent className="h-4 w-4 text-white" />
                </div>
                
                <div className="text-lg font-semibold text-slate-800">
                  {stat.value}
                </div>
                
                <div className="text-xs text-slate-500 font-medium">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-slate-800 text-lg font-medium">My Orders</h2>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={refreshData}
            className="text-slate-400 hover:text-slate-600 p-2"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        {error && (
          <Card className="bg-red-50/50 border-red-100 mb-4">
            <CardContent className="p-4">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-red-800 text-sm font-medium">Error loading data</p>
                  <p className="text-red-600 text-xs mt-1">{error}</p>
                  <Button 
                    onClick={refreshData} 
                    className="mt-2 bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1.5"
                    size="sm"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Try Again
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
            <h3 className="font-medium text-slate-800 mb-2">No orders found</h3>
            <p className="text-slate-500 text-sm mb-4">
              You don't have any orders yet or they are being processed
            </p>
            <Button onClick={refreshData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {customerOrders.map((order, index) => {
              const productName = getProductName(order);
              const productImage = getProductImage(order);
              const orderNumber = getOrderNumber(order);
              const currentProgress = calculateOrderProgress(order);
              
              return (
                <Card 
                  key={order.id || index}
                  className="bg-white border border-slate-100 shadow-sm transition-all duration-200 cursor-pointer"
                  onClick={() => navigate(`/customer/orders/${order.id || order.orderId}`, { state: { customerEmail } })}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 border border-blue-100 overflow-hidden">
                        {productImage ? (
                          <img 
                            src={productImage} 
                            alt={productName}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className={`${productImage ? 'hidden' : 'flex'} bg-gradient-to-br from-blue-50 to-indigo-50 items-center justify-center text-lg w-full h-full`}>
                          <Package className="h-5 w-5 text-indigo-400" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-medium text-slate-800 text-sm">
                                Order #{orderNumber}
                              </h3>
                              {currentProgress >= 100 && (
                                <div className="w-3 h-3 bg-emerald-500 rounded-full flex items-center justify-center">
                                  <CheckCircle className="w-2 h-2 text-white" />
                                </div>
                              )}
                              {(order.unreadMessages || 0) > 0 && (
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                              )}
                            </div>
                            
                            <p className="text-slate-600 text-sm font-medium">
                              {productName}
                            </p>
                            
                            {(order.quantity > 1) && (
                              <p className="text-slate-400 text-xs">
                                {order.quantity} items
                              </p>
                            )}
                          </div>
                          
                          <div className="text-right flex-shrink-0">
                            <span className="text-slate-400 text-xs">
                              {isValidDate(order.createdAt || order.orderDate) ? formatDate(order.createdAt || order.orderDate, 'short') : new Date(order.createdAt || order.orderDate || Date.now()).toLocaleDateString('en-US', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <ArrowRight className="h-3 w-3 text-slate-400 mt-1 ml-auto transition-colors" />
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <Sparkles className={`h-3 w-3 ${getStatusColor(order)}`} />
                            <span className={`text-sm font-medium ${getStatusColor(order)}`}>
                              {getStatusText(order)}
                            </span>
                          </div>
                          <span className="text-slate-500 text-xs font-medium">
                            {currentProgress}%
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="relative">
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div 
                                className={`h-2 rounded-full bg-gradient-to-r ${getProgressBarColor(order)} transition-all duration-700 ease-out`}
                                style={{ width: `${currentProgress}%` }}
                              >
                              </div>
                            </div>
                          </div>
                          
                          {order.customSteps && order.customSteps.length > 0 && (
                            <div className="flex justify-between items-center pt-2">
                              {order.customSteps.slice(0, 4).map((step, stepIndex) => {
                                const StepIcon = getStepIcon(step.name);
                                return (
                                  <div key={stepIndex} className="flex flex-col items-center">
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs border border-white shadow-sm
                                      ${step.completed 
                                        ? 'bg-emerald-500 text-white' 
                                        : step.current || step.active
                                          ? 'bg-blue-500 text-white' 
                                          : 'bg-slate-200 text-slate-400'}`}>
                                      <StepIcon className="h-2.5 w-2.5" />
                                    </div>
                                    <span className={`text-xs mt-1 text-center max-w-14 leading-tight
                                      ${step.completed 
                                        ? 'text-emerald-600 font-medium' 
                                        : step.current || step.active
                                          ? 'text-blue-600 font-medium' 
                                          : 'text-slate-400'}`}>
                                      {step.name.length > 6 ? step.name.substring(0, 4) + '...' : step.name}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between pt-1">
                            <p className="text-xs text-slate-400">
                              {formatRelativeTime(order.createdAt || order.orderDate)}
                            </p>
                            
                            {currentProgress < 100 && (
                              <span className="text-xs text-blue-500 font-medium">
                                In Progress
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default CustomerDashboard;