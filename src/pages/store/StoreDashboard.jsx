import { useState, useEffect } from 'react';
import MainLayout from '@/components/common/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  MapPinIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

const StoreDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Simular carregamento
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);
  
  const stats = [
    { 
      title: 'Receita Total', 
      value: 12450.90, 
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
      value: 150.90, 
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
      value: 48, 
      change: 5.1, 
      changeLabel: 'novos este mês',
      icon: Users, 
      color: 'emerald',
      trend: 68,
      format: 'number'
    },
    { 
      title: 'Taxa Conversão', 
      value: 5.25, 
      change: -2.3, 
      changeLabel: 'vs mês anterior',
      icon: TrendingUp, 
      color: 'amber',
      trend: 45,
      suffix: '%',
      format: 'percentage'
    }
  ];
  
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
      <div className="space-y-8 pb-8">
        <FloatingParticles className="fixed inset-0 z-0" count={8} />
        
        {/* Header Premium */}
        <FadeInUp delay={0}>
          <div className="relative">
            <GlassCard variant="gradient" className="p-8 border-0">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 shadow-lg">
                      <BarChart3 className="h-8 w-8 text-purple-700" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 bg-clip-text text-transparent">
                        Dashboard Executivo
                      </h1>
                      <p className="text-zinc-600 font-medium">
                        Visão completa do seu negócio em tempo real
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-400" />
                    <Input
                      placeholder="Pesquisar pedidos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 h-12 w-64 border-zinc-200 focus:border-purple-300 focus:ring-purple-200 bg-white/80 backdrop-blur-sm"
                    />
                  </div>
                  <Button className="btn-premium h-12 px-6">
                    <FilterIcon className="h-4 w-4 mr-2" />
                    Filtros
                  </Button>
                </div>
              </div>
            </GlassCard>
          </div>
        </FadeInUp>

        {/* Stats Grid Premium */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <FadeInUp key={i} delay={i * 150}>
              <MetricCard
                {...stat}
                value={
                  <AnimatedNumber 
                    value={stat.value} 
                    prefix={stat.prefix}
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
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Orders Table */}
          <FadeInUp delay={600} className="xl:col-span-2">
            <GlassCard className="p-0 border-0 shadow-premium">
              <div className="p-6 border-b border-zinc-100/50 bg-gradient-to-r from-white via-purple-50/30 to-indigo-50/30">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 shadow-md">
                      <ShoppingBag className="h-5 w-5 text-blue-700" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-zinc-900">Pedidos Recentes</h3>
                      <p className="text-sm text-zinc-600">Últimas transações e status</p>
                    </div>
                  </div>
                  <Button variant="ghost" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50">
                    Ver Todos
                    <ArrowUpIcon className="h-4 w-4 ml-2 rotate-45" />
                  </Button>
                </div>
              </div>
              
              <div className="p-6">
                {isLoading ? (
                  <LoadingSkeleton rows={4} showAvatar showBadge />
                ) : filteredOrders.length > 0 ? (
                  <ModernTable
                    columns={tableColumns}
                    data={filteredOrders}
                    onRowClick={(row) => console.log('Navigate to:', row.id)}
                  />
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
          
          {/* Sidebar Premium */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <FadeInUp delay={800}>
              <GlassCard className="p-6 border-0 shadow-premium">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 shadow-md">
                    <AlertTriangleIcon className="h-5 w-5 text-emerald-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900">Ações Prioritárias</h3>
                    <p className="text-sm text-zinc-600">Itens que requerem atenção</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <HoverLift>
                    <a 
                      href="/store/orders/processing"
                      className="block p-4 border border-zinc-200 rounded-xl hover:border-blue-300 transition-all bg-gradient-to-r from-blue-50/50 to-white group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors">
                            <PackageIcon className="h-5 w-5 text-blue-700" />
                          </div>
                          <div>
                            <p className="font-semibold text-zinc-900">Pedidos p/ Envio</p>
                            <p className="text-sm text-zinc-600">Aguardando processamento</p>
                          </div>
                        </div>
                        <PulseEffect color="blue">
                          <Badge className="bg-blue-600 text-white shadow-md">3</Badge>
                        </PulseEffect>
                      </div>
                    </a>
                  </HoverLift>
                  
                  <HoverLift>
                    <a 
                      href="/store/chats"
                      className="block p-4 border border-zinc-200 rounded-xl hover:border-purple-300 transition-all bg-gradient-to-r from-purple-50/50 to-white group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-purple-100 group-hover:bg-purple-200 transition-colors">
                            <MessageSquareIcon className="h-5 w-5 text-purple-700" />
                          </div>
                          <div>
                            <p className="font-semibold text-zinc-900">Mensagens</p>
                            <p className="text-sm text-zinc-600">Aguardando resposta</p>
                          </div>
                        </div>
                        <PulseEffect color="purple">
                          <Badge className="bg-purple-600 text-white shadow-md">5</Badge>
                        </PulseEffect>
                      </div>
                    </a>
                  </HoverLift>
                </div>
              </GlassCard>
            </FadeInUp>
            
            {/* Messages Preview */}
            <FadeInUp delay={1000}>
              <GlassCard className="p-6 border-0 shadow-premium">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 shadow-md">
                      <MessageSquareIcon className="h-5 w-5 text-purple-700" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-zinc-900">Mensagens Recentes</h3>
                      <p className="text-sm text-zinc-600">Últimas interações</p>
                    </div>
                  </div>
                  <PulseEffect color="purple">
                    <Badge className="bg-purple-600 text-white shadow-md">3</Badge>
                  </PulseEffect>
                </div>
                
                <div className="space-y-4">
                  {isLoading ? (
                    <LoadingSkeleton rows={3} showAvatar />
                  ) : (
                    pendingMessages.map(message => (
                      <HoverLift key={message.id}>
                        <div className="p-4 border border-zinc-200 rounded-xl hover:border-purple-300 transition-all bg-gradient-to-r from-white to-purple-50/30 group">
                          <div className="flex items-start space-x-3">
                            <div className="relative">
                              <Avatar className="h-10 w-10 border-2 border-white shadow-md">
                                <AvatarImage src={message.avatar} className="object-cover" />
                                <AvatarFallback className="bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700 font-semibold">
                                  {message.customer.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              {message.unread && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-600 rounded-full border-2 border-white shadow-sm">
                                  <div className="w-full h-full bg-purple-500 rounded-full animate-ping opacity-75" />
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className="font-semibold text-zinc-900 truncate">{message.customer}</p>
                                <div className="flex items-center space-x-2">
                                  {getPriorityBadge(message.priority)}
                                  <span className="text-xs text-zinc-500">{message.time}</span>
                                </div>
                              </div>
                              <p className="text-xs text-purple-600 font-medium mb-2">Pedido {message.orderId}</p>
                              <p className="text-sm text-zinc-600 line-clamp-2">{message.message}</p>
                              
                              <div className="mt-3">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-purple-600 border-purple-200 hover:bg-purple-50 w-full group-hover:shadow-md transition-all"
                                >
                                  <SendIcon className="h-3 w-3 mr-2" />
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
                  <Button variant="ghost" className="w-full hover:bg-purple-50 text-purple-600">
                    Ver Todas as Mensagens
                    <ArrowUpIcon className="h-4 w-4 ml-2 rotate-45" />
                  </Button>
                </div>
              </GlassCard>
            </FadeInUp>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default StoreDashboard;