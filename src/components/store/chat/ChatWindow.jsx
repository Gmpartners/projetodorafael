import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  EmptyState 
} from '@/components/ui/premium';
import { 
  FadeInUp, 
  HoverLift, 
  GlassCard 
} from '@/components/ui/animations';
import { 
  MessageSquare, 
  Send, 
  Star,
  CheckCircle,
  Clock,
  User,
  Package,
  AlertTriangle,
  Paperclip,
  Smile,
  UserPlus,
  ArrowDown,
  ImageIcon,
  FileIcon,
  Plus
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useStoreChat } from '@/contexts/StoreChatContext';
import ChatInitiator from '@/components/store/chat/ChatInitiator';

const MESSAGE_STATUS = {
  sending: Clock,
  sent: CheckCircle,
  delivered: CheckCircle,
  read: CheckCircle
};

const QUICK_EMOJIS = ['😊', '👍', '🎉', '❤️', '👏', '🔥', '💯', '✨'];

const ChatWindow = ({ activeChat, onStartNewChat, onSelectResponse }) => {
  const { messages, sendMessage, markChatAsRead, isLoading, error } = useStoreChat();
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPanel, setShowEmojiPanel] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isSending, setIsSending] = useState(false);
  
  const messagesEndRef = useRef(null);
  const scrollAreaRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: smooth ? 'smooth' : 'instant' 
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom(false);
  }, [messages, scrollToBottom]);

  const handleScroll = useCallback((event) => {
    const scrollElement = event.target;
    const { scrollTop, scrollHeight, clientHeight } = scrollElement;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollToBottom(!isNearBottom && messages.length > 3);
  }, [messages.length]);

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !activeChat || isSending) return;

    try {
      setIsSending(true);
      console.log('📤 ChatWindow: Enviando mensagem:', newMessage.trim());
      
      await sendMessage(newMessage.trim());
      
      setNewMessage('');
      
      if (inputRef.current) {
        inputRef.current.focus();
      }
      
      console.log('✅ ChatWindow: Mensagem enviada com sucesso');
      
    } catch (error) {
      console.error('❌ ChatWindow: Erro ao enviar mensagem:', error);
    } finally {
      setIsSending(false);
    }
  }, [newMessage, activeChat, sendMessage, isSending]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const getOrderStatusBadge = useMemo(() => (status) => {
    const statusMap = {
      'processing': { 
        label: 'Processando', 
        className: 'bg-blue-100 text-blue-800 border-blue-300',
        icon: Clock
      },
      'shipped': { 
        label: 'Enviado', 
        className: 'bg-purple-100 text-purple-800 border-purple-300',
        icon: Package
      },
      'delivered': { 
        label: 'Entregue', 
        className: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        icon: CheckCircle
      },
      'cancelled': { 
        label: 'Cancelado', 
        className: 'bg-red-100 text-red-800 border-red-300',
        icon: AlertTriangle
      }
    };

    const config = statusMap[status] || statusMap['processing'];
    const IconComponent = config.icon;

    return (
      <Badge className={cn("inline-flex items-center gap-1.5", config.className)}>
        <IconComponent className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  }, []);

  const formatMessageTime = useMemo(() => (timestamp) => {
    if (!timestamp) return 'Agora';
    
    const date = timestamp instanceof Date ? timestamp : 
                 timestamp.toDate ? timestamp.toDate() : 
                 new Date(timestamp);
    
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: ptBR
    });
  }, []);

  const handleQuickResponse = useCallback((text) => {
    setNewMessage(text);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const addEmoji = useCallback((emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPanel(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleMarkAsRead = useCallback(() => {
    if (activeChat) {
      markChatAsRead(activeChat.id);
    }
  }, [activeChat, markChatAsRead]);

  if (!activeChat) {
    return (
      <div className="h-full flex flex-col bg-white rounded-xl shadow-lg overflow-hidden max-h-full">
        <div className="p-4 border-b border-zinc-100 bg-gradient-to-r from-white via-purple-50/30 to-indigo-50/30 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 shadow-md">
              <MessageSquare className="h-5 w-5 text-blue-700" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900">Selecione uma Conversa</h3>
              <p className="text-sm text-zinc-600">Escolha uma conversa para visualizar ou inicie uma nova</p>
            </div>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-6 bg-white">
          <EmptyState
            icon={MessageSquare}
            title="Nenhuma conversa selecionada"
            description="Selecione uma conversa na lista ao lado para ver detalhes e responder ao cliente."
            action={
              <ChatInitiator onStartChat={onStartNewChat} />
            }
            variant="primary"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white rounded-xl shadow-lg overflow-hidden max-h-full">
      {/* Header simplificado - ícones ilustrativos removidos */}
      <div className="p-3 border-b border-zinc-100 bg-gradient-to-r from-white via-purple-50/30 to-indigo-50/30 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Avatar className="h-10 w-10 border-2 border-white shadow-md">
              <AvatarImage src={activeChat.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700 font-bold text-sm">
                {activeChat.initials}
              </AvatarFallback>
            </Avatar>
            <div className={cn(
              "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white",
              isOnline ? "bg-emerald-500" : "bg-zinc-400"
            )} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-zinc-900 truncate">{activeChat.name}</h3>
              {activeChat.isVerified && (
                <CheckCircle className="h-3 w-3 text-blue-500 flex-shrink-0" />
              )}
              {isOnline && (
                <span className="flex items-center text-xs text-emerald-600">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1 animate-pulse"></span>
                  Online agora
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2 mt-0.5">
              <Badge variant="outline" className="text-xs px-1.5 py-0.5 border-purple-200 text-purple-700 bg-purple-50">
                {activeChat.orderId}
              </Badge>
              {getOrderStatusBadge(activeChat.orderStatus)}
            </div>
          </div>
        </div>
      </div>

      {/* Área de mensagens com scroll dinâmico */}
      <div className="flex-1 overflow-hidden bg-gradient-to-br from-zinc-50/30 to-white relative min-h-0">
        <ScrollArea 
          ref={scrollAreaRef}
          className="h-full w-full chat-scrollbar"
          viewportProps={{ className: "h-full" }}
          onScroll={handleScroll}
        >
          <div className="h-full overflow-y-auto overflow-x-hidden">
            <div className="p-3 space-y-3 min-h-full">
              {/* Info do chat */}
              <div className="bg-gradient-to-r from-purple-50/70 to-indigo-50/70 border border-purple-100 rounded-lg p-3 transition-all hover:shadow-md">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
                    <AvatarImage src={activeChat.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700 font-semibold text-xs">
                      {activeChat.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-zinc-900 text-sm truncate">{activeChat.name}</h4>
                      {activeChat.hasRating && (
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs text-zinc-600">{activeChat.rating}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-zinc-600 truncate">Conversa sobre {activeChat.orderId}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-7 text-xs text-purple-600 hover:bg-purple-100"
                    onClick={handleMarkAsRead}
                  >
                    Marcar como lida
                  </Button>
                </div>
              </div>
              
              {/* Lista de mensagens */}
              <div className="space-y-3">
                {isLoading && messages.length === 0 ? (
                  <div className="text-center text-zinc-500 py-8">
                    <Clock className="h-8 w-8 mx-auto mb-2 animate-spin" />
                    <p>Carregando mensagens...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-zinc-500 py-8">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                    <p>Nenhuma mensagem ainda</p>
                    <p className="text-sm">Seja o primeiro a enviar uma mensagem!</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex",
                        message.sender === 'store' || message.senderType === 'store' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      <div className={cn(
                        "max-w-[75%] rounded-xl p-3 shadow-sm transition-all hover:shadow-md",
                        message.sender === 'store' || message.senderType === 'store'
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-md'
                          : message.senderType === 'system'
                          ? 'bg-zinc-100 text-zinc-700 rounded-lg text-center text-sm'
                          : 'bg-white border border-zinc-200 text-zinc-900 rounded-bl-md'
                      )}>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">
                          {message.content || message.text}
                        </p>
                        <div className={cn(
                          "flex items-center justify-between mt-2 text-xs",
                          message.sender === 'store' || message.senderType === 'store' 
                            ? 'text-purple-100' 
                            : 'text-zinc-500'
                        )}>
                          <span>{formatMessageTime(message.time || message.timestamp)}</span>
                          {(message.sender === 'store' || message.senderType === 'store') && message.status && MESSAGE_STATUS[message.status] && (
                            <div className="flex items-center space-x-1">
                              {React.createElement(MESSAGE_STATUS[message.status], {
                                className: cn("h-3 w-3", message.status === 'sending' && "animate-spin")
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>
        </ScrollArea>
        
        {showScrollToBottom && (
          <Button
            size="icon"
            className="absolute bottom-4 right-4 h-10 w-10 rounded-full shadow-lg bg-purple-600 hover:bg-purple-700 z-10"
            onClick={() => scrollToBottom()}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Respostas rápidas */}
      {onSelectResponse && (
        <div className="border-t border-zinc-100 p-2 bg-zinc-50/50 flex-shrink-0">
          <div className="flex space-x-2 overflow-x-auto">
            <Button
              variant="outline"
              size="sm"
              className="text-xs whitespace-nowrap"
              onClick={() => handleQuickResponse("Obrigado pela sua mensagem! Vou verificar isso para você.")}
            >
              Verificar
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs whitespace-nowrap"
              onClick={() => handleQuickResponse("Seu pedido está sendo preparado e será enviado em breve.")}
            >
              Status
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs whitespace-nowrap"
              onClick={() => handleQuickResponse("Ficamos felizes em ajudar! Se precisar de mais alguma coisa, estaremos aqui.")}
            >
              Agradecer
            </Button>
          </div>
        </div>
      )}

      {/* Input de mensagem fixo */}
      <div className="p-3 border-t border-zinc-100 bg-white flex-shrink-0">
        {showEmojiPanel && (
          <div className="mb-2 p-2 border rounded-lg bg-zinc-50">
            <div className="flex space-x-2">
              {QUICK_EMOJIS.map((emoji, index) => (
                <button
                  key={index}
                  className="hover:bg-white rounded p-1 transition-colors"
                  onClick={() => addEmoji(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-zinc-500 hover:text-zinc-700 flex-shrink-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              placeholder="Digite sua mensagem..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isSending}
              className="pr-16 h-9 text-sm border-zinc-200 focus:border-purple-300 focus:ring-purple-200 bg-white"
              maxLength={500}
            />
            <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex space-x-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-zinc-400 hover:text-zinc-600"
                onClick={() => setShowEmojiPanel(!showEmojiPanel)}
              >
                <Smile className="h-3 w-3" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-zinc-400 hover:text-zinc-600"
              >
                <Paperclip className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <Button 
            size="icon" 
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isSending}
            className={cn(
              "h-8 w-8 flex-shrink-0 transition-all",
              newMessage.trim() && !isSending
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 hover:scale-105" 
                : "bg-zinc-300 cursor-not-allowed"
            )}
          >
            {isSending ? (
              <Clock className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {newMessage.length > 400 && (
          <div className="mt-1 text-xs text-zinc-500 text-right">
            {newMessage.length}/500
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;