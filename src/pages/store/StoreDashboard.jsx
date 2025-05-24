import { useState, useEffect, useCallback, useMemo } from 'react';
import MainLayout from '@/components/common/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  DollarSign,
  ArrowUpIcon,
  ArrowDownIcon,
  MessageSquareIcon,
  PackageIcon,
  SearchIcon,
  SettingsIcon,
  FilterIcon,
  MoreVerticalIcon,
  EyeIcon,
  SendIcon,
  StarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertTriangleIcon,
  TruckIcon,
  MapPinIcon,
  RefreshCcwIcon,
  Activity,
  Target,
  TrendingDownIcon,
  FileTextIcon,
  BellIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

const StoreDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para dados em tempo real
  const [dashboardStats, setDashboardStats] = useState({
    revenue: 12450.90,
    avgOrder: 150.90,
    totalCustomers: 48,
    conversionRate: 5.25,
    todayOrders: 23,
    completionRate: 87.5,
    pendingOrders: 8,
    newMessages: 5
  });
  
  // Simular carregamento inicial
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearInterval(timer);
  }, []);

  // Quick refresh handler
  const handleRefreshData = useCallback(async () => {
    setIsLoading(true);
    // Simular fetch de dados
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setDashboardStats(prev => ({
      ...prev,
      revenue: prev.revenue + Math.random() * 1000,
      todayOrders: prev.todayOrders + Math.floor(Math.random() * 3),
      newMessages: Math.floor(Math.random() * 10)
    }));
    
    setIsLoading(false);
  }, []);

  // Métricas principais - expandidas
  const mainStats = useMemo(() => [
    { 
      title: 'Receita Total', 
      value: dashboardStats.revenue, 
      change: 20.1, 
      changeLabel: 'vs mês anterior',
      icon: DollarSign, 
      color: 'purple',
      trend: 85,
      prefix: 'R$ ',
      format: 'currency'
    },
    { 
      title: 'Média por Pedido', 
      value: dashboardStats.avgOrder, 
      change: 12.5, 
      changeLabel: 'vs mês anterior',
      icon: ShoppingBag, 
      color: 'blue',
      trend: 72,
      prefix: 'R$ ',
      format: 'currency'
    },
    { 
      title: 'Total Clientes', 
      value: dashboardStats.totalCustomers, 
      change: 5.1, 
      changeLabel: 'novos este mês',
      icon: Users, 
      color: 'emerald',
      trend: 68,
      format: 'number'
    },
    { 
      title: 'Taxa Conversão', 
      value: dashboardStats.conversionRate, 
      change: -2.3, 
      changeLabel: 'vs mês anterior',
      icon: TrendingUp, 
      color: 'amber',
      trend: 45,
      suffix: '%',
      format: 'percentage'
    }
  ], [dashboardStats]);

  // Métricas secundárias
  const secondaryStats = useMemo(() => [
    {
      title: 'Pedidos Hoje',
      value: dashboardStats.todayOrders,
      icon: Activity,
      color: 'blue',
      change: 18.7,
      changeLabel: 'vs ontem',
      trend: 'up'
    },
    {
      title: 'Taxa de Conclusão',
      value: dashboardStats.completionRate,
      suffix: '%',
      icon: Target,
      color: 'emerald',
      change: 3.2,
      changeLabel: 'vs semana anterior',
      trend: 'up'
    }
  ], [dashboardStats]);

  // Dados das ações rápidas organizadas
  const quickActions = useMemo(() => [
    {
      id: 'orders',
      title: 'Ver Pedidos',
      description: 'Gerenciar todos os pedidos',
      icon: PackageIcon,
      color: 'purple',
      bgColor: 'from-purple-50 to-purple-100',
      borderColor: 'border-purple-200',
      hoverColor: 'hover:border-purple-400 hover:bg-purple-50',
      textColor: 'text-purple-600',
      badge: dashboardStats.pendingOrders,
      badgeColor: 'bg-red-500',
      onClick: () => setActiveTab('orders')
    },
    {
      id: 'chat',
      title: 'Chat',
      description: 'Mensagens dos clientes',
      icon: MessageSquareIcon,
      color: 'blue',
      bgColor: 'from-blue-50 to-blue-100',
      borderColor: 'border-blue-200',
      hoverColor: 'hover:border-blue-400 hover:bg-blue-50',
      textColor: 'text-blue-600',
      badge: dashboardStats.newMessages,
      badgeColor: 'bg-blue-500',
      onClick: () => window.location.href = '/store/chats'
    },
    {
      id: 'settings',
      title: 'Configurações',
      description: 'Ajustes da loja',
      icon: SettingsIcon,
      color: 'emerald',
      bgColor: 'from-emerald-50 to-emerald-100',
      borderColor: 'border-emerald-200',
      hoverColor: 'hover:border-emerald-400 hover:bg-emerald-50',
      textColor: 'text-emerald-600',
      badge: 0,
      badgeColor: 'bg-emerald-500',
      onClick: () => console.log('Configurações')
    },
    {
      id: 'reports',
      title: 'Relatórios',
      description: 'Análises e métricas',
      icon: FileTextIcon,
      color: 'amber',
      bgColor: 'from-amber-50 to-amber-100',
      borderColor: 'border-amber-200',
      hoverColor: 'hover:border-amber-400 hover:bg-amber-50',
      textColor: 'text-amber-600',
      badge: 0,
      badgeColor: 'bg-amber-500',
      onClick: () => console.log('Relatórios')
    }
  ], [dashboardStats.pendingOrders, dashboardStats.newMessages]);
  
  const recentOrders = [
    { 
      id: 'ORD-1234', 
      customer: 'Ana Silva', 
      email: 'ana.silva@email.com',
      date: '16/05/2025', 
      total: 129.90, 
      status: 'processando',
      avatar: 'https://i.pravatar.cc/150?u=ana',
      priority: 'high',
      items: 3
    },
    { 
      id: 'ORD-1235', 
      customer: 'Carlos Santos', 
      email: 'carlos.santos@email.com',
      date: '15/05/2025', 
      total: 79.90, 
      status: 'enviado',
      avatar: 'https://i.pravatar.cc/150?u=carlos',
      priority: 'medium',
      items: 1
    },
    { 
      id: 'ORD-1236', 
      customer: 'Maria Oliveira', 
      email: 'maria.oliveira@email.com',
      date: '14/05/2025', 
      total: 249.50, 
      status: 'entregue',
      avatar: 'https://i.pravatar.cc/150?u=maria',
      priority: 'low',
      items: 5
    },
    { 
      id: 'ORD-1237', 
      customer: 'João Costa', 
      email: 'joao.costa@email.com',
      date: '13/05/2025', 
      total: 59.90, 
      status: 'cancelado',
      avatar: 'https://i.pravatar.cc/150?u=joao',
      priority: 'low',
      items: 2
    },
  ];
  
  const pendingMessages = [
    { 
      id: 1, 
      orderId: 'ORD-1234', 
      customer: 'Ana Silva', 
      message: 'Olá, gostaria de saber quando meu pedido será enviado?', 
      time: '2h atrás',
      avatar: 'https://i.pravatar.cc/150?u=ana',
      priority: 'high',
      unread: true
    },
    { 
      id: 2, 
      orderId: 'ORD-1235', 
      customer: 'Carlos Santos', 
      message: 'Posso alterar o endereço de entrega?', 
      time: '3h atrás',
      avatar: 'https://i.pravatar.cc/150?u=carlos',
      priority: 'medium',
      unread: true
    },
    { 
      id: 3, 
      orderId: 'ORD-1236', 
      customer: 'Maria Oliveira', 
      message: 'O produto chegou com um pequeno defeito.', 
      time: '5h atrás',
      avatar: 'https://i.pravatar.cc/150?u=maria',
      priority: 'urgent',
      unread: false
    },
  ];
  
  const getStatusBadge = (status) => {
    const statusConfig = {
      processando: { 
        label: 'Processando', 
        className: 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300',
        icon: ClockIcon 
      },
      enviado: { 
        label: 'Enviado', 
        className: 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300',
        icon: TruckIcon 
      },
      entregue: { 
        label: 'Entregue', 
        className: 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 border-emerald-300',
        icon: CheckCircleIcon 
      },
      cancelado: { 
        label: 'Cancelado', 
        className: 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300',
        icon: XCircleIcon 
      }
    };
    
    const config = statusConfig[status] || statusConfig.processando;
    const IconComponent = config.icon;
    
    return (
      <Badge className={cn("inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold border shadow-sm", config.className)}>
        <IconComponent className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      urgent: { label: 'Urgente', className: 'bg-red-100 text-red-700 border-red-200' },
      high: { label: 'Alta', className: 'bg-orange-100 text-orange-700 border-orange-200' },
      medium: { label: 'Média', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
      low: { label: 'Baixa', className: 'bg-green-100 text-green-700 border-green-200' }
    };
    
    const config = priorityConfig[priority] || priorityConfig.medium;
    
    return (
      <Badge variant="outline" className={cn("text-xs", config.className)}>
        {config.label}
      </Badge>
    );
  };

  const tableColumns = [
    {
      header: 'Cliente',
      key: 'customer',
      render: (value, row) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10 border-2 border-white shadow-md">
            <AvatarImage src={row.avatar} className="object-cover" />
            <AvatarFallback className="bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700 font-semibold">
              {row.customer.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-zinc-900">{value}</p>
            <p className="text-sm text-zinc-500">{row.email}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Pedido',
      key: 'id',
      render: (value, row) => (
        <div>
          <p className="font-semibold text-zinc-900">{value}</p>
          <p className="text-sm text-zinc-500">{row.items} {row.items === 1 ? 'item' : 'itens'}</p>
        </div>
      )
    },
    {
      header: 'Data',
      key: 'date',
      render: (value) => (
        <span className="text-sm text-zinc-600">{value}</span>
      )
    },
    {
      header: 'Total',
      key: 'total',
      render: (value) => (
        <span className="font-semibold text-zinc-900">
          R$ {value.toFixed(2).replace('.', ',')}
        </span>
      )
    },
    {
      header: 'Status',
      key: 'status',
      render: (value) => getStatusBadge(value)
    },
    {
      header: 'Prioridade',
      key: 'priority',
      render: (value) => getPriorityBadge(value)
    },
    {
      header: 'Ações',
      key: 'actions',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-purple-50">
            <EyeIcon className="h-4 w-4 text-zinc-600" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-50">
            <MessageSquareIcon className="h-4 w-4 text-zinc-600" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-zinc-50">
            <MoreVerticalIcon className="h-4 w-4 text-zinc-600" />
          </Button>
        </div>
      )
    }
  ];

  const filteredOrders = recentOrders.filter(order => 
    order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout userType="store" pageTitle="Dashboard">
      <div className="space-y-6 pb-8">
        <FloatingParticles className="fixed inset-0 z-0" count={8} />
        
        {/* Header Simplificado */}
        <FadeInUp delay={0}>
          <div className="relative">
            <GlassCard variant="gradient" className="p-4 border-0 overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-blue-600/5 to-indigo-600/5" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-400/10 to-transparent rounded-full transform translate-x-16 -translate-y-8" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-400/10 to-transparent rounded-full transform -translate-x-12 translate-y-12" />
              
              <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 shadow-lg">
                        <BarChart3 className="h-6 w-6 text-purple-700" />
                      </div>
                      {(dashboardStats.pendingOrders > 5 || dashboardStats.newMessages > 3) && (
                        <div className="absolute -top-2 -right-2">
                          <PulseEffect color="red">
                            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                              <span className="text-xs text-white font-bold">!</span>
                            </div>
                          </PulseEffect>
                        </div>
                      )}
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 bg-clip-text text-transparent">
                        Dashboard Executivo
                      </h1>
                      <p className="text-sm text-zinc-600 font-medium">
                        Visão completa do seu negócio em tempo real
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {/* Search */}
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                      placeholder="Pesquisar pedidos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-10 w-56 border-zinc-200 focus:border-purple-300 focus:ring-purple-200 bg-white/80 backdrop-blur-sm"
                    />
                  </div>
                  
                  {/* Actions */}
                  <Button 
                    className="btn-premium h-10 px-4"
                    onClick={handleRefreshData}
                    disabled={isLoading}
                  >
                    <RefreshCcwIcon className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                    Atualizar
                  </Button>
                </div>
              </div>
            </GlassCard>
          </div>
        </FadeInUp>

        {/* Sistema de Tabs - Apenas 2 tabs */}
        <FadeInUp delay={200}>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/50 shadow-xl p-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full max-w-lg mx-auto bg-gradient-to-r from-zinc-100/80 to-zinc-200/80 backdrop-blur-sm p-1.5 rounded-xl shadow-inner border border-white/50">
                <TabsTrigger 
                  value="overview" 
                  className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:scale-105 transition-all duration-300 rounded-lg font-semibold"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Visão Geral
                </TabsTrigger>
                <TabsTrigger 
                  value="orders"
                  className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:scale-105 transition-all duration-300 rounded-lg font-semibold relative"
                >
                  <PackageIcon className="h-4 w-4 mr-2" />
                  Pedidos
                  {dashboardStats.pendingOrders > 0 && (
                    <Badge className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 animate-pulse">
                      {dashboardStats.pendingOrders}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
              
              {/* Tab: Visão Geral */}
              <TabsContent value="overview" className="mt-6 space-y-6">
                {/* Quick Stats Bar */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl border border-emerald-200/50">
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-emerald-700">{dashboardStats.todayOrders}</div>
                      <div className="text-xs text-emerald-600">Pedidos Hoje</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-700">{dashboardStats.pendingOrders}</div>
                      <div className="text-xs text-blue-600">Pendentes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-amber-700">{dashboardStats.newMessages}</div>
                      <div className="text-xs text-amber-600">Mensagens</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-700">{dashboardStats.completionRate}%</div>
                      <div className="text-xs text-purple-600">Conclusão</div>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleRefreshData}
                    disabled={isLoading}
                    className="border-emerald-300 hover:bg-emerald-50"
                  >
                    <RefreshCcwIcon className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                    Atualizar
                  </Button>
                </div>

                {/* Métricas Principais */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {mainStats.map((stat, i) => (
                    <FadeInUp key={i} delay={i * 100}>
                      <MetricCard
                        {...stat}
                        value={
                          <AnimatedNumber 
                            value={stat.value} 
                            prefix={stat.prefix}
                            suffix={stat.suffix}
                            className="text-2xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-700 bg-clip-text text-transparent"
                          />
                        }
                        loading={isLoading}
                        className="hover-lift"
                      />
                    </FadeInUp>
                  ))}
                </div>

                {/* Métricas Secundárias - Apenas 2 cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {secondaryStats.map((stat, i) => (
                    <FadeInUp key={i} delay={400 + i * 100}>
                      <MetricCard
                        {...stat}
                        value={
                          <AnimatedNumber 
                            value={stat.value} 
                            suffix={stat.suffix}
                            className="text-xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-700 bg-clip-text text-transparent"
                          />
                        }
                        loading={isLoading}
                        className="hover-lift"
                      />
                    </FadeInUp>
                  ))}
                </div>
                
                {/* Main Content Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                  {/* Ações Rápidas - Layout Melhorado */}
                  <FadeInUp delay={600}>
                    <GlassCard className="p-6 border-0 shadow-premium">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-200 shadow-md">
                            <AlertTriangleIcon className="h-5 w-5 text-emerald-700" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-zinc-900">Ações Rápidas</h3>
                            <p className="text-sm text-zinc-600">Funcionalidades mais utilizadas</p>
                          </div>
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-700">
                          {quickActions.length} disponíveis
                        </Badge>
                      </div>
                      
                      {/* Grid das Ações Melhorado */}
                      <div className="space-y-3">
                        {quickActions.map((action, index) => {
                          const IconComponent = action.icon;
                          
                          return (
                            <HoverLift key={action.id}>
                              <button 
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
                                        "text-white text-xs px-2 py-1 animate-pulse",
                                        action.badgeColor
                                      )}
                                    >
                                      {action.badge}
                                    </Badge>
                                  )}
                                </div>
                              </button>
                            </HoverLift>
                          );
                        })}
                      </div>
                    </GlassCard>
                  </FadeInUp>
                  
                  {/* Messages Preview */}
                  <FadeInUp delay={800} className="xl:col-span-2">
                    <GlassCard className="p-6 border-0 shadow-premium">
                      <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 shadow-md">
                            <MessageSquareIcon className="h-5 w-5 text-purple-700" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-zinc-900">Mensagens Recentes</h3>
                            <p className="text-sm text-zinc-600">Últimas interações com clientes</p>
                          </div>
                        </div>
                        <PulseEffect color="purple">
                          <Badge className="bg-purple-600 text-white shadow-md">{dashboardStats.newMessages}</Badge>
                        </PulseEffect>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {isLoading ? (
                          <LoadingSkeleton rows={3} showAvatar />
                        ) : (
                          pendingMessages.map(message => (
                            <HoverLift key={message.id}>
                              <div className="p-4 border border-zinc-200 rounded-xl hover:border-purple-300 transition-all bg-gradient-to-r from-white to-purple-50/30 group">
                                <div className="flex items-start space-x-3">
                                  <div className="relative">
                                    <Avatar className="h-8 w-8 border-2 border-white shadow-md">
                                      <AvatarImage src={message.avatar} className="object-cover" />
                                      <AvatarFallback className="bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700 font-semibold text-xs">
                                        {message.customer.split(' ').map(n => n[0]).join('')}
                                      </AvatarFallback>
                                    </Avatar>
                                    {message.unread && (
                                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-600 rounded-full border border-white shadow-sm">
                                        <div className="w-full h-full bg-purple-500 rounded-full animate-ping opacity-75" />
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                      <p className="font-semibold text-zinc-900 truncate text-sm">{message.customer}</p>
                                      <span className="text-xs text-zinc-500">{message.time}</span>
                                    </div>
                                    <p className="text-xs text-purple-600 font-medium mb-1">Pedido {message.orderId}</p>
                                    <p className="text-xs text-zinc-600 line-clamp-2">{message.message}</p>
                                    
                                    <div className="mt-2">
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="text-purple-600 border-purple-200 hover:bg-purple-50 w-full group-hover:shadow-md transition-all h-7 text-xs"
                                      >
                                        <SendIcon className="h-3 w-3 mr-1" />
                                        Responder
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </HoverLift>
                          ))
                        )}
                      </div>
                      
                      <div className="mt-6 pt-4 border-t border-zinc-100">
                        <a href="/store/chats">
                          <Button variant="ghost" className="w-full hover:bg-purple-50 text-purple-600">
                            Ver Todas as Mensagens
                            <ArrowUpIcon className="h-4 w-4 ml-2 rotate-45" />
                          </Button>
                        </a>
                      </div>
                    </GlassCard>
                  </FadeInUp>
                </div>
              </TabsContent>
              
              {/* Tab: Pedidos - Alinhamento Correto */}
              <TabsContent value="orders" className="mt-6">
                <FadeInUp delay={0}>
                  <GlassCard className="border-0 shadow-premium">
                    <div className="p-6 border-b border-zinc-100/50 bg-gradient-to-r from-white via-purple-50/30 to-indigo-50/30">
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 shadow-md">
                            <ShoppingBag className="h-5 w-5 text-blue-700" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-zinc-900">Gerenciar Pedidos</h3>
                            <p className="text-sm text-zinc-600">Últimas transações e status detalhados</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-blue-100 text-blue-700">
                            {filteredOrders.length} pedidos
                          </Badge>
                          <Button variant="ghost" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50">
                            Ver Todos
                            <ArrowUpIcon className="h-4 w-4 ml-2 rotate-45" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Filters */}
                      <div className="flex flex-wrap gap-2">
                        <Button variant="default" size="sm" className="text-xs bg-blue-600 hover:bg-blue-700">
                          Todos
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs">
                          Processando ({dashboardStats.pendingOrders})
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs">
                          Enviados
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs">
                          Entregues
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      {isLoading ? (
                        <LoadingSkeleton rows={4} showAvatar showBadge />
                      ) : filteredOrders.length > 0 ? (
                        <div className="overflow-x-auto">
                          <ModernTable
                            columns={tableColumns}
                            data={filteredOrders}
                            onRowClick={(row) => console.log('Navigate to:', row.id)}
                          />
                        </div>
                      ) : (
                        <EmptyState
                          icon={ShoppingBag}
                          title="Nenhum pedido encontrado"
                          description="Não encontramos pedidos com os critérios de busca."
                          action={
                            <Button className="btn-premium">
                              <PackageIcon className="h-4 w-4 mr-2" />
                              Adicionar Pedido
                            </Button>
                          }
                        />
                      )}
                    </div>
                  </GlassCard>
                </FadeInUp>
              </TabsContent>
            </Tabs>
          </div>
        </FadeInUp>
      </div>
    </MainLayout>
  );
};

export default StoreDashboard;