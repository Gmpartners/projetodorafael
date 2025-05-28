import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageSquare,
  Send,
  ArrowLeft,
  CheckCircle,
  Clock,
  User,
  RefreshCw,
  AlertCircle,
  Loader2,
  MessageCircle,
  Package,
  Sparkles
} from 'lucide-react';
import { apiService } from '@/services/apiService';

const ChatPage = () => {
  const { id: urlChatId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chatData, setChatData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  // ✅ CORREÇÃO: Estado separado para chatId
  const [chatId, setChatId] = useState(urlChatId || null);
  const messageEndRef = useRef(null);
  const pollInterval = useRef(null);
  
  // Get customer data from localStorage or location state
  const customerEmail = location.state?.customerEmail || localStorage.getItem('customerEmail');
  const customerData = location.state?.customerData || JSON.parse(localStorage.getItem('customerData') || '{}');
  const orderId = location.state?.orderId || null;
  const storeId = 'E47OkrK3IcNu1Ys8gD4CA29RrHk2';

  console.log('💬 ChatPage: Current state:', {
    urlChatId,
    chatId,
    customerEmail,
    orderId,
    chatDataId: chatData?.id,
    messagesCount: messages.length
  });

  useEffect(() => {
    if (!customerEmail) {
      // Redirect to lookup if no email
      navigate('/customer/lookup');
      return;
    }

    if (orderId && !urlChatId) {
      // If we have an orderId but no chatId, create/get chat first
      createOrGetChat();
    } else if (urlChatId) {
      // If we have chatId directly, load chat data
      setChatId(urlChatId);
      loadChatData();
    } else {
      // No chat info, show general chat interface
      setIsLoading(false);
    }
  }, [urlChatId, customerEmail, orderId, navigate]);

  useEffect(() => {
    if (!chatId || !chatData) return;

    console.log('🔄 Starting message polling for chat:', chatId);
    
    // Load messages immediately
    loadMessages(true);
    
    pollInterval.current = setInterval(() => {
      loadMessages(true);
    }, 3000);

    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
        console.log('🛑 Stopping message polling');
      }
    };
  }, [chatId, chatData]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
      }
    };
  }, []);

  const createOrGetChat = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('💬 Creating/getting chat for order:', { orderId, customerEmail, storeId });

      // ✅ CORREÇÃO: Usar email diretamente como identificador
      const customerIdentifier = customerEmail;
      
      const response = await apiService.getOrderChat(orderId, customerIdentifier, storeId);
      console.log('✅ API Response:', response);
      
      if (response && response.id) {
        console.log('✅ Chat created/found:', response);
        
        // ✅ CORREÇÃO: Definir chatId E chatData
        setChatId(response.id);
        
        const newChatData = {
          id: response.id,
          orderId: response.orderId,
          storeName: response.participants?.storeName || 'Store Support',
          storeId: response.storeId,
          customerEmail: response.customerEmail || customerEmail,
          participants: response.participants,
          name: response.participants?.storeName || 'Store Support',
          avatar: `https://ui-avatars.com/api/?name=Store&background=3b82f6&color=fff`,
          initials: 'ST'
        };
        
        setChatData(newChatData);
        
        // ✅ CORREÇÃO: Navegar para URL correta com chatId
        if (!urlChatId) {
          navigate(`/customer/chat/${response.id}`, { 
            replace: true,
            state: { customerEmail, orderId, customerData }
          });
        }
        
        setIsLoading(false);
      } else {
        throw new Error('Failed to create chat');
      }

    } catch (error) {
      console.error('❌ Error creating/getting chat:', error);
      setError('Error creating chat: ' + error.message);
      setIsLoading(false);
    }
  };

  const loadChatData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('💬 Loading chat data:', { chatId: urlChatId, customerEmail });

      // Try to get chat details
      try {
        const chatDetails = await apiService.getChatDetails(urlChatId, customerEmail);
        console.log('✅ Chat details loaded:', chatDetails);
        
        setChatData({
          ...chatDetails,
          name: chatDetails.participants?.storeName || 'Store Support',
          avatar: `https://ui-avatars.com/api/?name=Store&background=3b82f6&color=fff`,
          initials: 'ST'
        });
      } catch (apiError) {
        console.log('⚠️ Could not load chat details, using mock data');
        
        // Fallback to mock chat data
        setChatData({
          id: urlChatId,
          orderId: orderId,
          storeName: 'Store Support',
          storeId: storeId,
          customerEmail: customerEmail,
          participants: {
            storeName: 'Store Support'
          },
          name: 'Store Support',
          avatar: `https://ui-avatars.com/api/?name=Store&background=3b82f6&color=fff`,
          initials: 'ST'
        });
      }

    } catch (error) {
      console.error('❌ Error loading chat:', error);
      setError('Error loading conversation: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (silent = false) => {
    try {
      if (!silent) {
        setIsRefreshing(true);
      }
      
      console.log(`📨 ${silent ? 'Updating' : 'Loading'} messages for chat:`, chatId);
      
      if (!chatId) {
        console.log('⚠️ No chatId available, skipping message load');
        return;
      }
      
      try {
        // Try to get real messages from API
        const realMessages = await apiService.getChatMessages(chatId);
        
        if (realMessages && realMessages.length > 0) {
          console.log('✅ Real messages loaded:', realMessages.length);
          const processedMessages = realMessages.map((msg, index) => {
            let messageTime = new Date();
            
            if (msg.timestamp) {
              try {
                if (msg.timestamp._seconds) {
                  messageTime = new Date(msg.timestamp._seconds * 1000);
                } else if (msg.timestamp.toDate) {
                  messageTime = msg.timestamp.toDate();
                } else if (typeof msg.timestamp === 'string' || typeof msg.timestamp === 'number') {
                  messageTime = new Date(msg.timestamp);
                }
              } catch (error) {
                console.log('⚠️ Error processing timestamp:', error);
                messageTime = new Date();
              }
            }

            return {
              id: msg.id || `msg-${index}`,
              content: msg.text || msg.content || '',
              sender: msg.senderType === 'customer' ? 'user' : msg.senderType === 'system' ? 'system' : 'store',
              senderName: msg.senderName || (msg.senderType === 'customer' ? 'You' : msg.senderType === 'system' ? 'System' : 'Store'),
              senderType: msg.senderType,
              time: messageTime,
              read: msg.read || false
            };
          });
          
          setMessages(processedMessages);
        } else {
          console.log('📭 No messages found, showing welcome message');
          
          // Show welcome message if no messages
          setMessages([{
            id: 'welcome',
            content: 'Chat iniciado! Envie sua primeira mensagem.',
            sender: 'system',
            senderName: 'Sistema',
            senderType: 'system',
            time: new Date(),
            read: true
          }]);
        }
      } catch (apiError) {
        console.log('⚠️ API failed to load messages:', apiError);
        
        // Show error message
        setMessages([{
          id: 'error',
          content: 'Não foi possível carregar mensagens. Tente novamente.',
          sender: 'system',
          senderName: 'Sistema',
          senderType: 'system',
          time: new Date(),
          read: true
        }]);
      }
      
    } catch (error) {
      console.error('❌ Error loading messages:', error);
      if (!silent) {
        setError('Error loading messages');
      }
    } finally {
      if (!silent) {
        setIsRefreshing(false);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || sending) return;
    
    try {
      setSending(true);
      console.log('📤 Sending message:', message, 'to chatId:', chatId);

      const messageData = {
        text: message.trim(),
        senderId: customerEmail, // Use email as sender ID
        senderType: 'customer',
        senderName: customerData?.customer?.name || 'Customer',
        type: 'text',
        timestamp: new Date()
      };

      const tempMessage = {
        id: `temp-${Date.now()}`,
        content: message.trim(),
        sender: 'user',
        senderName: 'You',
        senderType: 'customer',
        time: new Date(),
        read: false
      };

      setMessages(prev => [...prev, tempMessage]);
      setMessage('');

      if (chatId) {
        try {
          console.log('📤 Sending via API to chatId:', chatId);
          await apiService.sendMessage(chatId, messageData);
          console.log('✅ Message sent successfully');
          
          setTimeout(() => {
            loadMessages(true);
          }, 500);
        } catch (apiError) {
          console.error('❌ API send failed:', apiError);
          
          // Update temp message to look sent but mark as local
          setMessages(prev => prev.map(msg => 
            msg.id.startsWith('temp-') ? { ...msg, id: `failed-${Date.now()}`, read: false } : msg
          ));
        }
      } else {
        console.error('❌ No chatId available for sending message');
        
        // Update temp message to look local
        setMessages(prev => prev.map(msg => 
          msg.id.startsWith('temp-') ? { ...msg, id: `local-${Date.now()}`, read: false } : msg
        ));
      }
      
    } catch (error) {
      console.error('❌ Error sending message:', error);
      setError('Error sending message');
      
      // Remove temp message and restore input
      setMessages(prev => prev.filter(msg => !msg.id.startsWith('temp-')));
      setMessage(messageData.text);
      
    } finally {
      setSending(false);
    }
  };

  const formatTime = (time) => {
    if (!time || !(time instanceof Date) || isNaN(time.getTime())) {
      return 'Now';
    }
    
    try {
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);
      
      if (diffInSeconds < 30) {
        return 'Now';
      } else if (diffInSeconds < 60) {
        return 'Just now';
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes}m ago`;
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours}h ago`;
      } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days}d ago`;
      } else {
        return time.toLocaleDateString('en-US', {
          day: '2-digit',
          month: '2-digit',
          year: time.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
      }
    } catch (error) {
      console.log('⚠️ Error formatting time:', error);
      return 'Now';
    }
  };

  const handleManualRefresh = async () => {
    await loadMessages();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-slate-600 text-sm font-medium">Loading conversation...</p>
          {chatId && <p className="text-xs text-slate-400 mt-1">Chat: {chatId}</p>}
          {orderId && <p className="text-xs text-slate-400 mt-1">Order: {orderId}</p>}
          {customerEmail && <p className="text-xs text-slate-400 mt-1">Email: {customerEmail}</p>}
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
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Error in conversation</h3>
            <p className="text-slate-500 mb-4 text-sm">{error}</p>
            <div className="space-y-2">
              <Button onClick={() => navigate('/customer/dashboard')} className="w-full bg-blue-600 hover:bg-blue-700">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Orders
              </Button>
              <Button onClick={loadChatData} variant="outline" className="w-full">
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-gradient-to-r from-blue-500 to-indigo-600 px-4 pt-8 pb-4 relative overflow-hidden">
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
              <h1 className="text-white text-lg font-medium">Chat</h1>
              {/* ✅ CORREÇÃO: Debug info */}
              <span className="ml-2 text-xs text-white/60">
                ID: {chatId ? chatId.slice(-6) : 'none'}
              </span>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          
          <div className="flex items-center">
            <Avatar className="h-12 w-12 mr-3 border-2 border-white/20">
              <AvatarImage src={chatData?.avatar} />
              <AvatarFallback className="bg-white/20 text-white font-bold">
                {chatData?.initials || 'ST'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center">
                <h2 className="text-white text-lg font-medium mr-2">
                  {chatData?.name || 'Store Support'}
                </h2>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              </div>
              
              <div className="flex items-center text-blue-200 text-sm">
                <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></div>
                <span>Online</span>
                {orderId && (
                  <>
                    <span className="mx-2">•</span>
                    <Package className="h-3 w-3 mr-1" />
                    <span>Order #{orderId.slice(-6)}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col bg-slate-50 relative z-10">
        <ScrollArea className="flex-1 p-4">
          <div className="max-w-2xl mx-auto space-y-4">
            
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                    <MessageCircle className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-blue-800">Conversation started</h3>
                    <p className="text-blue-600 text-sm">
                      {orderId 
                        ? `About your order #${orderId.slice(-6)}`
                        : 'Ask questions about your order'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-slate-900 mb-1">No messages yet</h3>
                <p className="text-slate-500">Send your first message to the store</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div 
                  key={msg.id || idx}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${msg.sender === 'user' ? 'order-2' : 'order-1'}`}>
                    
                    {msg.sender === 'store' && (
                      <div className="flex items-end mb-2">
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarImage src={chatData?.avatar} />
                          <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                            {chatData?.initials || 'ST'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-slate-500">{msg.senderName}</span>
                      </div>
                    )}
                    
                    {msg.sender === 'system' && (
                      <div className="flex justify-center mb-4">
                        <div className="bg-slate-100 text-slate-600 text-xs px-3 py-2 rounded-full border border-slate-200">
                          <Sparkles className="h-3 w-3 inline mr-1" />
                          {msg.content}
                        </div>
                      </div>
                    )}
                    
                    {msg.sender !== 'system' && (
                      <>
                        <div className={`rounded-2xl p-3 ${
                          msg.sender === 'user'
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-md' 
                            : 'bg-white text-slate-800 rounded-bl-md border border-slate-200 shadow-sm'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        
                        <div className={`flex items-center mt-1 text-xs text-slate-400 ${
                          msg.sender === 'user' ? 'justify-end' : 'justify-start'
                        }`}>
                          <span>{formatTime(msg.time)}</span>
                          {msg.sender === 'user' && (
                            <CheckCircle className="ml-1 h-3 w-3" />
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
            
            <div ref={messageEndRef} />
          </div>
        </ScrollArea>
        
        <div className="p-4 bg-white border-t border-slate-200">
          <div className="max-w-2xl mx-auto flex items-center space-x-3">
            <div className="flex-1 relative">
              <Input
                className="pr-12 py-3 min-h-12 text-sm border-slate-200 focus:border-blue-300 focus:ring-blue-200 rounded-xl"
                placeholder={chatId ? "Type your message..." : "Chat not ready..."}
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyPress={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={sending || !chatId}
              />
            </div>
            
            <Button 
              size="icon" 
              className={message.trim() && !sending && chatId
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 h-12 w-12 rounded-xl" 
                : "bg-slate-300 cursor-not-allowed h-12 w-12 rounded-xl"}
              disabled={!message.trim() || sending || !chatId}
              onClick={handleSendMessage}
            >
              {sending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
          
          {/* ✅ CORREÇÃO: Debug info */}
          {!chatId && (
            <div className="max-w-2xl mx-auto text-center mt-2">
              <p className="text-xs text-red-500">
                ⚠️ Chat ID not available. Messages cannot be sent.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ChatPage;