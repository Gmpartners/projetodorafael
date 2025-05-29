import React from 'react';
import { 
  BellRingIcon, 
  ClockIcon, 
  SendIcon, 
  FileEditIcon,
  EyeIcon,
  MousePointerIcon,
  PercentIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

const StatCard = ({ title, value, description, icon, iconColor, bgColor }) => {
  return (
    <div className={cn(
      "bg-white rounded-lg border border-zinc-200 p-5 flex flex-col",
    )}>
      <div className="flex items-center mb-3">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center mr-3",
          bgColor
        )}>
          {icon}
        </div>
        <h3 className="font-medium text-zinc-700">{title}</h3>
      </div>
      
      <div className="mt-auto">
        <p className="text-3xl font-bold text-zinc-900 mb-1">{value}</p>
        {description && (
          <p className="text-xs text-zinc-500">{description}</p>
        )}
      </div>
    </div>
  );
};

const NotificationStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard 
        title="Total de Notificações"
        value={stats.total}
        description="Notificações criadas"
        icon={<BellRingIcon className="h-5 w-5 text-purple-600" />}
        bgColor="bg-purple-50"
      />
      
      <StatCard 
        title="Notificações Enviadas"
        value={stats.sent}
        description="Enviadas com sucesso"
        icon={<SendIcon className="h-5 w-5 text-blue-600" />}
        bgColor="bg-blue-50"
      />
      
      <StatCard 
        title="Notificações Agendadas"
        value={stats.scheduled}
        description="Programadas para envio"
        icon={<ClockIcon className="h-5 w-5 text-amber-600" />}
        bgColor="bg-amber-50"
      />
      
      <StatCard 
        title="Rascunhos"
        value={stats.draft}
        description="Em preparação"
        icon={<FileEditIcon className="h-5 w-5 text-zinc-600" />}
        bgColor="bg-zinc-100"
      />
      
      <StatCard 
        title="Notificações Lidas"
        value={stats.read}
        description={`${Math.round((stats.read / stats.sent) * 100)}% das enviadas`}
        icon={<EyeIcon className="h-5 w-5 text-green-600" />}
        bgColor="bg-green-50"
      />
      
      <StatCard 
        title="Cliques"
        value={stats.clicked}
        description={`${Math.round((stats.clicked / stats.read) * 100)}% das lidas`}
        icon={<MousePointerIcon className="h-5 w-5 text-indigo-600" />}
        bgColor="bg-indigo-50"
      />
      
      <StatCard 
        title="Taxa de Conversão"
        value={`${stats.conversionRate}%`}
        description="Conversões a partir de cliques"
        icon={<PercentIcon className="h-5 w-5 text-rose-600" />}
        bgColor="bg-rose-50"
      />
    </div>
  );
};

export default NotificationStats;
