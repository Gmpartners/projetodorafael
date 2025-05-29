import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  PackageIcon, 
  MessageSquareIcon, 
  ClockIcon,
  TrendingUpIcon,
  UsersIcon,
  AlertTriangleIcon,
  ChevronRightIcon,
  PlayIcon 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const PendingActions = () => {
  const actions = [
    { 
      id: 1, 
      title: 'Ver Conversas', 
      description: 'Chat com clientes',
      count: 5, 
      priority: 'high',
      icon: <MessageSquareIcon className="h-5 w-5" />, 
      path: '/store/chats',
      gradient: 'from-purple-500 to-indigo-600',
      hoverGradient: 'from-purple-600 to-indigo-700',
      bgGradient: 'from-purple-50 to-indigo-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-700'
    },
    { 
      id: 2, 
      title: 'Nova Conversa', 
      description: 'Iniciar atendimento',
      action: true,
      icon: <PlayIcon className="h-5 w-5" />, 
      path: '/store/chats/new',
      gradient: 'from-blue-500 to-cyan-600',
      hoverGradient: 'from-blue-600 to-cyan-700',
      bgGradient: 'from-blue-50 to-cyan-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700'
    },
    { 
      id: 3, 
      title: 'Configurações', 
      description: 'Ajustar preferências',
      icon: <TrendingUpIcon className="h-5 w-5" />, 
      path: '/store/settings',
      gradient: 'from-emerald-500 to-teal-600',
      hoverGradient: 'from-emerald-600 to-teal-700',
      bgGradient: 'from-emerald-50 to-teal-50',
      borderColor: 'border-emerald-200',
      textColor: 'text-emerald-700'
    },
    { 
      id: 4, 
      title: 'Relatórios', 
      description: 'Análises e métricas',
      icon: <UsersIcon className="h-5 w-5" />, 
      path: '/store/reports',
      gradient: 'from-amber-500 to-orange-600',
      hoverGradient: 'from-amber-600 to-orange-700',
      bgGradient: 'from-amber-50 to-orange-50',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-700'
    }
  ];

  const getPriorityBadge = (count, priority) => {
    if (!count) return null;
    
    const variants = {
      high: 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg animate-pulse',
      medium: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md',
      low: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm'
    };
    
    return (
      <Badge className={cn("px-2 py-1 text-xs font-bold border-0", variants[priority] || variants.medium)}>
        {count}
      </Badge>
    );
  };

  const handleActionClick = (action) => {
    // Here you could implement navigation logic
    console.log(`Navigating to: ${action.path}`);
    // Example: window.location.href = action.path;
  };

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-purple-50/30 to-indigo-50/30 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-200 shadow-md">
            <AlertTriangleIcon className="h-5 w-5 text-purple-700" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold bg-gradient-to-r from-purple-900 to-indigo-900 bg-clip-text text-transparent">
              Ações Rápidas
            </CardTitle>
            <CardDescription className="text-sm text-zinc-600">
              Funcionalidades mais utilizadas
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => (
            <div
              key={action.id}
              onClick={() => handleActionClick(action)}
              className={cn(
                "group relative overflow-hidden rounded-xl border-2 cursor-pointer transition-all duration-300",
                "hover:scale-105 hover:shadow-xl hover:-translate-y-1",
                action.borderColor,
                `bg-gradient-to-br ${action.bgGradient}`
              )}
            >
              {/* Background Gradient Overlay on Hover */}
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300",
                action.gradient
              )} />
              
              {/* Content */}
              <div className="relative p-4">
                <div className="flex flex-col space-y-3">
                  {/* Icon and Badge Row */}
                  <div className="flex items-center justify-between">
                    <div className={cn(
                      "p-2.5 rounded-lg bg-gradient-to-r transition-all duration-300 group-hover:scale-110",
                      action.gradient,
                      "group-hover:shadow-lg"
                    )}>
                      <div className="text-white">
                        {action.icon}
                      </div>
                    </div>
                    {action.count && getPriorityBadge(action.count, action.priority)}
                  </div>
                  
                  {/* Text Content */}
                  <div className="space-y-1">
                    <h3 className={cn(
                      "font-bold text-sm transition-colors duration-300",
                      action.textColor,
                      "group-hover:text-zinc-900"
                    )}>
                      {action.title}
                    </h3>
                    <p className="text-xs text-zinc-600 group-hover:text-zinc-700 transition-colors duration-300">
                      {action.description}
                    </p>
                  </div>
                  
                  {/* Action Arrow */}
                  <div className="flex justify-end">
                    <div className={cn(
                      "p-1 rounded-full bg-white/20 transition-all duration-300",
                      "group-hover:bg-white/30 group-hover:translate-x-1"
                    )}>
                      <ChevronRightIcon className={cn(
                        "h-3 w-3 transition-colors duration-300",
                        action.textColor,
                        "group-hover:text-zinc-800"
                      )} />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Shimmer Effect */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:translate-x-full transition-transform duration-1000" />
            </div>
          ))}
        </div>
        
        {/* Quick Stats Row */}
        <div className="mt-4 pt-4 border-t border-purple-100/50">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-600">Funcionalidades mais utilizadas</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <span className="text-purple-600 font-medium">Sistema online</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PendingActions;