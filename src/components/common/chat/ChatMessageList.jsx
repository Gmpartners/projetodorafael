import { useEffect, useRef, useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Check, CheckCheck } from 'lucide-react';

// Componente para bolha de mensagem individual
const ChatBubble = ({ message, isCurrentUser }) => {
  const hasAttachment = message.attachment && message.attachment.url;
  
  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isCurrentUser && (
        <Avatar className="h-8 w-8 mr-2 flex-shrink-0">
          <AvatarImage src={message.sender.avatar} />
          <AvatarFallback className={message.sender.isStore ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}>
            {message.sender.isStore ? "LJ" : "CL"}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`flex flex-col max-w-[80%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
        <div className={`px-4 py-2 rounded-2xl max-w-full break-words ${
          isCurrentUser 
            ? 'bg-purple-600 text-white rounded-tr-none' 
            : 'bg-zinc-100 text-zinc-800 rounded-tl-none'
        }`}>
          {hasAttachment && message.attachment.type.startsWith('image/') && (
            <div className="mb-2">
              <img 
                src={message.attachment.url} 
                alt="Anexo" 
                className="max-w-full rounded-lg mb-2"
                style={{ maxHeight: '200px' }}
              />
            </div>
          )}
          
          {hasAttachment && !message.attachment.type.startsWith('image/') && (
            <div className="flex items-center mb-2 p-2 bg-white rounded-lg">
              <div className="bg-zinc-100 p-2 rounded mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-600">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate">{message.attachment.name}</p>
                <p className="text-xs text-zinc-500">{(message.attachment.size / 1024).toFixed(0)} KB</p>
              </div>
            </div>
          )}
          
          {message.text && <p className="whitespace-pre-wrap">{message.text}</p>}
        </div>
        
        <div className="flex items-center mt-1 space-x-1">
          <span className="text-xs text-zinc-500">
            {formatDistanceToNow(new Date(message.timestamp), { 
              addSuffix: true,
              locale: ptBR
            })}
          </span>
          
          {isCurrentUser && (
            <span className="text-xs">
              {message.read ? (
                <CheckCheck size={14} className="text-blue-500" />
              ) : (
                <Check size={14} className="text-zinc-400" />
              )}
            </span>
          )}
        </div>
      </div>
      
      {isCurrentUser && (
        <Avatar className="h-8 w-8 ml-2 flex-shrink-0">
          <AvatarImage src={message.sender.avatar} />
          <AvatarFallback className="bg-purple-100 text-purple-700">
            {message.sender.isStore ? "LJ" : "CL"}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

// Componente para agrupar mensagens por data
const MessageDateDivider = ({ date }) => {
  return (
    <div className="flex items-center my-4">
      <div className="flex-grow border-t border-zinc-200"></div>
      <Badge variant="outline" className="mx-4 bg-white text-zinc-500 font-normal">
        {date}
      </Badge>
      <div className="flex-grow border-t border-zinc-200"></div>
    </div>
  );
};

// Componente principal para lista de mensagens
const ChatMessageList = ({
  messages = [],
  currentUser = { id: 'current-user' },
  isLoading = false,
  onLoadMore = () => {},
  hasMoreMessages = false
}) => {
  const scrollAreaRef = useRef(null);
  const observerRef = useRef(null);
  const loadMoreTriggerRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);
  
  // Agrupar mensagens por data
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.timestamp).toLocaleDateString('pt-BR');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});
  
  // Efeito para rolar para o final quando novas mensagens chegam
  useEffect(() => {
    if (autoScroll && scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, autoScroll]);
  
  // Configurar o observador de interseção para carregar mais mensagens
  useEffect(() => {
    if (!hasMoreMessages) return;
    
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !isLoading) {
        onLoadMore();
      }
    }, options);
    
    if (loadMoreTriggerRef.current) {
      observerRef.current.observe(loadMoreTriggerRef.current);
    }
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMoreMessages, isLoading, onLoadMore]);
  
  // Detectar quando o usuário rola para cima para desativar o autoscroll
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isScrolledNearBottom = scrollHeight - scrollTop - clientHeight < 50;
    setAutoScroll(isScrolledNearBottom);
  };
  
  return (
    <ScrollArea 
      ref={scrollAreaRef} 
      className="h-[calc(100vh-280px)] w-full"
      onScroll={handleScroll}
    >
      {hasMoreMessages && (
        <div 
          ref={loadMoreTriggerRef}
          className="py-2 text-center"
        >
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-2/3 mx-auto rounded-full" />
              <Skeleton className="h-12 w-1/2 mx-auto rounded-full ml-12" />
            </div>
          ) : (
            <Badge 
              variant="outline" 
              className="cursor-pointer hover:bg-zinc-100"
              onClick={onLoadMore}
            >
              Carregar mensagens anteriores
            </Badge>
          )}
        </div>
      )}
      
      <div className="p-4">
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date}>
            <MessageDateDivider date={date} />
            {dateMessages.map((message) => (
              <ChatBubble
                key={message.id}
                message={message}
                isCurrentUser={message.sender.id === currentUser.id}
              />
            ))}
          </div>
        ))}
        
        {isLoading && messages.length === 0 && (
          <div className="space-y-4 py-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                <Skeleton className={`h-10 w-64 rounded-full ${i % 2 === 0 ? 'rounded-tr-none' : 'rounded-tl-none'}`} />
              </div>
            ))}
          </div>
        )}
        
        {messages.length === 0 && !isLoading && (
          <div className="text-center py-8 text-zinc-500">
            <p>Nenhuma mensagem ainda. Comece a conversa!</p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default ChatMessageList;