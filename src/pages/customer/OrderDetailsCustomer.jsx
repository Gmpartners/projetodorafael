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
  HeadphonesIcon
} from 'lucide-react';
import { apiService } from '@/services/apiService';

const OrderDetailsCustomer = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState(null);

  // Get customer email from localStorage or state
  const customerEmail = location.state?.customerEmail || localStorage.getItem('customerEmail');
  const storeId = 'E47OkrK3IcNu1Ys8gD4CA29RrHk2';

  useEffect(() => {
    if (!customerEmail) {
      // Redirect to lookup if no email
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

      // Get order progress by email (no auth required)
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

  // Open chat with store
  const handleOpenChat = async () => {
    try {
      console.log('💬 Opening chat for order:', {
        orderId: orderId,
        customerEmail: customerEmail,
        storeId: storeId
      });

      // Navigate to chat with customer email
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

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    try {
      const date = dateString.seconds ? new Date(dateString.seconds * 1000) : new Date(dateString);
      return date.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch {
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

  const getStepIcon = (stepName) => {
    if (!stepName) return Clock;
    const name = stepName.toLowerCase();
    if (name.includes('confirmed') || name.includes('received')) return CheckCircle;
    if (name.includes('preparing') || name.includes('packing')) return Package;
    if (name.includes('shipped') || name.includes('transit')) return Truck;
    if (name.includes('delivered')) return CheckCircle;
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
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-500 to-indigo-600 px-4 pt-8 pb-6 relative overflow-hidden">
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
            <h1 className="text-white text-lg font-medium">Order Details</h1>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-lg mr-3 backdrop-blur-sm">
                🏪
              </div>
              <div>
                <div className="flex items-center">
                  <h2 className="text-white text-lg font-medium mr-2">
                    {orderDetails.storeName || 'Store'}
                  </h2>
                  <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-2.5 h-2.5 text-white" />
                  </div>
                </div>
                <div className="flex items-center mt-1">
                  <span className="text-blue-200 text-sm">
                    <Clock className="h-3 w-3 inline mr-1" />
                    Order #{(orderDetails.orderId || orderDetails.id).toString().slice(-6)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-5 -mt-3 relative z-10">
        {/* Main order card */}
        <Card className="bg-white shadow-sm mb-6 border border-slate-100">
          <CardContent className="p-5">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-blue-600 font-medium text-lg">
                  Order #{(orderDetails.orderId || orderDetails.id).toString().slice(-6)}
                </h3>
                <p className="text-slate-500 text-sm">
                  Created on {formatDate(orderDetails.createdAt)}
                </p>
              </div>
            </div>
            
            {/* Progress section */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Sparkles className={`h-4 w-4 ${getStatusColor(orderDetails.progress || 0)}`} />
                  <span className={`font-medium text-sm ${getStatusColor(orderDetails.progress || 0)}`}>
                    {orderDetails.progress >= 100 ? 'Order Completed' : 
                     orderDetails.currentStep?.name || 
                     orderDetails.status || 'Processing'}
                  </span>
                </div>
                <span className="text-slate-600 font-medium text-sm">
                  {orderDetails.progress || 0}%
                </span>
              </div>
              
              {/* Progress bar */}
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

        {/* Chat with store */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm mb-6 border border-blue-100">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-blue-800">Chat with Store</h3>
                  <p className="text-blue-600 text-sm">Ask questions about your order</p>
                </div>
              </div>
              {orderDetails.unreadMessages > 0 && (
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-medium">{orderDetails.unreadMessages}</span>
                </div>
              )}
            </div>
            
            <div className="bg-white/70 p-4 rounded-lg border border-blue-200 mb-4">
              <div className="flex items-start">
                <HeadphonesIcon className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-blue-700 font-medium mb-1">Customer Support Available</p>
                  <p className="text-blue-600">
                    Our team is ready to help with questions about delivery, 
                    products, or any issues related to your order.
                  </p>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleOpenChat}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              size="lg"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Start Conversation
              <Send className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Product details */}
        <Card className="bg-white shadow-sm mb-6 border border-slate-100">
          <CardContent className="p-5">
            <h3 className="text-slate-800 font-medium mb-4">Product</h3>
            
            <div className="flex items-center">
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-2xl mr-4 flex-shrink-0 border border-blue-100">
                📦
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-slate-800">
                  {orderDetails.productName || orderDetails.productDetails?.name || orderDetails.product?.name || 'Product'}
                </h4>
                <p className="text-slate-600 text-sm mt-1">
                  {orderDetails.productDetails?.description || orderDetails.product?.description || 'Store product'}
                </p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-sm text-slate-500">
                    Qty: {orderDetails.quantity || 1}
                  </span>
                  <span className="text-sm font-medium text-slate-800">
                    {formatCurrency(orderDetails.totalValue || orderDetails.productDetails?.price || 0)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer and address info (masked) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Customer data (masked) */}
          {(orderDetails.customer || orderDetails.customerName) && (
            <Card className="bg-white shadow-sm border border-slate-100">
              <CardContent className="p-5">
                <div className="flex items-center mb-3">
                  <User className="h-4 w-4 text-slate-500 mr-2" />
                  <span className="font-medium text-slate-700 text-sm">Customer Information</span>
                </div>
                <div className="space-y-2">
                  <p className="text-slate-900 font-medium text-sm">
                    {orderDetails.customer?.name || orderDetails.customerName || 'Customer'}
                  </p>
                  <p className="text-slate-600 text-sm flex items-center">
                    <Mail className="h-3 w-3 mr-2" />
                    {customerEmail}
                  </p>
                  {orderDetails.customer?.phone && (
                    <p className="text-slate-600 text-sm flex items-center">
                      <Phone className="h-3 w-3 mr-2" />
                      {orderDetails.customer.phone}
                    </p>
                  )}
                  {orderDetails.customer?.documentId && (
                    <p className="text-slate-600 text-sm flex items-center">
                      <User className="h-3 w-3 mr-2" />
                      ID: {orderDetails.customer.documentId}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Shipping address (masked) */}
          {orderDetails.shippingAddress && (
            <Card className="bg-white shadow-sm border border-slate-100">
              <CardContent className="p-5">
                <div className="flex items-center mb-3">
                  <MapPin className="h-4 w-4 text-slate-500 mr-2" />
                  <span className="font-medium text-slate-700 text-sm">Shipping Address</span>
                </div>
                <div className="text-sm text-slate-600 space-y-1">
                  <p>{orderDetails.shippingAddress.street}</p>
                  {orderDetails.shippingAddress.complement && 
                    <p>{orderDetails.shippingAddress.complement}</p>
                  }
                  <p>{orderDetails.shippingAddress.neighborhood}</p>
                  <p>{orderDetails.shippingAddress.city} - {orderDetails.shippingAddress.state}</p>
                  <p className="font-mono text-xs">{orderDetails.shippingAddress.zipCode}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Timeline of steps */}
        {orderDetails.steps && orderDetails.steps.length > 0 && (
          <Card className="bg-white shadow-sm mb-6 border border-slate-100">
            <CardContent className="p-5">
              <h3 className="font-medium text-slate-800 mb-5">Order Timeline</h3>
              <div className="space-y-5">
                {orderDetails.steps.map((step, index) => {
                  const StepIcon = getStepIcon(step.name);
                  const isLast = index === orderDetails.steps.length - 1;
                  
                  return (
                    <div key={step.id || index} className="flex items-start relative">
                      {/* Connecting line */}
                      {!isLast && (
                        <div className={`absolute left-4 top-8 w-0.5 h-6 
                          ${step.completed ? 'bg-emerald-400' : 'bg-slate-200'}`}>
                        </div>
                      )}
                      
                      {/* Step icon */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mr-3 border-2 border-white shadow-sm
                        ${step.completed ? 'bg-emerald-500' : 
                          step.current ? 'bg-blue-500' : 'bg-slate-300'}`}>
                        <StepIcon className="h-4 w-4 text-white" />
                      </div>
                      
                      {/* Step content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className={`font-medium text-sm
                            ${step.completed ? 'text-emerald-700' : 
                              step.current ? 'text-blue-700' : 'text-slate-500'}`}>
                            {step.name}
                            {step.current && (
                              <span className="ml-2 inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                                In Progress
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

        {/* Padding for bottom navigation */}
        <div className="h-20"></div>
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/60 px-4 py-2">
        <div className="flex justify-center items-center max-w-sm mx-auto">
          <button 
            className="flex flex-col items-center text-slate-400 p-3"
            onClick={() => navigate('/customer/dashboard')}
          >
            <Package className="h-5 w-5" />
            <span className="text-xs mt-1">Orders</span>
          </button>
          
          <button 
            className="flex flex-col items-center text-blue-600 p-3 mx-6 relative bg-blue-50 rounded-lg border border-blue-200"
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