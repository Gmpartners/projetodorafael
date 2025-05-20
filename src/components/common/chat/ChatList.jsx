import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  LoadingSkeleton, 
  EmptyState,
  TrendIndicator 
} from '@/components/ui/premium';
import { 
  FadeInUp, 
  HoverLift, 
  GlassCard, 
  PulseEffect 
} from '@/components/ui/animations';
import { 
  MessageSquare, 
  Search, 
  RefreshCcw, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Users,
  Zap,
  Star,
  UserCheck,
  MessageCircle,
  Smartphone,
  Mail,
  Phone,
  MoreVertical,
  Pin,
  Archive
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// Componente premium para item de conversa - COMPACTO IGUAL AO SKELETON
const ChatListItem = ({ chat, activeChat, onClick }) => {
  const isActive = activeChat && activeChat.id === chat.id;
  
  const formattedTime = formatDistanceToNow(new Date(chat.lastMessage.timestamp), {
    addSuffix: true,
    locale: ptBR
  });
  
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-blue-500';
    }
  };

  const getStatusIcon = () => {
    if (chat.hasAttention) return <AlertCircle className="h-2.5 w-2.5 text-amber-600" />;
    if (chat.unreadCount > 0) return <MessageCircle className="h-2.5 w-2.5 text-purple-600" />;
    return <CheckCircle className="h-2.5 w-2.5 text-emerald-600" />;
  };
  
  return (
    <HoverLift>
      <div 
        className={cn(
          "relative p-2.5 cursor-pointer transition-all duration-300 border-l-4 group bg-white",
          isActive 
            ? 'border-l-purple-600 bg-gradient-to-r from-purple-50 via-white to-purple-50/30 shadow-lg' 
            : 'border-l-transparent hover:border-l-purple-400 hover:bg-gradient-to-r hover:from-purple-50/30 hover:to-transparent hover:shadow-md'
        )}
        onClick={() => onClick(chat)}
      >
        {/* Priority Indicator */}
        {chat.priority && chat.priority !== 'low' && (
          <div className={cn(
            "absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full",
            getPriorityColor(chat.priority)
          )} />
        )}
        
        <div className="flex items-start gap-2.5">
          {/* Avatar with Status - MENOR */}
          <div className="relative flex-shrink-0">
            <Avatar className={cn(
              "h-8 w-8 border-2 shadow-sm transition-all duration-300",
              isActive ? "border-purple-300 shadow-purple-200" : "border-white group-hover:border-purple-200"
            )}>
              <AvatarImage src={chat.avatar} className="object-cover" />
              <AvatarFallback className="bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700 font-semibold text-xs">
                {chat.initials}
              </AvatarFallback>
            </Avatar>
            
            {/* Online Status - MENOR */}
            {chat.online && (
              <div className="absolute -bottom-0.5 -right-0.5">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white shadow-sm flex items-center justify-center">
                  <div className="w-1 h-1 bg-emerald-400 rounded-full animate-ping opacity-75" />
                </div>
              </div>
            )}
            
            {/* Unread Indicator - MENOR */}
            {chat.unreadCount > 0 && (
              <PulseEffect color="purple" size="sm" className="absolute -top-0.5 -right-0.5">
                <Badge className="bg-purple-600 text-white text-xs min-w-[16px] h-3.5 flex items-center justify-center p-0 shadow-lg">
                  {chat.unreadCount}
                </Badge>
              </PulseEffect>
            )}
          </div>
          
          {/* Content - COMPACTO */}
          <div className="flex-1 min-w-0 space-y-0.5">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="space-y-0.5 min-w-0 flex-1">
                <div className="flex items-center space-x-1">
                  <h4 className={cn(
                    "font-semibold truncate transition-colors text-xs",
                    isActive ? "text-purple-900" : "text-zinc-900 group-hover:text-purple-900"
                  )}>
                    {chat.name}
                  </h4>
                  {chat.isVerified && (
                    <UserCheck className="h-2.5 w-2.5 text-blue-500 flex-shrink-0" />
                  )}
                </div>
                
                {/* Order Badge - MENOR */}
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs px-1 py-0 font-medium transition-colors h-4",
                    isActive 
                      ? "border-purple-300 text-purple-700 bg-purple-50" 
                      : "border-zinc-200 text-zinc-700 bg-zinc-50 group-hover:border-purple-200 group-hover:text-purple-700"
                  )}
                >
                  {chat.orderId}
                </Badge>
              </div>
              
              {/* Time & Status - MENOR */}
              <div className="flex flex-col items-end space-y-0.5 flex-shrink-0">
                <span className="text-xs text-zinc-500">
                  {formattedTime}
                </span>
                <div className="flex items-center space-x-0.5">
                  {getStatusIcon()}
                  {chat.orderStatus && (
                    <div className={cn(
                      "w-1 h-1 rounded-full",
                      chat.orderStatus === 'processing' && "bg-blue-400",
                      chat.orderStatus === 'shipped' && "bg-purple-400", 
                      chat.orderStatus === 'delivered' && "bg-emerald-400",
                      chat.orderStatus === 'cancelled' && "bg-red-400"
                    )} />
                  )}
                </div>
              </div>
            </div>
            
            {/* Message Preview - MENOR */}
            <div className="space-y-0.5">
              <p className={cn(
                "text-xs line-clamp-1 transition-colors", // line-clamp-1 ao invés de 2
                chat.unreadCount > 0 
                  ? "text-zinc-900 font-medium" 
                  : "text-zinc-600"
              )}>
                {chat.lastMessage.text}
              </p>
              
              {/* Tags - MENORES */}
              <div className="flex items-center space-x-0.5">
                {chat.hasAttachment && (
                  <Badge variant="outline" className="text-xs px-0.5 py-0 bg-blue-50 text-blue-700 border-blue-200 h-3">
                    📎
                  </Badge>
                )}
                {chat.isUrgent && (
                  <Badge variant="outline" className="text-xs px-0.5 py-0 bg-red-50 text-red-700 border-red-200 h-3">
                    ⚡
                  </Badge>
                )}
                {chat.hasRating && (
                  <div className="flex items-center space-x-0.5">
                    <Star className="h-2.5 w-2.5 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs text-zinc-600">{chat.rating}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Hover Actions - MENOR */}
        <div className="absolute top-1.5 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="sm" className="h-4 w-4 p-0 hover:bg-white/80">
            <MoreVertical className="h-2.5 w-2.5" />
          </Button>
        </div>
      </div>
    </HoverLift>
  );
};

// Componente principal para lista de conversas premium
const ChatList = ({ 
  onSelectChat,
  userType = 'store',
  activeChat = null,
  onCreateChat = null
}) => {
  const [chats, setChats] = useState([]);
  const [filteredChats, setFilteredChats] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    urgent: 0,
    online: 0
  });
  
  // Carregar conversas (simulação com dados realistas)
  useEffect(() => {
    const loadChats = async () => {
      setIsLoading(true);
      
      // Simular carregamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Dados simulados mais realistas
      const mockChats = [
        {
          id: 'chat-1',
          name: 'Ana Silva Costa',
          orderId: '#ORD-2024-001',
          orderStatus: 'processing',
          avatar: 'https://i.pravatar.cc/150?u=ana',
          initials: 'AC',
          isCustomer: userType === 'store',
          isVerified: true,
          online: true,
          lastMessage: {
            text: 'Oi! Gostaria de saber se meu pedido já foi processado? Está há 2 dias como "confirmado" e estou ansiosa para receber.',
            timestamp: new Date(Date.now() - 15 * 60 * 1000),
            senderId: userType === 'store' ? 'customer-1' : 'store-1'
          },
          unreadCount: 3,
          hasAttention: true,
          priority: 'high',
          hasAttachment: false,
          hasRating: true,
          rating: 4.8,
          isUrgent: false
        },
        {
          id: 'chat-2',
          name: 'Carlos Eduardo Santos',
          orderId: '#ORD-2024-002',
          orderStatus: 'shipped',
          avatar: 'https://i.pravatar.cc/150?u=carlos',
          initials: 'CS',
          isCustomer: userType === 'store',
          isVerified: true,
          online: true,
          lastMessage: {
            text: 'Perfeito! Acabei de receber o código de rastreamento. Muito obrigado pelo excelente atendimento! 🙏',
            timestamp: new Date(Date.now() - 45 * 60 * 1000),
            senderId: 'customer-2'
          },
          unreadCount: 0,
          hasAttention: false,
          priority: 'low',
          hasAttachment: false,
          hasRating: true,
          rating: 5.0,
          isUrgent: false
        },
        {
          id: 'chat-3',
          name: 'Maria Fernanda Lima',
          orderId: '#ORD-2024-003',
          orderStatus: 'delivered',
          avatar: 'https://i.pravatar.cc/150?u=maria',
          initials: 'ML',
          isCustomer: userType === 'store',
          isVerified: false,
          online: false,
          lastMessage: {
            text: 'Infelizmente o produto chegou com defeito. A embalagem estava danificada e o item não funciona corretamente.',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            senderId: 'customer-3'
          },
          unreadCount: 2,
          hasAttention: true,
          priority: 'urgent',
          hasAttachment: true,
          hasRating: false,
          isUrgent: true
        },
        {
          id: 'chat-4',
          name: 'Roberto Almeida',
          orderId: '#ORD-2024-004',
          orderStatus: 'processing',
          avatar: 'https://i.pravatar.cc/150?u=roberto',
          initials: 'RA',
          isCustomer: userType === 'store',
          isVerified: true,
          online: false,
          lastMessage: {
            text: 'Bom dia! Preciso alterar o endereço de entrega do meu pedido. É possível fazer essa modificação?',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
            senderId: 'customer-4'
          },
          unreadCount: 1,
          hasAttention: true,
          priority: 'medium',
          hasAttachment: false,
          hasRating: false,
          isUrgent: false
        },
        {
          id: 'chat-5',
          name: 'Juliana Rodrigues',
          orderId: '#ORD-2024-005',
          orderStatus: 'cancelled',
          avatar: 'https://i.pravatar.cc/150?u=juliana',
          initials: 'JR',
          isCustomer: userType === 'store',
          isVerified: true,
          online: false,
          lastMessage: {
            text: 'Entendo perfeitamente. Obrigada pela explicação sobre o cancelamento. O reembolso já foi processado?',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            senderId: 'customer-5'
          },
          unreadCount: 0,
          hasAttention: false,
          priority: 'low',
          hasAttachment: false,
          hasRating: true,
          rating: 4.2,
          isUrgent: false
        }
      ];
      
      setChats(mockChats);
      
      // Calcular estatísticas
      const newStats = {
        total: mockChats.length,
        unread: mockChats.filter(chat => chat.unreadCount > 0).length,
        urgent: mockChats.filter(chat => chat.priority === 'urgent' || chat.isUrgent).length,
        online: mockChats.filter(chat => chat.online).length
      };
      setStats(newStats);
      
      filterChats(mockChats, searchTerm, activeFilter);
      setIsLoading(false);
    };
    
    loadChats();
  }, [userType]);
  
  // Filtrar conversas com base na busca e no filtro ativo
  const filterChats = (chatsList, search, filter) => {
    let result = chatsList;
    
    // Filtrar por termo de busca
    if (search) {
      result = result.filter(chat => 
        chat.name.toLowerCase().includes(search.toLowerCase()) ||
        chat.orderId.toLowerCase().includes(search.toLowerCase()) ||
        chat.lastMessage.text.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Filtrar por status
    switch (filter) {
      case 'unread':
        result = result.filter(chat => chat.unreadCount > 0);
        break;
      case 'attention':
        result = result.filter(chat => chat.hasAttention || chat.isUrgent);
        break;
      case 'online':
        result = result.filter(chat => chat.online);
        break;
      case 'urgent':
        result = result.filter(chat => chat.priority === 'urgent' || chat.isUrgent);
        break;
      default:
        // Filtro 'all' não precisa de filtro adicional
        break;
    }
    
    // Ordenar por importância
    result.sort((a, b) => {
      // Urgente primeiro
      if (a.isUrgent !== b.isUrgent) return b.isUrgent - a.isUrgent;
      // Não lidas primeiro  
      if (a.unreadCount !== b.unreadCount) return b.unreadCount - a.unreadCount;
      // Online primeiro
      if (a.online !== b.online) return b.online - a.online;
      // Por último timestamp
      return new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp);
    });
    
    setFilteredChats(result);
  };
  
  // Atualizar filtro quando o termo de busca mudar
  useEffect(() => {
    filterChats(chats, searchTerm, activeFilter);
  }, [searchTerm, activeFilter, chats]);
  
  // Manipulador para alteração de filtro
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };
  
  // Manipulador para busca
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Manipulador para atualização de lista
  const handleRefresh = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsLoading(false);
  };
  
  // Manipulador para seleção de conversa
  const handleSelectChat = (chat) => {
    if (onSelectChat) {
      onSelectChat(chat);
      
      // Atualizar o contador de não lidas
      setChats(prevChats => 
        prevChats.map(c => 
          c.id === chat.id 
            ? { ...c, unreadCount: 0 } 
            : c
        )
      );
    }
  };
  
  return (
    <div className="h-full flex flex-col bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header Super Compacto */}
      <div className="p-3 border-b border-zinc-100 bg-gradient-to-r from-white via-purple-50/30 to-indigo-50/30 flex-shrink-0">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 shadow-md">
              <MessageSquare className="h-4 w-4 text-purple-700" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900">Conversas</h3>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleRefresh}
            disabled={isLoading}
            className={cn(
              "h-6 w-6 hover:bg-purple-50 transition-all",
              isLoading && 'animate-spin'
            )}
          >
            <RefreshCcw className="h-3 w-3 text-purple-600" />
          </Button>
        </div>
        
        {/* Stats Cards Mini */}
        <div className="grid grid-cols-4 gap-1.5">
          <div className="text-center p-1.5 rounded bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
            <p className="text-xs font-bold text-purple-900">{stats.total}</p>
            <p className="text-xs text-purple-700">Total</p>
          </div>
          <div className="text-center p-1.5 rounded bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
            <p className="text-xs font-bold text-blue-900">{stats.unread}</p>
            <p className="text-xs text-blue-700">Não Lidas</p>
          </div>
          <div className="text-center p-1.5 rounded bg-gradient-to-br from-red-50 to-red-100 border border-red-200">
            <p className="text-xs font-bold text-red-900">{stats.urgent}</p>
            <p className="text-xs text-red-700">Urgentes</p>
          </div>
          <div className="text-center p-1.5 rounded bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200">
            <p className="text-xs font-bold text-emerald-900">{stats.online}</p>
            <p className="text-xs text-emerald-700">Online</p>
          </div>
        </div>
      </div>
      
      {/* Search Compacto */}
      <div className="p-2 border-b border-zinc-100 flex-shrink-0 bg-white">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-zinc-400" />
          <Input
            placeholder="Buscar conversas..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-7 pr-4 h-7 text-xs border-zinc-200 focus:border-purple-300 focus:ring-purple-200 bg-zinc-50 focus:bg-white transition-colors"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0.5 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-zinc-100"
              onClick={() => setSearchTerm('')}
            >
              <span className="text-zinc-400 text-sm">×</span>
            </Button>
          )}
        </div>
      </div>
      
      {/* Tabs Mini */}
      <Tabs defaultValue="all" className="flex-1 flex flex-col overflow-hidden bg-white" onValueChange={handleFilterChange}>
        <div className="px-2 pt-2 flex-shrink-0 bg-white">
          <TabsList className="w-full bg-zinc-100/80 backdrop-blur-sm p-0.5 rounded-lg h-7">
            <TabsTrigger value="all" className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all text-xs h-6">
              Todas
            </TabsTrigger>
            <TabsTrigger value="unread" className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all text-xs h-6">
              Não Lidas
              {stats.unread > 0 && (
                <Badge className="ml-1 bg-blue-600 text-white text-xs min-w-[12px] h-3 p-0 flex items-center justify-center">
                  {stats.unread}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="urgent" className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all text-xs h-6">
              Urgentes
              {stats.urgent > 0 && (
                <Badge className="ml-1 bg-red-600 text-white text-xs min-w-[12px] h-3 p-0 flex items-center justify-center">
                  {stats.urgent}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="online" className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all text-xs h-6">
              Online
              <div className="ml-1 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            </TabsTrigger>
          </TabsList>
        </div>
        
        {/* Área de Conversas com Scroll - ALTURA FIXA IGUAL AO SKELETON */}
        <div className="flex-1 overflow-hidden bg-white">
          <TabsContent value="all" className="flex-1 m-0 h-full data-[state=active]:flex data-[state=active]:flex-col overflow-hidden">
            <div className="flex-1 overflow-hidden bg-white">
              <ScrollArea className="h-full">
                {isLoading ? (
                  <div className="p-2 bg-white">
                    <LoadingSkeleton rows={4} showAvatar />
                  </div>
                ) : filteredChats.length > 0 ? (
                  <div className="divide-y divide-zinc-100 bg-white">
                    {filteredChats.map((chat, index) => (
                      <ChatListItem
                        key={chat.id}
                        chat={chat}
                        activeChat={activeChat}
                        onClick={handleSelectChat}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-white">
                    <EmptyState
                      icon={MessageSquare}
                      title="Nenhuma conversa"
                      description={searchTerm ? 'Tente outro termo.' : 'Inicie uma nova.'}
                      variant="primary"
                    />
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>
          
          {/* Outras tabs com o mesmo padrão */}
          <TabsContent value="unread" className="flex-1 m-0 h-full data-[state=active]:flex data-[state=active]:flex-col overflow-hidden">
            <div className="flex-1 overflow-hidden bg-white">
              <ScrollArea className="h-full">
                {isLoading ? (
                  <div className="p-2 bg-white">
                    <LoadingSkeleton rows={3} showAvatar />
                  </div>
                ) : filteredChats.length > 0 ? (
                  <div className="divide-y divide-zinc-100 bg-white">
                    {filteredChats.map((chat, index) => (
                      <ChatListItem
                        key={chat.id}
                        chat={chat}
                        activeChat={activeChat}
                        onClick={handleSelectChat}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-white">
                    <EmptyState
                      icon={CheckCircle}
                      title="Tudo em dia!"
                      description="Não há mensagens não lidas."
                      variant="success"
                    />
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>
          
          <TabsContent value="urgent" className="flex-1 m-0 h-full data-[state=active]:flex data-[state=active]:flex-col overflow-hidden">
            <div className="flex-1 overflow-hidden bg-white">
              <ScrollArea className="h-full">
                {isLoading ? (
                  <div className="p-2 bg-white">
                    <LoadingSkeleton rows={2} showAvatar />
                  </div>
                ) : filteredChats.length > 0 ? (
                  <div className="divide-y divide-zinc-100 bg-white">
                    {filteredChats.map((chat, index) => (
                      <ChatListItem
                        key={chat.id}
                        chat={chat}
                        activeChat={activeChat}
                        onClick={handleSelectChat}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-white">
                    <EmptyState
                      icon={Zap}
                      title="Nenhuma conversa urgente"
                      description="Situações críticas resolvidas."
                      variant="success"
                    />
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>
          
          <TabsContent value="online" className="flex-1 m-0 h-full data-[state=active]:flex data-[state=active]:flex-col overflow-hidden">
            <div className="flex-1 overflow-hidden bg-white">
              <ScrollArea className="h-full">
                {isLoading ? (
                  <div className="p-2 bg-white">
                    <LoadingSkeleton rows={2} showAvatar />
                  </div>
                ) : filteredChats.length > 0 ? (
                  <div className="divide-y divide-zinc-100 bg-white">
                    {filteredChats.map((chat, index) => (
                      <ChatListItem
                        key={chat.id}
                        chat={chat}
                        activeChat={activeChat}
                        onClick={handleSelectChat}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-white">
                    <EmptyState
                      icon={Users}
                      title="Nenhum cliente online"
                      description="Clientes estão offline."
                      variant="default"
                    />
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>
        </div>
      </Tabs>
      
      {/* Footer ultra compacto com ação */}
      {userType === 'store' && onCreateChat && (
        <div className="p-2 border-t border-zinc-100 bg-white flex-shrink-0">
          <Button
            onClick={onCreateChat}
            className="w-full btn-premium h-7 text-xs"
          >
            <MessageSquare className="h-3 w-3 mr-1" />
            Nova Conversa
          </Button>
        </div>
      )}
    </div>
  );
};

export default ChatList;