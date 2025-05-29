import { Badge } from '@/components/ui/badge';
import { CheckCircleIcon, ClockIcon, EditIcon, XCircleIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export const NotificationStatusBadge = ({ status }) => {
  const statusConfig = {
    sent: { 
      label: 'Enviada', 
      className: 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 border-emerald-300',
      icon: CheckCircleIcon 
    },
    scheduled: { 
      label: 'Agendada', 
      className: 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300',
      icon: ClockIcon 
    },
    draft: { 
      label: 'Rascunho', 
      className: 'bg-gradient-to-r from-zinc-100 to-zinc-200 text-zinc-800 border-zinc-300',
      icon: EditIcon 
    },
    failed: { 
      label: 'Falhou', 
      className: 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300',
      icon: XCircleIcon 
    }
  };
  
  const config = statusConfig[status] || statusConfig.draft;
  const IconComponent = config.icon;
  
  return (
    <Badge className={cn("inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold border shadow-sm", config.className)}>
      <IconComponent className="w-3 h-3" />
      {config.label}
    </Badge>
  );
};

export const NotificationTypeBadge = ({ type }) => {
  const typeConfig = {
    order_update: { label: 'Pedido', className: 'bg-blue-100 text-blue-700 border-blue-200', icon: '📦' },
    promotion: { label: 'Promoção', className: 'bg-purple-100 text-purple-700 border-purple-200', icon: '🎁' },
    news: { label: 'Novidade', className: 'bg-green-100 text-green-700 border-green-200', icon: '📢' },
    feedback: { label: 'Avaliação', className: 'bg-amber-100 text-amber-700 border-amber-200', icon: '⭐' },
    reminder: { label: 'Lembrete', className: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: '⏰' },
    custom: { label: 'Custom', className: 'bg-zinc-100 text-zinc-700 border-zinc-200', icon: '💬' }
  };
  
  const config = typeConfig[type] || typeConfig.custom;
  
  return (
    <Badge variant="outline" className={cn("text-xs inline-flex items-center gap-1", config.className)}>
      <span>{config.icon}</span>
      {config.label}
    </Badge>
  );
};