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
import { useCustomerChat } from '@/contexts/CustomerChatContext';
import { useStoreChat } from '@/contexts/StoreChatContext';
import { useAuth } from '@/contexts/AuthContext';

const safeFormatTimestamp = (timestamp) => {
  try {
    if (!timestamp) {
      return 'Recente';
    }

    let dateToFormat = null;

    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      dateToFormat = timestamp.toDate();
    }
    else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
      dateToFormat = new Date(timestamp);
    }
    else if (timestamp instanceof Date) {
      dateToFormat = timestamp;
    }
    else if (timestamp.seconds && typeof timestamp.seconds === 'number') {
      dateToFormat = new Date(timestamp.seconds * 1000);
    }

    if (!dateToFormat || isNaN(dateToFormat.getTime())) {
      return 'Recente';
    }

    const year = dateToFormat.getFullYear();
    if (year < 2020 || year > 2030) {
      return 'Recente';
    }

    return formatDistanceToNow(dateToFormat, { 
      addSuffix: true, 
      locale: ptBR 
    });

  } catch (error) {
    return 'Recente';
  }
};

const ChatListItem = ({ chat, activeChat, onClick }) => {
  const isActive = activeChat && activeChat.id === chat.id;
  
  const formattedTime = safeFormatTimestamp(chat.lastMessage?.timestamp);
  
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-blue-500';
    }
  };

  const getStatusIcon = () => {
    if (chat.hasAttention) return <AlertCircle className="h-2.5 w-2.5 text-amber-600" />;
    if (chat.unreadCount > 0 || chat.userUnreadCount > 0) return <MessageCircle className="h-2.5 w-2.5 text-purple-600" />;
    return <CheckCircle className="h-2.5 w-2.5 text-emerald-600" />;
  };

  const unreadCount = chat.unreadCount || chat.userUnreadCount || 0;
  
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
        {chat.priority && chat.priority !== 'low' && (
          <div className={cn(
            "absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full",
            getPriorityColor(chat.priority)
          )} />
        )}
        
        <div className="flex items-start gap-2.5">
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
            
            {chat.online && (
              <div className="absolute -bottom-0.5 -right-0.5">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white shadow-sm flex items-center justify-center">
                  <div className="w-1 h-1 bg-emerald-400 rounded-full animate-ping opacity-75" />
                </div>
              </div>
            )}
            
            {unreadCount > 0 && (
              <PulseEffect color="purple" size="sm" className="absolute -top-0.5 -right-0.5">
                <Badge className="bg-purple-600 text-white text-xs min-w-[16px] h-3.5 flex items-center justify-center p-0 shadow-lg">
                  {unreadCount}
                </Badge>
              </PulseEffect>
            )}
          </div>
          
          <div className="flex-1 min-w-0 space-y-0.5">
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
                
                {chat.orderId && (
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
                )}
              </div>
              
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
            
            <div className="space-y-0.5">
              <p className={cn(
                "text-xs line-clamp-1 transition-colors",
                unreadCount > 0 
                  ? "text-zinc-900 font-medium" 
                  : "text-zinc-600"
              )}>
                {chat.lastMessage?.text || 'Conversa iniciada'}
              </p>
              
              <div className="flex items-center space-x-0.5">
                {chat.hasAttachment && (
                  <Badge variant="outline" className="text-xs px-0.5 py-0 bg-blue-50 text-blue-700 border-blue-200 h-3">
                    📎
                  </Badge>
                )}
                {chat.hasRating && chat.rating && (
                  <div className="flex items-center space-x-0.5">
                    <Star className="h-2.5 w-2.5 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs text-zinc-600">{chat.rating}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute top-1.5 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="sm" className="h-4 w-4 p-0 hover:bg-white/80">
            <MoreVertical className="h-2.5 w-2.5" />
          </Button>
        </div>
      </div>
    </HoverLift>
  );
};

const ChatList = ({ 
  onSelectChat,
  userType = 'store',
  activeChat = null,
  onCreateChat = null
}) => {
  const { userProfile } = useAuth();
  
  const customerChatContext = userType === 'customer' ? useCustomerChat() : null;
  const storeChatContext = userType === 'store' ? useStoreChat() : null;
  
  const {
    chats = [],
    stats = { total: 0, unread: 0, online: 0 },
    isLoading = false,
    error = null,
    loadActiveChats = () => {},
    markChatAsRead = () => {}
  } = userType === 'customer' ? (customerChatContext || {}) : (storeChatContext || {});

  const [filteredChats, setFilteredChats] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filterChats = (chatsList, search, filter) => {
    let result = chatsList;
    
    if (search) {
      result = result.filter(chat => 
        chat.name.toLowerCase().includes(search.toLowerCase()) ||
        (chat.orderId && chat.orderId.toLowerCase().includes(search.toLowerCase())) ||
        (chat.lastMessage?.text && chat.lastMessage.text.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    switch (filter) {
      case 'unread':
        result = result.filter(chat => (chat.unreadCount || chat.userUnreadCount || 0) > 0);
        break;
      case 'online':
        result = result.filter(chat => chat.online);
        break;
      default:
        break;
    }
    
    result.sort((a, b) => {
      const aUnread = a.unreadCount || a.userUnreadCount || 0;
      const bUnread = b.unreadCount || b.userUnreadCount || 0;
      if (aUnread !== bUnread) return bUnread - aUnread;
      if (a.online !== b.online) return b.online - a.online;
      const aTime = a.lastMessage?.timestamp || a.lastUpdated || new Date(0);
      const bTime = b.lastMessage?.timestamp || b.lastUpdated || new Date(0);
      return new Date(bTime) - new Date(aTime);
    });
    
    return result;
  };
  
  useEffect(() => {
    const filtered = filterChats(chats, searchTerm, activeFilter);
    setFilteredChats(filtered);
  }, [searchTerm, activeFilter, chats]);
  
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleRefresh = async () => {
    try {
      await loadActiveChats();
    } catch (error) {
      console.error('Erro ao atualizar conversas:', error);
    }
  };
  
  const handleSelectChat = (chat) => {
    if (onSelectChat) {
      onSelectChat(chat);
    }
    
    if (chat.unreadCount > 0 || chat.userUnreadCount > 0) {
      markChatAsRead(chat.id);
    }
  };

  if (!chats && isLoading) {
    return (
      <div className="h-full flex flex-col bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-3 border-b border-zinc-100">
          <LoadingSkeleton rows={1} showAvatar={false} />
        </div>
        <div className="flex-1 p-2">
          <LoadingSkeleton rows={4} showAvatar />
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col bg-white rounded-xl shadow-lg overflow-hidden">
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
        
        <div className="grid grid-cols-3 gap-1.5">
          <div className="text-center p-1.5 rounded bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
            <p className="text-xs font-bold text-purple-900">{stats.total}</p>
            <p className="text-xs text-purple-700">Total</p>
          </div>
          <div className="text-center p-1.5 rounded bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
            <p className="text-xs font-bold text-blue-900">{stats.unread}</p>
            <p className="text-xs text-blue-700">Não Lidas</p>
          </div>
          <div className="text-center p-1.5 rounded bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200">
            <p className="text-xs font-bold text-emerald-900">{stats.online}</p>
            <p className="text-xs text-emerald-700">Online</p>
          </div>
        </div>
      </div>
      
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
      
      {error && (
        <div className="p-2 bg-red-50 border-b border-red-200 flex-shrink-0">
          <div className="flex items-center space-x-2 text-red-800">
            <AlertCircle className="h-3 w-3" />
            <span className="text-xs">{error}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefresh}
              className="text-red-600 hover:text-red-800 h-5 text-xs"
            >
              Tentar novamente
            </Button>
          </div>
        </div>
      )}
      
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
            <TabsTrigger value="online" className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all text-xs h-6">
              Online
              <div className="ml-1 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            </TabsTrigger>
          </TabsList>
        </div>
        
        <div className="flex-1 overflow-hidden bg-white">
          <TabsContent value="all" className="flex-1 m-0 h-full data-[state=active]:flex data-[state=active]:flex-col overflow-hidden">
            <div className="flex-1 overflow-hidden bg-white">
              <ScrollArea className="h-full">
                {isLoading && chats.length === 0 ? (
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
                      title="Nenhum usuário online"
                      description="Usuários estão offline."
                      variant="default"
                    />
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>
        </div>
      </Tabs>
      
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