import React from 'react';
import { 
  BellIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  FileEditIcon,
  PackageIcon,
  TagIcon,
  MessageSquareIcon,
  StarIcon,
  BellRingIcon,
  EyeIcon // Adicionando o EyeIcon que estava faltando
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const getNotificationIcon = (type) => {
  switch (type) {
    case 'order_update':
      return <PackageIcon className="h-4 w-4 text-blue-600" />;
    case 'order_confirmation':
      return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
    case 'promotion':
      return <TagIcon className="h-4 w-4 text-amber-600" />;
    case 'feedback':
      return <StarIcon className="h-4 w-4 text-orange-600" />;
    case 'custom':
      return <MessageSquareIcon className="h-4 w-4 text-purple-600" />;
    case 'news':
    default:
      return <BellRingIcon className="h-4 w-4 text-zinc-600" />;
  }
};

const getStatusBadge = (status) => {
  switch (status) {
    case 'sent':
      return (
        <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">
          <CheckCircleIcon className="h-3 w-3 mr-1" />
          Enviada
        </Badge>
      );
    case 'scheduled':
      return (
        <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50">
          <ClockIcon className="h-3 w-3 mr-1" />
          Agendada
        </Badge>
      );
    case 'draft':
    default:
      return (
        <Badge variant="outline" className="border-zinc-200 text-zinc-700 bg-zinc-50">
          <FileEditIcon className="h-3 w-3 mr-1" />
          Rascunho
        </Badge>
      );
  }
};

const getTypeName = (type) => {
  switch (type) {
    case 'order_update':
      return 'Atualização de Pedido';
    case 'order_confirmation':
      return 'Confirmação de Pedido';
    case 'promotion':
      return 'Promoção';
    case 'feedback':
      return 'Avaliação';
    case 'news':
      return 'Novidades';
    case 'custom':
    default:
      return 'Personalizada';
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  
  return formatDistanceToNow(new Date(dateString), {
    addSuffix: true,
    locale: ptBR
  });
};

const EmptyState = ({ onRefresh }) => (
  <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-zinc-300 rounded-lg bg-zinc-50">
    <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mb-3">
      <BellIcon className="h-6 w-6 text-zinc-400" />
    </div>
    <h3 className="text-lg font-medium text-zinc-900 mb-1">Nenhuma notificação encontrada</h3>
    <p className="text-sm text-zinc-500 max-w-md mb-4">
      Nenhuma notificação corresponde aos critérios de filtro atuais.
    </p>
    <button 
      onClick={onRefresh}
      className="text-purple-600 hover:text-purple-700 text-sm font-medium"
    >
      Redefinir filtros
    </button>
  </div>
);

const LoadingState = () => (
  <div className="animate-pulse space-y-3">
    {[1, 2, 3].map((item) => (
      <div 
        key={item}
        className="bg-white border border-zinc-200 rounded-lg p-4"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-zinc-200"></div>
          <div className="flex-1">
            <div className="h-4 bg-zinc-200 rounded w-1/4 mb-2"></div>
            <div className="h-3 bg-zinc-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-zinc-200 rounded w-1/2"></div>
          </div>
          <div className="w-20 h-6 bg-zinc-200 rounded-full"></div>
        </div>
      </div>
    ))}
  </div>
);

const NotificationList = ({ 
  notifications, 
  isLoading, 
  onSelectNotification,
  selectedId,
  onRefresh
}) => {
  if (isLoading) {
    return <LoadingState />;
  }
  
  if (notifications.length === 0) {
    return <EmptyState onRefresh={onRefresh} />;
  }
  
  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <div 
          key={notification.id}
          className={cn(
            "bg-white border rounded-lg p-4 transition-all cursor-pointer",
            selectedId === notification.id 
              ? "border-purple-300 bg-purple-50 shadow-sm"
              : "border-zinc-200 hover:border-purple-200 hover:bg-zinc-50"
          )}
          onClick={() => onSelectNotification(notification)}
        >
          <div className="flex items-start gap-3">
            {notification.targetCustomer ? (
              <Avatar className="h-10 w-10">
                <AvatarImage src={`https://avatar.vercel.sh/${notification.targetCustomer.id}`} />
                <AvatarFallback className="bg-purple-100 text-purple-700">
                  {notification.targetCustomer.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="h-10 w-10 bg-zinc-100 rounded-full flex items-center justify-center">
                {getNotificationIcon(notification.type)}
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center mb-1">
                <span className="text-xs font-medium text-zinc-500 mr-2">
                  {getTypeName(notification.type)}
                </span>
                {notification.targetCustomer ? (
                  <span className="text-sm font-medium text-zinc-900 truncate">
                    {notification.targetCustomer.name}
                  </span>
                ) : notification.targetSegment && (
                  <span className="text-sm font-medium text-zinc-900">
                    Segmento: {notification.targetSegment}
                  </span>
                )}
              </div>
              
              <h3 className="font-medium text-zinc-900 mb-1 line-clamp-1">{notification.title}</h3>
              <p className="text-sm text-zinc-600 line-clamp-1">{notification.body}</p>
              
              <div className="flex items-center mt-2 text-xs text-zinc-500">
                {notification.sentAt ? (
                  <span>Enviada {formatDate(notification.sentAt)}</span>
                ) : notification.scheduledFor ? (
                  <span>Agendada para {formatDate(notification.scheduledFor)}</span>
                ) : (
                  <span>Criada recentemente</span>
                )}
                
                {notification.readAt && (
                  <span className="ml-3 flex items-center text-green-600">
                    <EyeIcon className="h-3 w-3 mr-1" /> 
                    Lida {formatDate(notification.readAt)}
                  </span>
                )}
              </div>
            </div>
            
            <div>
              {getStatusBadge(notification.status)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationList;