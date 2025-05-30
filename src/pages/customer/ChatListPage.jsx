import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft,
  MessageSquare,
  Package,
  RefreshCw,
  AlertCircle,
  Loader2,
  MessageCircle,
  Clock,
  Send,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { apiService } from '@/services/apiService';

const ChatListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [chatData, setChatData] = useState({});

  // Get customer email from localStorage or state
  const customerEmail = location.state?.customerEmail || localStorage.getItem('customerEmail');
  const customerData = location.state?.customerData || JSON.parse(localStorage.getItem('customerData') || '{}');
  const storeId = 'E47OkrK3IcNu1Ys8gD4CA29RrHk2';

  useEffect(() => {
    if (!customerEmail) {
      navigate('/customer/lookup');
      return;
    }

    loadCustomerOrders();
  }, [customerEmail, navigate]);

  const loadCustomerOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔍 Loading customer orders for chat list:', customerEmail);

      // Get fresh customer data
      const response = await apiService.lookupCustomerByEmail(customerEmail);
      
      if (response.success && response.data && response.data.orders) {
        const orders = response.data.orders;
        console.log(`✅ Found ${orders.length} orders`);
        setCustomerOrders(orders);
        
        // For each order, check if chat exists and get basic info
        const chatInfo = {};
        
        for (const order of orders) {
          try {
            console.log(`🔍 Checking chat for order ${order.id || order.orderId}`);
            
            const chatResponse = await apiService.getOrderChat(
              order.id || order.orderId, 
              customerEmail, 
              storeId
            );
            
            if (chatResponse && chatResponse.id) {
              // Get recent messages count
              try {
                const messages = await apiService.getChatMessages(chatResponse.id);
                const unreadCount = messages.filter(msg => 
                  !msg.read && msg.senderType !== 'customer'
                ).length;
                
                chatInfo[order.id || order.orderId] = {
                  chatId: chatResponse.id,
                  messageCount: messages.length,
                  unreadCount: unreadCount,
                  lastMessage: messages.length > 0 ? messages[messages.length - 1] : null
                };
                
                console.log(`✅ Chat found for order ${order.id}: ${chatResponse.id}`);
              } catch (msgError) {
                console.log(`⚠️ Could not load messages for chat ${chatResponse.id}`);
                chatInfo[order.id || order.orderId] = {
                  chatId: chatResponse.id,
                  messageCount: 0,
                  unreadCount: 0,
                  lastMessage: null
                };
              }
            } else {
              console.log(`📭 No chat found for order ${order.id}`);
            }
          } catch (chatError) {
            console.log(`⚠️ Error checking chat for order ${order.id}:`, chatError);
          }
        }
        
        setChatData(chatInfo);
      } else {
        throw new Error('No orders found');
      }

    } catch (error) {
      console.error('❌ Error loading orders:', error);
      setError('Failed to load your orders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChat = (order) => {
    console.log('💬 Opening chat for order:', order.id || order.orderId);
    
    const chatInfo = chatData[order.id || order.orderId];
    
    if (chatInfo && chatInfo.chatId) {
      // Navigate to existing chat
      navigate(`/customer/chat/${chatInfo.chatId}`, {
        state: {
          orderId: order.id || order.orderId,
          customerEmail: customerEmail,
          orderDetails: order
        }
      });
    } else {
      // Navigate to create new chat
      navigate(`/customer/chat`, {
        state: {
          orderId: order.id || order.orderId,
          customerEmail: customerEmail,
          orderDetails: order
        }
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Today';
    try {
      const date = (dateString.seconds || dateString._seconds) ? new Date((dateString.seconds || dateString._seconds) * 1000) : new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
      
      if (diffInHours < 1) return 'Now';
      if (diffInHours < 24) return `${diffInHours}h ago`;
      if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
      
      return date.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short'
      });
    } catch {
      return 'Today';
    }
  };

  const formatLastMessage = (message) => {
    if (!message) return 'No messages yet';
    
    const content = message.content || message.text || '';
    const sender = message.senderType === 'customer' ? 'You: ' : 'Store: ';
    
    return sender + (content.length > 30 ? content.substring(0, 30) + '...' : content);
  };

  const getProgressColor = (progress) => {
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
          <p className="text-slate-600 text-sm font-medium">Loading your conversations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Error loading conversations</h3>
            <p className="text-slate-500 mb-4 text-sm">{error}</p>
            <div className="space-y-2">
              <Button onClick={() => navigate('/customer/dashboard')} className="w-full bg-blue-600 hover:bg-blue-700">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Orders
              </Button>
              <Button onClick={loadCustomerOrders} variant="outline" className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/customer/dashboard')}
                className="text-white/80 hover:text-white hover:bg-white/10 p-2 mr-3 rounded-lg"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-white text-lg font-medium">Messages</h1>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={loadCustomerOrders}
              disabled={isLoading}
              className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          
          <div className="flex items-center">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center text-lg mr-3 backdrop-blur-sm">
              💬
            </div>
            <div>
              <h2 className="text-white text-lg font-medium">Your Conversations</h2>
              <p className="text-blue-200 text-sm">Chat with the store about each order</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-5 -mt-3 relative z-10 pb-24">
        
        {/* Info card */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-blue-800">Separate Chat per Order</h3>
                <p className="text-blue-600 text-sm">
                  Each order has its own conversation thread
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {customerOrders.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-slate-100">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="font-medium text-slate-800 mb-2">No conversations yet</h3>
            <p className="text-slate-500 text-sm mb-4">
              You don't have any orders to chat about
            </p>
            <Button onClick={() => navigate('/customer/dashboard')} variant="outline" size="sm">
              <Package className="h-4 w-4 mr-2" />
              View Orders
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {customerOrders.map((order, index) => {
              const orderId = order.id || order.orderId;
              const chatInfo = chatData[orderId] || {};
              const hasChat = !!chatInfo.chatId;
              const hasUnread = chatInfo.unreadCount > 0;
              
              return (
                <Card 
                  key={orderId || index}
                  className={`bg-white border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group
                    ${hasUnread ? 'border-blue-300 ring-1 ring-blue-100' : 'border-slate-100 hover:border-slate-200'}`}
                  onClick={() => handleOpenChat(order)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      {/* Order icon */}
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center text-lg flex-shrink-0 border border-blue-100 relative">
                        📦
                        {hasUnread && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-medium">{chatInfo.unreadCount}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        {/* Order header */}
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-medium text-slate-800 text-sm">
                                Order #{orderId.toString().slice(-6)}
                              </h3>
                              {order.progress >= 100 && (
                                <CheckCircle className="w-3 h-3 text-emerald-500" />
                              )}
                              {hasChat && (
                                <MessageSquare className="w-3 h-3 text-blue-500" />
                              )}
                            </div>
                            
                            <p className="text-slate-600 text-sm font-medium">
                              {order.productName || order.productDetails?.name || order.product?.name || 'Store Product'}
                            </p>
                          </div>
                          
                          <div className="text-right flex-shrink-0">
                            <span className="text-slate-400 text-xs">
                              {formatDate(order.createdAt || order.orderDate)}
                            </span>
                          </div>
                        </div>
                        
                        {/* Order progress */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <Sparkles className={`h-3 w-3 ${getProgressColor(order.progress || 0)}`} />
                            <span className={`text-xs font-medium ${getProgressColor(order.progress || 0)}`}>
                              {order.progress >= 100 ? 'Completed' : 
                               order.currentStep?.name || 
                               order.status || 'Processing'}
                            </span>
                          </div>
                          <span className="text-slate-500 text-xs">
                            {order.progress || 0}%
                          </span>
                        </div>
                        
                        {/* Chat info */}
                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              {hasChat ? (
                                <div>
                                  <p className="text-slate-700 text-xs font-medium mb-1">
                                    💬 {chatInfo.messageCount} messages
                                  </p>
                                  <p className="text-slate-500 text-xs">
                                    {formatLastMessage(chatInfo.lastMessage)}
                                  </p>
                                </div>
                              ) : (
                                <div>
                                  <p className="text-slate-600 text-xs font-medium mb-1">
                                    Start conversation
                                  </p>
                                  <p className="text-slate-400 text-xs">
                                    Ask questions about this order
                                  </p>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-2 ml-3">
                              {hasUnread && (
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                              )}
                              <Send className="h-3 w-3 text-slate-400 group-hover:text-slate-600 transition-colors" />
                            </div>
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

export default ChatListPage;