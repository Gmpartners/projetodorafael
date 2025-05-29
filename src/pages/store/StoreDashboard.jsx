import { useState, useEffect, useCallback, useMemo } from 'react';
import MainLayout from '@/components/common/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WebPushSubscription from '@/components/common/WebPushSubscription';
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
  BellIcon,
  Loader2,
  Package2Icon,
  Sparkles,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiService } from '@/services/apiService';
import webPushService from '@/services/webPushService';
import { toast } from 'sonner';

const StoreDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para notificações
  const [notificationStats, setNotificationStats] = useState({
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    lastNotificationSent: null,
    status: 'checking'
  });
  
  // Estados para dados reais da API
  const [dashboardStats, setDashboardStats] = useState({
    revenue: 0,
    avgOrder: 0,
    totalCustomers: 0,
    conversionRate: 0,
    todayOrders: 0,
    completionRate: 0,
    pendingOrders: 0,
    newMessages: 0
  });
  
  const [orders, setOrders] = useState([]);

  // Carregar dados ao montar componente
  useEffect(() => {
    fetchDashboardData();
    fetchNotificationStats();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Carregar dados do dashboard
      const dashboardData = await apiService.getDashboardOverview();
      setDashboardStats(dashboardData);
      
      // Carregar pedidos da loja
      const ordersData = await apiService.getStoreOrders('E47OkrK3IcNu1Ys8gD4CA29RrHk2');
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      // Manter valores zerados em caso de erro
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar estatísticas de notificações
  const fetchNotificationStats = async () => {
    try {
      const stats = await apiService.getWebPushStoreStats('E47OkrK3IcNu1Ys8gD4CA29RrHk2');
      setNotificationStats({
        totalSubscriptions: stats.totalSubscriptions || 0,
        activeSubscriptions: stats.activeSubscriptions || 0,
        lastNotificationSent: stats.lastNotificationSent,
        status: stats.totalSubscriptions > 0 ? 'active' : 'inactive'
      });
    } catch (error) {
      console.warn('Erro ao carregar stats de notificações:', error);
      setNotificationStats(prev => ({ ...prev, status: 'error' }));
    }
  };

  // Enviar notificação de teste rápida
  const handleQuickTestNotification = async () => {
    try {
      await webPushService.sendTestNotification(
        'https://projeto-rafael-53f73.web.app/store/dashboard',
        {
          title: '🧪 Teste do Dashboard',
          body: 'Sistema de notificações funcionando!'
        }
      );
      
      toast.success('🧪 Teste enviado!', {
        description: 'Verifique se recebeu a notificação'
      });
    } catch (error) {
      toast.error('❌ Erro no teste', {
        description: error.message
      });
    }
  };

  // Quick refresh handler
  const handleRefreshData = useCallback(async () => {
    await fetchDashboardData();
    await fetchNotificationStats();
  }, []);

  // Métricas principais - usando dados reais + Notificações
  const mainStats = useMemo(() => [
    { 
      title: 'Receita Total', 
      value: dashboardStats.revenue || 0, 
      change: dashboardStats.revenueChange || 0, 
      changeLabel: 'vs mês anterior',
      icon: DollarSign, 
      color: 'purple',
      trend: 85,
      prefix: 'R$ ',
      format: 'currency'
    },
    { 
      title: 'Média por Pedido', 
      value: dashboardStats.avgOrder || 0, 
      change: dashboardStats.avgOrderChange || 0, 
      changeLabel: 'vs mês anterior',
      icon: ShoppingBag, 
      color: 'blue',
      trend: 72,
      prefix: 'R$ ',
      format: 'currency'
    },
    { 
      title: 'Total Clientes', 
      value: dashboardStats.totalCustomers || 0, 
      change: dashboardStats.customersChange || 0, 
      changeLabel: 'novos este mês',
      icon: Users, 
      color: 'emerald',
      trend: 68,
      format: 'number'
    },
    { 
      title: 'Notificações', 
      value: notificationStats.activeSubscriptions || 0, 
      change: notificationStats.totalSubscriptions - notificationStats.activeSubscriptions || 0, 
      changeLabel: 'inscritos ativos',
      icon: Sparkles, 
      color: 'amber',
      trend: 45,
      format: 'number'
    }
  ], [dashboardStats, notificationStats]);

  // Métricas secundárias - usando dados reais
  const secondaryStats = useMemo(() => [
    {
      title: 'Pedidos Hoje',
      value: dashboardStats.todayOrders || 0,
      icon: Activity,
      color: 'blue',
      change: dashboardStats.todayOrdersChange || 0,
      changeLabel: 'vs ontem',
      trend: 'up'
    },
    {
      title: 'Taxa de Conclusão',
      value: dashboardStats.completionRate || 0,
      suffix: '%',
      icon: Target,
      color: 'emerald',
      change: dashboardStats.completionRateChange || 0,
      changeLabel: 'vs semana anterior',
      trend: 'up'
    }
  ], [dashboardStats]);

  // Dados das ações rápidas - COM Notificações
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
      badge: dashboardStats.pendingOrders || 0,
      badgeColor: 'bg-red-500',
      onClick: () => setActiveTab('orders')
    },
    {
      id: 'products',
      title: 'Produtos',
      description: 'Gerenciar catálogo',
      icon: Package2Icon,
      color: 'indigo',
      bgColor: 'from-indigo-50 to-indigo-100',
      borderColor: 'border-indigo-200',
      hoverColor: 'hover:border-indigo-400 hover:bg-indigo-50',
      textColor: 'text-indigo-600',
      badge: 0,
      badgeColor: 'bg-indigo-500',
      onClick: () => window.location.href = '/store/products'
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
      badge: dashboardStats.newMessages || 0,
      badgeColor: 'bg-blue-500',
      onClick: () => window.location.href = '/store/chats'
    },
    {
      id: 'notifications',
      title: 'Notificações',
      description: 'Sistema de notificações push',
      icon: Sparkles,
      color: 'emerald',
      bgColor: 'from-emerald-50 to-emerald-100',
      borderColor: 'border-emerald-200',
      hoverColor: 'hover:border-emerald-400 hover:bg-emerald-50',
      textColor: 'text-emerald-600',
      badge: notificationStats.activeSubscriptions || 0,
      badgeColor: 'bg-emerald-500',
      onClick: () => window.location.href = '/store/push-notifications'
    }
  ], [dashboardStats.pendingOrders, dashboardStats.newMessages, notificationStats.activeSubscriptions]);
  
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

  const tableColumns = [
    {
      header: 'Cliente',
      key: 'customerName',
      render: (value, row) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10 border-2 border-white shadow-md">
            <AvatarFallback className="bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700 font-semibold">
              {value ? value.split(' ').map(n => n[0]).join('').substring(0, 2) : 'CL'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-zinc-900">{value || 'Cliente'}</p>
            <p className="text-sm text-zinc-500">{row.customerEmail || 'email@exemplo.com'}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Pedido',
      key: 'orderId',
      render: (value, row) => (
        <div>
          <p className="font-semibold text-zinc-900">{value}</p>
          <p className="text-sm text-zinc-500">{row.productName || 'Produto'}</p>
        </div>
      )
    },
    {
      header: 'Data',
      key: 'orderDate',
      render: (value) => (
        <span className="text-sm text-zinc-600">
          {value ? new Date(value).toLocaleDateString('pt-BR') : 'Data não informada'}
        </span>
      )
    },
    {
      header: 'Total',
      key: 'price',
      render: (value) => (
        <span className="font-semibold text-zinc-900">
          R$ {(value || 0).toFixed(2).replace('.', ',')}
        </span>
      )
    },
    {
      header: 'Status',
      key: 'status',
      render: (value) => getStatusBadge(value || 'processando')
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

  const filteredOrders = orders.filter(order => 
    order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.orderId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout userType="store" pageTitle="Dashboard">
      <div className="space-y-6 pb-8">
        <FloatingParticles className="fixed inset-0 z-0" count={8} />
        
        {/* Header com badge de notificações */}
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
                      {(dashboardStats.pendingOrders > 0 || dashboardStats.newMessages > 0) && (
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
                      <div className="flex items-center space-x-2">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 bg-clip-text text-transparent">
                          Dashboard Executivo
                        </h1>
                        {notificationStats.status === 'active' && (
                          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-3 py-1 rounded-full flex items-center space-x-1 shadow-md">
                            <Sparkles className="h-3 w-3 text-white" />
                            <span className="text-xs text-white font-bold">🔔</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-zinc-600 font-medium">
                        Visão completa com notificações integradas
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
                  
                  {/* Teste rápido de notificação */}
                  {notificationStats.status === 'active' && (
                    <Button 
                      variant="outline"
                      onClick={handleQuickTestNotification}
                      className="h-10 px-3 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                    >
                      <Zap className="h-4 w-4 mr-1" />
                      Teste
                    </Button>
                  )}
                  
                  {/* Actions */}
                  <Button 
                    className="btn-premium h-10 px-4"
                    onClick={handleRefreshData}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCcwIcon className="h-4 w-4 mr-2" />
                    )}
                    Atualizar
                  </Button>
                </div>
              </div>
            </GlassCard>
          </div>
        </FadeInUp>

        {/* Subscription Card */}
        <FadeInUp delay={150}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <WebPushSubscription 
                userType="store" 
                showSettings={true}
                autoInit={true}
              />
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-emerald-900">Estatísticas</h4>
                <Sparkles className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-700">Inscritos Ativos:</span>
                  <span className="font-bold text-emerald-900">{notificationStats.activeSubscriptions}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-700">Total Inscritos:</span>
                  <span className="font-bold text-emerald-900">{notificationStats.totalSubscriptions}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-700">Status:</span>
                  <Badge className={`text-xs ${notificationStats.status === 'active' ? 'bg-emerald-500' : 'bg-gray-500'}`}>
                    {notificationStats.status === 'active' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </FadeInUp>

        {/* Sistema de Tabs */}
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
                {/* Quick Stats Bar com Notificações */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl border border-emerald-200/50">
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-emerald-700">{dashboardStats.todayOrders || 0}</div>
                      <div className="text-xs text-emerald-600">Pedidos Hoje</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-700">{dashboardStats.pendingOrders || 0}</div>
                      <div className="text-xs text-blue-600">Pendentes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-amber-700">{dashboardStats.newMessages || 0}</div>
                      <div className="text-xs text-amber-600">Mensagens</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-700 flex items-center">
                        {notificationStats.activeSubscriptions || 0}
                        <Sparkles className="h-4 w-4 ml-1" />
                      </div>
                      <div className="text-xs text-purple-600">Notificações</div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.location.href = '/store/push-notifications'}
                      className="border-purple-300 hover:bg-purple-50 text-purple-700"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Notificações
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleRefreshData}
                      disabled={isLoading}
                      className="border-emerald-300 hover:bg-emerald-50"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCcwIcon className="h-4 w-4 mr-2" />
                      )}
                      Atualizar
                    </Button>
                  </div>
                </div>

                {/* Métricas Principais com Notificações */}
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
                        className={cn(
                          "hover-lift",
                          stat.icon === Sparkles && "border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100"
                        )}
                      />
                    </FadeInUp>
                  ))}
                </div>

                {/* Métricas Secundárias */}
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
                  {/* Ações Rápidas com Notificações */}
                  <FadeInUp delay={600}>
                    <GlassCard className="p-6 border-0 shadow-premium">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-200 shadow-md">
                            <AlertTriangleIcon className="h-5 w-5 text-emerald-700" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-zinc-900">Ações Rápidas</h3>
                            <p className="text-sm text-zinc-600">Funcionalidades principais</p>
                          </div>
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-700">
                          {quickActions.length} disponíveis
                        </Badge>
                      </div>
                      
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
                                  "hover:shadow-md hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-300",
                                  action.id === 'notifications' && "ring-2 ring-emerald-300 ring-opacity-50"
                                )}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div className={cn(
                                      "p-2.5 rounded-lg shadow-sm group-hover:scale-110 transition-transform",
                                      "bg-white/50 backdrop-blur-sm",
                                      action.id === 'notifications' && "bg-emerald-200/50"
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
                                        {action.id === 'notifications' && (
                                          <Sparkles className="inline h-3 w-3 ml-1 text-emerald-500" />
                                        )}
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
                                        action.badgeColor,
                                        action.id === 'notifications' && "animate-pulse"
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
                          <Badge className="bg-purple-600 text-white shadow-md">{dashboardStats.newMessages || 0}</Badge>
                        </PulseEffect>
                      </div>
                      
                      <div className="text-center py-8">
                        <MessageSquareIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma mensagem ainda</h3>
                        <p className="text-gray-500 mb-4">As mensagens dos clientes aparecerão aqui</p>
                        <Button 
                          onClick={() => window.location.href = '/store/chats'}
                          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                        >
                          <MessageSquareIcon className="h-4 w-4 mr-2" />
                          Ir para Chat
                        </Button>
                      </div>
                    </GlassCard>
                  </FadeInUp>
                </div>
              </TabsContent>
              
              {/* Tab: Pedidos */}
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
                    </div>
                    
                    <div className="p-6">
                      {isLoading ? (
                        <LoadingSkeleton rows={4} showAvatar showBadge />
                      ) : filteredOrders.length > 0 ? (
                        <div className="overflow-x-auto">
                          <ModernTable
                            columns={tableColumns}
                            data={filteredOrders}
                            onRowClick={(row) => console.log('Navigate to:', row.orderId)}
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
                              Ver Produtos
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