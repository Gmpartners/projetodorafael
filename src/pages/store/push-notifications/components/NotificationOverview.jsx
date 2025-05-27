import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  UsersIcon, 
  CheckCircleIcon, 
  ZapIcon,
  PlusIcon,
  Settings,
  TargetIcon,
  SmartphoneIcon,
  RefreshCcwIcon,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NotificationOverview = ({ stats, onRefresh, setActiveTab }) => {
  const quickActions = [
    {
      id: 'device_config',
      title: 'Configurar Dispositivo',
      description: 'Ativar notificações neste navegador',
      icon: SmartphoneIcon,
      color: 'blue',
      bgColor: 'from-blue-50 to-blue-100',
      borderColor: 'border-blue-200',
      hoverColor: 'hover:border-blue-400 hover:bg-blue-50',
      textColor: 'text-blue-600',
      badge: stats.validTokens,
      badgeColor: 'bg-blue-500',
      onClick: () => setActiveTab('config')
    },
    {
      id: 'create_new',
      title: 'Criar Nova',
      description: 'Nova notificação push',
      icon: PlusIcon,
      color: 'purple',
      bgColor: 'from-purple-50 to-purple-100',
      borderColor: 'border-purple-200',
      hoverColor: 'hover:border-purple-400 hover:bg-purple-50',
      textColor: 'text-purple-600',
      badge: 0,
      badgeColor: 'bg-purple-500',
      onClick: () => setActiveTab('create')
    },
    {
      id: 'campaigns',
      title: 'Campanhas',
      description: 'Gerenciar campanhas ativas',
      icon: TargetIcon,
      color: 'emerald',
      bgColor: 'from-emerald-50 to-emerald-100',
      borderColor: 'border-emerald-200',
      hoverColor: 'hover:border-emerald-400 hover:bg-emerald-50',
      textColor: 'text-emerald-600',
      badge: stats.scheduled,
      badgeColor: 'bg-emerald-500',
      onClick: () => setActiveTab('campaigns')
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl border border-emerald-200/50">
        <div className="flex items-center space-x-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-700">{stats.total}</div>
            <div className="text-xs text-emerald-600">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-700">{stats.sent}</div>
            <div className="text-xs text-blue-600">Enviadas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-700">{stats.scheduled}</div>
            <div className="text-xs text-amber-600">Agendadas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-700">{stats.subscribers}</div>
            <div className="text-xs text-purple-600">Inscritos</div>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onRefresh}
          className="border-emerald-300 hover:bg-emerald-50"
        >
          <RefreshCcwIcon className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-zinc-50/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl shadow-md bg-gradient-to-br from-purple-100 to-purple-200">
                    <UsersIcon className="h-5 w-5 text-purple-700" />
                  </div>
                  <h3 className="font-semibold text-zinc-800">Subscriptions Ativas</h3>
                </div>
                
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-zinc-900">
                    {stats.validTokens}
                  </div>
                  <div className="flex items-center space-x-1 text-xs">
                    <span className="text-zinc-500">Web Push subscriptions</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-zinc-50/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl shadow-md bg-gradient-to-br from-emerald-100 to-emerald-200">
                    <CheckCircleIcon className="h-5 w-5 text-emerald-700" />
                  </div>
                  <h3 className="font-semibold text-zinc-800">Taxa de Sucesso</h3>
                </div>
                
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-zinc-900">
                    {stats.sent > 0 ? Math.round((stats.sent / (stats.sent + stats.draft)) * 100) : 0}%
                  </div>
                  <div className="flex items-center space-x-1 text-xs">
                    <span className="text-zinc-500">Notificações entregues</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-200 shadow-md">
                <ZapIcon className="h-5 w-5 text-emerald-700" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900">Ações Rápidas</h3>
                <p className="text-sm text-zinc-600">Configure e gerencie notificações Web Push</p>
              </div>
            </div>
            <Badge className="bg-emerald-100 text-emerald-700">
              Sistema Nativo
            </Badge>
          </div>
          
          <div className="space-y-3">
            {quickActions.map((action) => {
              const IconComponent = action.icon;
              
              return (
                <button 
                  key={action.id}
                  onClick={action.onClick}
                  className={cn(
                    "w-full p-4 rounded-xl border-2 transition-all duration-300 group",
                    "bg-gradient-to-r", action.bgColor,
                    action.borderColor, action.hoverColor,
                    "hover:shadow-md hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-300"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        "p-2.5 rounded-lg shadow-sm group-hover:scale-110 transition-transform",
                        "bg-white/50 backdrop-blur-sm"
                      )}>
                        <div className="relative">
                          <IconComponent className={cn("h-5 w-5", action.textColor)} />
                          {action.badge > 0 && (
                            <div className={cn(
                              "absolute -top-1 -right-1 w-3 h-3 rounded-full text-white text-xs font-bold flex items-center justify-center",
                              action.badgeColor
                            )}>
                              <div className="w-full h-full rounded-full animate-ping opacity-75 bg-current" />
                              <span className="absolute text-[10px]">
                                {action.badge > 9 ? '9+' : action.badge}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-left">
                        <h4 className={cn("font-semibold text-sm", action.textColor)}>
                          {action.title}
                        </h4>
                        <p className="text-xs text-zinc-600 group-hover:text-zinc-700">
                          {action.description}
                        </p>
                      </div>
                    </div>
                    
                    {action.badge > 0 && (
                      <Badge 
                        className={cn(
                          "text-white text-xs px-2 py-1",
                          action.badgeColor
                        )}
                      >
                        {action.badge}
                      </Badge>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationOverview;