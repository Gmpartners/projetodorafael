import React, { useState, useEffect } from 'react';
import { 
  fetchNotifications, 
  fetchNotificationStats,
  notificationTypes,
  customerSegments
} from '@/services/push-notifications/pushNotificationService';
import { 
  MetricCard, 
  TrendIndicator, 
  LoadingSkeleton, 
  EmptyState,
  ModernTable
} from '@/components/ui/premium';
import { 
  FadeInUp, 
  HoverLift, 
  GlassCard, 
  AnimatedNumber,
  PulseEffect,
  FloatingParticles
} from '@/components/ui/animations';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  BellIcon, 
  SendIcon, 
  PlusIcon, 
  SearchIcon,
  Settings,
  TrendingUpIcon,
  UserIcon,
  MailIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EditIcon,
  EyeIcon,
  TrashIcon,
  FilterIcon,
  DownloadIcon,
  BarChart3Icon,
  TargetIcon,
  ZapIcon,
  StarIcon,
  UsersIcon,
  MessageSquareIcon,
  ActivityIcon,
  CalendarIcon,
  TagIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MainLayout from '@/components/common/layout/MainLayout';
import { cn } from '@/lib/utils';

// Componente para status de notificação
const NotificationStatusBadge = ({ status }) => {
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

// Componente para tipo de notificação
const NotificationTypeBadge = ({ type }) => {
  const typeConfig = {
    order_update: { label: 'Pedido', className: 'bg-blue-100 text-blue-700 border-blue-200', icon: '📦' },
    promotion: { label: 'Promoção', className: 'bg-purple-100 text-purple-700 border-purple-200', icon: '🎁' },
    news: { label: 'Novidade', className: 'bg-green-100 text-green-700 border-green-200', icon: '📢' },
    feedback: { label: 'Avaliação', className: 'bg-amber-100 text-amber-700 border-amber-200', icon: '⭐' },
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

// Componente principal
const NotificationManagementPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Carregar notificações
  const loadNotifications = async (tabFilter = activeTab) => {
    setIsLoading(true);
    try {
      const filters = {};
      if (tabFilter === 'scheduled') filters.status = 'scheduled';
      else if (tabFilter === 'drafts') filters.status = 'draft';
      else if (tabFilter === 'sent') filters.status = 'sent';
      
      if (searchQuery) filters.search = searchQuery;
      
      const { notifications: notificationData } = await fetchNotifications(filters);
      setNotifications(notificationData);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Carregar estatísticas
  const loadStats = async () => {
    try {
      const statsData = await fetchNotificationStats();
      setStats(statsData);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };
  
  // Carregar dados iniciais
  useEffect(() => {
    loadNotifications();
    loadStats();
  }, []);
  
  // Recarregar ao trocar de aba
  useEffect(() => {
    loadNotifications(activeTab);
  }, [activeTab]);
  
  // Manipular pesquisa
  const handleSearch = (e) => {
    e.preventDefault();
    loadNotifications();
  };
  
  const statsCards = [
    {
      title: 'Total de Notificações',
      value: stats?.total || 0,
      icon: BellIcon,
      color: 'purple',
      change: 12.5,
      changeLabel: 'vs mês anterior'
    },
    {
      title: 'Enviadas',
      value: stats?.sent || 0,
      icon: SendIcon,
      color: 'blue',
      change: 8.3,
      changeLabel: 'vs semana anterior'
    },
    {
      title: 'Agendadas',
      value: stats?.scheduled || 0,
      icon: ClockIcon,
      color: 'amber',
      change: 15.2,
      changeLabel: 'para esta semana'
    },
    {
      title: 'Rascunhos',
      value: stats?.draft || 0,
      icon: EditIcon,
      color: 'emerald',
      change: -5.1,
      changeLabel: 'vs mês anterior'
    }
  ];

  const performanceCards = [
    {
      title: 'Taxa de Leitura',
      value: stats?.read || 0,
      suffix: '%',
      icon: EyeIcon,
      color: 'blue',
      change: 4.2,
      changeLabel: 'vs mês anterior',
      trend: 73
    },
    {
      title: 'Taxa de Clique',
      value: stats?.clicked || 0,
      suffix: '%',
      icon: TargetIcon,
      color: 'purple',
      change: 2.1,
      changeLabel: 'vs mês anterior',
      trend: 65
    },
    {
      title: 'Conversão',
      value: stats?.conversionRate || 0,
      suffix: '%',
      icon: TrendingUpIcon,
      color: 'emerald',
      change: 6.8,
      changeLabel: 'vs mês anterior',
      trend: 45
    }
  ];

  const tableColumns = [
    {
      header: 'Notificação',
      key: 'title',
      render: (value, row) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <NotificationTypeBadge type={row.type} />
            <p className="font-semibold text-zinc-900 line-clamp-1">{value}</p>
          </div>
          <p className="text-sm text-zinc-600 line-clamp-2">{row.body}</p>
        </div>
      )
    },
    {
      header: 'Destinatário',
      key: 'target',
      render: (value, row) => (
        <div className="flex items-center space-x-2">
          {row.targetCustomer ? (
            <>
              <Avatar className="h-8 w-8 border border-zinc-200">
                <AvatarFallback className="bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700 text-xs">
                  {row.targetCustomer.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm text-zinc-900">{row.targetCustomer.name}</p>
                <p className="text-xs text-zinc-500">{row.targetCustomer.email}</p>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-blue-100">
                <UsersIcon className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-sm text-zinc-700">{row.targetSegment || 'Todos'}</span>
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Status',
      key: 'status',
      render: (value) => <NotificationStatusBadge status={value} />
    },
    {
      header: 'Data',
      key: 'date',
      render: (value, row) => (
        <div className="text-sm">
          <p className="text-zinc-900">
            {row.sentAt 
              ? new Date(row.sentAt).toLocaleDateString('pt-BR')
              : row.scheduledFor 
                ? new Date(row.scheduledFor).toLocaleDateString('pt-BR')
                : 'Não definida'
            }
          </p>
          <p className="text-zinc-500 text-xs">
            {row.sentAt 
              ? new Date(row.sentAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
              : row.scheduledFor 
                ? new Date(row.scheduledFor).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                : ''
            }
          </p>
        </div>
      )
    },
    {
      header: 'Ações',
      key: 'actions',
      render: (value, row) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-50">
            <EyeIcon className="h-4 w-4 text-zinc-600" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-purple-50">
            <EditIcon className="h-4 w-4 text-zinc-600" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-red-50">
            <TrashIcon className="h-4 w-4 text-zinc-600" />
          </Button>
        </div>
      )
    }
  ];

  const filteredNotifications = notifications.filter(notification => 
    searchQuery === '' || 
    notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    notification.body.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout userType="store" pageTitle="Gerenciamento de Notificações">
      <div className="space-y-8 pb-8">
        <FloatingParticles className="fixed inset-0 z-0" count={8} />
        
        {/* Header Premium */}
        <FadeInUp delay={0}>
          <div className="relative">
            <GlassCard variant="gradient" className="p-8 border-0">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 shadow-xl">
                        <BellIcon className="h-8 w-8 text-purple-700" />
                      </div>
                      <PulseEffect color="purple" size="sm" className="absolute -top-1 -right-1" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 bg-clip-text text-transparent">
                        Central de Notificações
                      </h1>
                      <p className="text-zinc-600 font-medium">
                        Gerencie campanhas push e comunicação com clientes
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-400" />
                    <Input
                      placeholder="Buscar notificações..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 h-12 w-64 border-zinc-200 focus:border-purple-300 focus:ring-purple-200 bg-white/80 backdrop-blur-sm"
                    />
                  </div>
                  <Button className="btn-premium h-12 px-6">
                    <FilterIcon className="h-4 w-4 mr-2" />
                    Filtros
                  </Button>
                  <Button className="btn-premium h-12 px-6">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Nova Notificação
                  </Button>
                </div>
              </div>
            </GlassCard>
          </div>
        </FadeInUp>

        {/* Tabs Principal */}
        <FadeInUp delay={200}>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-xl p-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full max-w-2xl mx-auto bg-zinc-100/80 backdrop-blur-sm p-1 rounded-xl shadow-inner">
                <TabsTrigger 
                  value="overview" 
                  className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg"
                >
                  <BarChart3Icon className="h-4 w-4 mr-2" />
                  Visão Geral
                </TabsTrigger>
                <TabsTrigger 
                  value="all"
                  className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg"
                >
                  <BellIcon className="h-4 w-4 mr-2" />
                  Todas
                </TabsTrigger>
                <TabsTrigger 
                  value="campaigns"
                  className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg"
                >
                  <TargetIcon className="h-4 w-4 mr-2" />
                  Campanhas
                </TabsTrigger>
              </TabsList>
              
              {/* Tab: Visão Geral */}
              <TabsContent value="overview" className="mt-8 space-y-8">
                {/* Estatísticas Principais */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {statsCards.map((stat, i) => (
                    <FadeInUp key={i} delay={i * 100}>
                      <MetricCard
                        {...stat}
                        value={
                          <AnimatedNumber 
                            value={stat.value} 
                            className="text-3xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-700 bg-clip-text text-transparent"
                          />
                        }
                        loading={isLoading}
                        className="hover-lift"
                      />
                    </FadeInUp>
                  ))}
                </div>

                {/* Performance Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {performanceCards.map((stat, i) => (
                    <FadeInUp key={i} delay={400 + i * 100}>
                      <MetricCard
                        {...stat}
                        value={
                          <AnimatedNumber 
                            value={stat.value} 
                            suffix={stat.suffix}
                            className="text-3xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-700 bg-clip-text text-transparent"
                          />
                        }
                        loading={isLoading}
                        className="hover-lift"
                      />
                    </FadeInUp>
                  ))}
                </div>

                {/* Quick Actions */}
                <FadeInUp delay={700}>
                  <GlassCard className="p-6 border-0 shadow-premium">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 shadow-lg">
                        <ZapIcon className="h-6 w-6 text-emerald-700" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-zinc-900">Ações Rápidas</h3>
                        <p className="text-zinc-600">Funcionalidades mais utilizadas</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <HoverLift>
                        <Button 
                          variant="outline" 
                          className="h-20 flex-col space-y-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50 group"
                          onClick={() => setActiveTab('all')}
                        >
                          <BellIcon className="h-6 w-6 text-purple-600 group-hover:scale-110 transition-transform" />
                          <span className="text-sm font-medium">Ver Todas</span>
                        </Button>
                      </HoverLift>
                      
                      <HoverLift>
                        <Button 
                          variant="outline" 
                          className="h-20 flex-col space-y-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 group"
                        >
                          <PlusIcon className="h-6 w-6 text-blue-600 group-hover:scale-110 transition-transform" />
                          <span className="text-sm font-medium">Criar Nova</span>
                        </Button>
                      </HoverLift>
                      
                      <HoverLift>
                        <Button 
                          variant="outline" 
                          className="h-20 flex-col space-y-2 border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50 group"
                          onClick={() => setActiveTab('campaigns')}
                        >
                          <TargetIcon className="h-6 w-6 text-emerald-600 group-hover:scale-110 transition-transform" />
                          <span className="text-sm font-medium">Campanhas</span>
                        </Button>
                      </HoverLift>
                      
                      <HoverLift>
                        <Button 
                          variant="outline" 
                          className="h-20 flex-col space-y-2 border-amber-200 hover:border-amber-300 hover:bg-amber-50 group"
                        >
                          <DownloadIcon className="h-6 w-6 text-amber-600 group-hover:scale-110 transition-transform" />
                          <span className="text-sm font-medium">Relatórios</span>
                        </Button>
                      </HoverLift>
                    </div>
                  </GlassCard>
                </FadeInUp>
              </TabsContent>
              
              {/* Tab: Todas as Notificações */}
              <TabsContent value="all" className="mt-8">
                <FadeInUp delay={0}>
                  <GlassCard className="p-0 border-0 shadow-premium">
                    <div className="p-6 border-b border-zinc-100/50 bg-gradient-to-r from-white via-purple-50/30 to-indigo-50/30">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 shadow-md">
                            <BellIcon className="h-5 w-5 text-blue-700" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-zinc-900">Todas as Notificações</h3>
                            <p className="text-sm text-zinc-600">
                              {filteredNotifications.length} {filteredNotifications.length === 1 ? 'notificação encontrada' : 'notificações encontradas'}
                            </p>
                          </div>
                        </div>
                        <Button className="btn-premium">
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Nova Notificação
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      {isLoading ? (
                        <LoadingSkeleton rows={5} showAvatar showBadge />
                      ) : filteredNotifications.length > 0 ? (
                        <ModernTable
                          columns={tableColumns}
                          data={filteredNotifications}
                          onRowClick={(row) => setSelectedNotification(row)}
                        />
                      ) : (
                        <EmptyState
                          icon={BellIcon}
                          title="Nenhuma notificação encontrada"
                          description="Não encontramos notificações com os critérios de busca ou ainda não há notificações cadastradas."
                          action={
                            <Button className="btn-premium">
                              <PlusIcon className="h-4 w-4 mr-2" />
                              Criar Primeira Notificação
                            </Button>
                          }
                          variant="primary"
                        />
                      )}
                    </div>
                  </GlassCard>
                </FadeInUp>
              </TabsContent>
              
              {/* Tab: Campanhas */}
              <TabsContent value="campaigns" className="mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <FadeInUp delay={0}>
                      <GlassCard className="p-6 border-0 shadow-premium">
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 shadow-lg">
                            <TargetIcon className="h-6 w-6 text-purple-700" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-zinc-900">Campanhas Ativas</h3>
                            <p className="text-zinc-600">Gerencie suas campanhas de marketing</p>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          {/* Campanha de Exemplo */}
                          <HoverLift>
                            <div className="p-4 border border-zinc-200 rounded-xl hover:border-purple-300 transition-all bg-gradient-to-r from-white to-purple-50/30 group">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3">
                                  <div className="p-2 rounded-lg bg-purple-100 group-hover:bg-purple-200 transition-colors">
                                    <TagIcon className="h-5 w-5 text-purple-700" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-zinc-900">Promoção Black Friday</h4>
                                    <p className="text-sm text-zinc-600 mt-1">Desconto especial de até 70% para todos os clientes</p>
                                    <div className="flex items-center space-x-4 mt-3">
                                      <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                                        <UsersIcon className="h-3 w-3 mr-1" />
                                        2.5k enviadas
                                      </Badge>
                                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                                        <ActivityIcon className="h-3 w-3 mr-1" />
                                        18% taxa clique
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button variant="ghost" size="sm" className="hover:bg-purple-50">
                                    <EyeIcon className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="hover:bg-purple-50">
                                    <EditIcon className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </HoverLift>
                        </div>
                      </GlassCard>
                    </FadeInUp>
                  </div>
                  
                  <div className="space-y-6">
                    <FadeInUp delay={200}>
                      <GlassCard className="p-6 border-0 shadow-premium">
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="p-2 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 shadow-md">
                            <CalendarIcon className="h-5 w-5 text-amber-700" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-zinc-900">Próximas Campanhas</h3>
                            <p className="text-sm text-zinc-600">Agendadas para envio</p>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="p-3 border border-amber-200 rounded-lg bg-amber-50/50">
                            <p className="font-medium text-amber-900 text-sm">Lançamento Produtos</p>
                            <p className="text-xs text-amber-700 mt-1">Amanhã às 09:00</p>
                          </div>
                          
                          <div className="p-3 border border-blue-200 rounded-lg bg-blue-50/50">
                            <p className="font-medium text-blue-900 text-sm">Newsletter Semanal</p>
                            <p className="text-xs text-blue-700 mt-1">Sexta às 16:00</p>
                          </div>
                        </div>
                      </GlassCard>
                    </FadeInUp>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </FadeInUp>
      </div>
    </MainLayout>
  );
};

export default NotificationManagementPage;