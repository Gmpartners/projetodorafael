import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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
  const { id: chatId } = useParams();
  const navigate = useNavigate();
  const { userProfile, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chatData, setChatData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const messageEndRef = useRef(null);
  const pollInterval = useRef(null);
  
  const customerId = user?.uid || userProfile?.uid || '0HeRINZTlvOM5raS8J4AkITanWP2';
  const storeId = 'E47OkrK3IcNu1Ys8gD4CA29RrHk2';

  console.log('💬 ChatPage: Estado atual:', {
    chatId,
    customerId,
    userEmail: user?.email,
    chatData: chatData?.id,
    messagesCount: messages.length
  });

  useEffect(() => {
    if (chatId && customerId) {
      loadChatData();
    }
  }, [chatId, customerId]);

  useEffect(() => {
    if (!chatId || !chatData) return;

    console.log('🔄 Iniciando polling de mensagens para chat:', chatId);
    
    pollInterval.current = setInterval(() => {
      loadMessages(true);
    }, 3000);

    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
        console.log('🛑 Parando polling de mensagens');
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

  const loadChatData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('💬 Carregando chat:', { chatId, customerId, storeId });

      const chat = await apiService.getChatDetails(chatId, customerId);
      
      if (chat) {
        console.log('✅ Chat carregado:', chat);
        setChatData({
          ...chat,
          name: chat.participants?.storeName || chat.storeName || 'Loja GM Partners',
          avatar: `https://ui-avatars.com/api/?name=Loja&background=8b5cf6&color=fff`,
          initials: 'LJ'
        });

        await loadMessages();
      } else {
        throw new Error('Chat não encontrado');
      }

    } catch (error) {
      console.error('❌ Erro ao carregar chat:', error);
      setError('Erro ao carregar conversa: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (silent = false) => {
    try {
      if (!silent) {
        setIsRefreshing(true);
      }
      
      console.log(`📨 ${silent ? 'Atualizando' : 'Carregando'} mensagens do chat:`, chatId);
      const chatMessages = await apiService.getChatMessages(chatId);
      
      const processedMessages = (chatMessages || []).map((msg, index) => {
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
            console.log('⚠️ Erro ao processar timestamp:', error);
            messageTime = new Date();
          }
        }

        return {
          id: msg.id || `msg-${index}`,
          content: msg.text || msg.content || '',
          sender: msg.senderType === 'customer' ? 'user' : msg.senderType === 'system' ? 'system' : 'store',
          senderName: msg.senderName || (msg.senderType === 'customer' ? 'Você' : msg.senderType === 'system' ? 'Sistema' : 'Loja'),
          senderType: msg.senderType,
          time: messageTime,
          read: msg.read || false
        };
      });

      const newMessagesCount = processedMessages.length - messages.length;
      if (silent && newMessagesCount > 0) {
        console.log(`🔔 ${newMessagesCount} nova(s) mensagem(s) recebida(s)`);
      }

      setMessages(processedMessages);
      
      if (!silent) {
        console.log('✅ Mensagens carregadas:', processedMessages.length);
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar mensagens:', error);
      if (!silent) {
        setError('Erro ao carregar mensagens');
      }
    } finally {
      if (!silent) {
        setIsRefreshing(false);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !chatId || sending) return;
    
    try {
      setSending(true);
      console.log('📤 Enviando mensagem:', message);

      const messageData = {
        text: message.trim(),
        senderId: customerId,
        senderType: 'customer',
        senderName: userProfile?.name || user?.displayName || 'Maria Silva',
        type: 'text',
        timestamp: new Date()
      };

      const tempMessage = {
        id: `temp-${Date.now()}`,
        content: message.trim(),
        sender: 'user',
        senderName: 'Você',
        senderType: 'customer',
        time: new Date(),
        read: false
      };

      setMessages(prev => [...prev, tempMessage]);
      setMessage('');

      await apiService.sendMessage(chatId, messageData);
      console.log('✅ Mensagem enviada com sucesso');
      
      setTimeout(() => {
        loadMessages(true);
      }, 500);
      
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      setError('Erro ao enviar mensagem');
      
      setMessages(prev => prev.filter(msg => !msg.id.startsWith('temp-')));
      setMessage(messageData.text);
      
    } finally {
      setSending(false);
    }
  };

  const formatTime = (time) => {
    if (!time || !(time instanceof Date) || isNaN(time.getTime())) {
      return 'Agora';
    }
    
    try {
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);
      
      if (diffInSeconds < 30) {
        return 'Agora';
      } else if (diffInSeconds < 60) {
        return 'há alguns segundos';
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `há ${minutes} minuto${minutes > 1 ? 's' : ''}`;
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `há ${hours} hora${hours > 1 ? 's' : ''}`;
      } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `há ${days} dia${days > 1 ? 's' : ''}`;
      } else {
        return time.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: time.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
      }
    } catch (error) {
      console.log('⚠️ Erro ao formatar horário:', error);
      return 'Agora';
    }
  };

  const handleManualRefresh = async () => {
    await loadMessages();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-violet-600 mx-auto mb-3" />
          <p className="text-slate-600 text-sm font-medium">Carregando conversa...</p>
          <p className="text-xs text-slate-400 mt-1">Chat: {chatId}</p>
        </div>
      </div>
    );
  }

  if (error || !chatData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Erro na conversa</h3>
            <p className="text-slate-500 mb-4 text-sm">{error || 'Não foi possível carregar a conversa.'}</p>
            <div className="space-y-2">
              <Button onClick={() => navigate('/customer/dashboard')} className="w-full bg-violet-600 hover:bg-violet-700">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar aos Pedidos
              </Button>
              <Button onClick={loadChatData} variant="outline" className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-gradient-to-r from-violet-500 to-purple-600 px-4 pt-8 pb-4 relative overflow-hidden">
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
              <h1 className="text-white text-lg font-medium">Conversa</h1>
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
              <AvatarImage src={chatData.avatar} />
              <AvatarFallback className="bg-white/20 text-white font-bold">
                {chatData.initials}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center">
                <h2 className="text-white text-lg font-medium mr-2">
                  {chatData.name}
                </h2>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              </div>
              
              <div className="flex items-center text-violet-200 text-sm">
                <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></div>
                <span>Online</span>
                {chatData.orderId && (
                  <>
                    <span className="mx-2">•</span>
                    <Package className="h-3 w-3 mr-1" />
                    <span>Pedido #{chatData.orderId.slice(-6)}</span>
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
            
            <Card className="bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-violet-500 rounded-full flex items-center justify-center mr-3">
                    <MessageCircle className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-violet-800">Conversa iniciada</h3>
                    <p className="text-violet-600 text-sm">
                      {chatData.orderDetails?.productName 
                        ? `Sobre o produto: ${chatData.orderDetails.productName}`
                        : 'Tire suas dúvidas sobre o pedido'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-slate-900 mb-1">Nenhuma mensagem ainda</h3>
                <p className="text-slate-500">Envie sua primeira mensagem para a loja</p>
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
                          <AvatarImage src={chatData.avatar} />
                          <AvatarFallback className="bg-violet-100 text-violet-700 text-xs">
                            {chatData.initials}
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
                            ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-br-md' 
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
                className="pr-12 py-3 min-h-12 text-sm border-slate-200 focus:border-violet-300 focus:ring-violet-200 rounded-xl"
                placeholder="Digite sua mensagem..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyPress={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={sending}
              />
            </div>
            
            <Button 
              size="icon" 
              className={message.trim() && !sending
                ? "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 h-12 w-12 rounded-xl" 
                : "bg-slate-300 cursor-not-allowed h-12 w-12 rounded-xl"}
              disabled={!message.trim() || sending}
              onClick={handleSendMessage}
            >
              {sending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatPage;