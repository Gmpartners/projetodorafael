import { useState, useEffect, useCallback, useMemo } from 'react';
import MainLayout from '@/components/common/layout/MainLayout';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  MetricCard, 
  LoadingSkeleton
} from '@/components/ui/premium';
import { 
  FadeInUp, 
  GlassCard, 
  AnimatedNumber
} from '@/components/ui/animations';
import { 
  BarChart3, 
  Users, 
  ShoppingBag, 
  RefreshCcwIcon,
  Activity,
  EyeIcon,
  ClockIcon,
  MousePointer,
  Loader2,
  Calendar,
  UserPlus,
  UserCheck,
  TrendingUp,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';

// Função para processar pedidos do dia
const processTodayOrdersData = (orders) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayOrders = orders.filter(order => {
    if (!order.createdAt && !order.orderDate) return false;
    const orderDate = new Date(order.createdAt || order.orderDate);
    return orderDate >= today;
  });

  // Calcular distribuição horária
  const hourlyDistribution = Array.from({ length: 24 }, () => 0);
  let lastOrderTime = null;
  
  todayOrders.forEach(order => {
    const orderDate = new Date(order.createdAt || order.orderDate);
    const hour = orderDate.getHours();
    hourlyDistribution[hour]++;
    
    if (!lastOrderTime || orderDate > lastOrderTime) {
      lastOrderTime = orderDate;
    }
  });

  // Encontrar horário de pico
  const peakHour = hourlyDistribution.reduce((maxHour, current, index) => 
    current > hourlyDistribution[maxHour] ? index : maxHour, 0
  );

  return {
    count: todayOrders.length,
    lastOrderTime: lastOrderTime ? 
      `${lastOrderTime.getHours().toString().padStart(2, '0')}:${lastOrderTime.getMinutes().toString().padStart(2, '0')}` : 
      null,
    peakHour: `${peakHour.toString().padStart(2, '0')}:00`,
    hourlyDistribution
  };
};

// Função para analytics de customer
const generateCustomerAccessData = (orders, dashboardStats) => {
  const baseAccess = Math.max(orders.length * 3, dashboardStats.totalCustomers || 0);
  const uniqueVisitors = Math.floor(baseAccess * 0.6);
  const pageViews = Math.floor(baseAccess * 1.8);
  
  // Distribuição horária baseada nos pedidos
  const orderHourly = Array.from({ length: 24 }, () => 0);
  orders.forEach(order => {
    if (order.createdAt || order.orderDate) {
      const hour = new Date(order.createdAt || order.orderDate).getHours();
      orderHourly[hour]++;
    }
  });
  
  const accessHourly = orderHourly.map(orderCount => 
    Math.floor(orderCount * (2 + Math.random() * 3))
  );

  return {
    todayAccess: baseAccess,
    uniqueVisitors,
    pageViews,
    mostAccessedPages: [
      { page: "/customer/lookup", visits: Math.floor(uniqueVisitors * 0.8) },
      { page: "/customer/orders", visits: Math.floor(uniqueVisitors * 0.6) },
      { page: "/customer/dashboard", visits: Math.floor(uniqueVisitors * 0.4) }
    ],
    hourlyDistribution: accessHourly,
    bounceRate: 35
  };
};

// 🆕 Função para processar dados de usuários por período
const processUserDataByPeriod = (orders, startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999); // Final do dia
  
  // Filtrar pedidos do período
  const periodOrders = orders.filter(order => {
    if (!order.createdAt && !order.orderDate) return false;
    const orderDate = new Date(order.createdAt || order.orderDate);
    return orderDate >= start && orderDate <= end;
  });

  // Extrair usuários únicos (por email)
  const uniqueUsers = new Map();
  const userActivity = new Map();
  
  periodOrders.forEach(order => {
    const userEmail = order.customerEmail || `cliente_${order.orderId}`;
    const orderDate = new Date(order.createdAt || order.orderDate);
    
    if (!uniqueUsers.has(userEmail)) {
      uniqueUsers.set(userEmail, {
        email: userEmail,
        name: order.customerName || 'Cliente',
        firstOrder: orderDate,
        totalOrders: 0,
        totalValue: 0
      });
    }
    
    const user = uniqueUsers.get(userEmail);
    user.totalOrders++;
    user.totalValue += parseFloat(order.price || order.total || 0);
    
    // Atualizar primeira compra se for mais antiga
    if (orderDate < user.firstOrder) {
      user.firstOrder = orderDate;
    }
    
    // Atividade diária
    const dayKey = orderDate.toDateString();
    if (!userActivity.has(dayKey)) {
      userActivity.set(dayKey, new Set());
    }
    userActivity.get(dayKey).add(userEmail);
  });

  // Calcular estatísticas
  const users = Array.from(uniqueUsers.values());
  const newUsers = users.filter(user => 
    user.firstOrder >= start && user.firstOrder <= end
  );
  
  const returningUsers = users.filter(user => user.totalOrders > 1);
  const avgOrdersPerUser = users.length > 0 ? 
    periodOrders.length / users.length : 0;
  
  // Usuários mais ativos
  const topUsers = users
    .sort((a, b) => b.totalOrders - a.totalOrders)
    .slice(0, 5);

  // Atividade diária
  const dailyActivity = Array.from(userActivity.entries())
    .map(([date, userSet]) => ({
      date,
      activeUsers: userSet.size
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return {
    totalUsers: users.length,
    newUsers: newUsers.length,
    returningUsers: returningUsers.length,
    avgOrdersPerUser: Math.round(avgOrdersPerUser * 10) / 10,
    topUsers,
    dailyActivity,
    periodOrders: periodOrders.length
  };
};

// Mini gráfico simples
const MiniBarChart = ({ data, title, color = 'blue', height = 60 }) => {
  const maxValue = Math.max(...data, 1);
  const currentHour = new Date().getHours();
  
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-zinc-700">{title}</h4>
      <div className="flex items-end space-x-1" style={{ height: `${height}px` }}>
        {data.map((value, index) => {
          const heightPercent = maxValue > 0 ? Math.max((value / maxValue) * 100, 2) : 2;
          const isCurrentHour = index === currentHour;
          
          return (
            <div
              key={index}
              className={`flex-1 rounded-t transition-all duration-300 group ${
                isCurrentHour 
                  ? `bg-${color}-500 shadow-md` 
                  : `bg-${color}-300`
              }`}
              style={{ height: `${heightPercent}%` }}
              title={`${index}h: ${value}`}
            />
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-zinc-500">
        <span>00h</span>
        <span>Agora: {currentHour}h</span>
        <span>23h</span>
      </div>
    </div>
  );
};

// 🆕 Gráfico de atividade diária de usuários
const DailyActivityChart = ({ data, color = 'purple', height = 60 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-4 text-zinc-500">
        <span className="text-sm">Nenhum dado para exibir</span>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.activeUsers), 1);
  
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-zinc-700">Usuários Ativos por Dia</h4>
      <div className="flex items-end space-x-1" style={{ height: `${height}px` }}>
        {data.map((item, index) => {
          const heightPercent = maxValue > 0 ? Math.max((item.activeUsers / maxValue) * 100, 2) : 2;
          
          return (
            <div
              key={index}
              className={`flex-1 rounded-t transition-all duration-300 bg-${color}-400 hover:bg-${color}-500`}
              style={{ height: `${heightPercent}%` }}
              title={`${new Date(item.date).toLocaleDateString('pt-BR')}: ${item.activeUsers} usuários`}
            />
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-zinc-500">
        <span>{data[0] ? new Date(data[0].date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : ''}</span>
        <span>{data[data.length - 1] ? new Date(data[data.length - 1].date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : ''}</span>
      </div>
    </div>
  );
};

// Card de páginas
const TopPagesCard = ({ pages = [], loading = false }) => {
  if (loading) {
    return <LoadingSkeleton rows={3} />;
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-zinc-700">Páginas Mais Acessadas</h4>
      {pages.slice(0, 3).map((page, index) => (
        <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <span className="text-sm text-zinc-700">{page.page}</span>
          <Badge variant="secondary">{page.visits}</Badge>
        </div>
      ))}
    </div>
  );
};

// 🆕 Card de usuários mais ativos
const TopUsersCard = ({ users = [], loading = false }) => {
  if (loading) {
    return <LoadingSkeleton rows={3} />;
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-6 text-zinc-500">
        <Users className="h-8 w-8 mx-auto mb-2 text-zinc-300" />
        <span className="text-sm">Nenhum usuário no período</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-zinc-700">Usuários Mais Ativos</h4>
      {users.slice(0, 5).map((user, index) => (
        <div key={index} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
          <div>
            <span className="text-sm font-medium text-zinc-700">{user.name}</span>
            <p className="text-xs text-zinc-500">{user.email}</p>
          </div>
          <div className="text-right">
            <Badge variant="secondary">{user.totalOrders} pedidos</Badge>
            <p className="text-xs text-zinc-500 mt-1">R$ {user.totalValue.toFixed(2)}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

const StoreDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    totalCustomers: 0
  });
  const [orders, setOrders] = useState([]);
  
  // 🆕 Estados para filtro de data
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7); // Últimos 7 dias por padrão
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Processar dados
  const todayOrdersData = useMemo(() => {
    return processTodayOrdersData(orders);
  }, [orders]);

  const customerAccessData = useMemo(() => {
    return generateCustomerAccessData(orders, dashboardStats);
  }, [orders, dashboardStats]);

  // 🆕 Processar dados de usuários por período
  const userDataByPeriod = useMemo(() => {
    return processUserDataByPeriod(orders, startDate, endDate);
  }, [orders, startDate, endDate]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      const dashboardData = await apiService.getDashboardOverview();
      setDashboardStats(dashboardData);
      
      const ordersData = await apiService.getStoreOrders('E47OkrK3IcNu1Ys8gD4CA29RrHk2');
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshData = useCallback(async () => {
    await fetchDashboardData();
    toast.success('Dados atualizados!');
  }, []);

  // 🆕 Função para aplicar filtros rápidos
  const applyQuickFilter = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  return (
    <MainLayout userType="store" pageTitle="Dashboard">
      <div className="space-y-8 pb-8">
        
        {/* Header Simples */}
        <FadeInUp delay={0}>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 shadow-lg">
                <BarChart3 className="h-6 w-6 text-purple-700" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
                <p className="text-sm text-zinc-600">Pedidos do dia e analytics customer</p>
              </div>
            </div>
            
            {/* 🎯 BOTÃO ATUALIZAR TAMANHO MÉDIO - EQUILIBRADO */}
            <Button 
              onClick={handleRefreshData}
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200 h-11 px-6 font-medium"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <RefreshCcwIcon className="h-5 w-5 mr-2" />
              )}
              Atualizar
            </Button>
          </div>
        </FadeInUp>

        {/* Cards Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* 📊 Pedidos do Dia */}
          <FadeInUp delay={100}>
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-emerald-100">
                    <ShoppingBag className="h-5 w-5 text-emerald-700" />
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-900">Pedidos do Dia</h3>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700">Hoje</Badge>
              </div>
              
              {isLoading ? (
                <LoadingSkeleton rows={2} />
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-emerald-700 mb-2">
                      <AnimatedNumber value={todayOrdersData.count} />
                    </div>
                    <p className="text-sm text-zinc-600">pedidos recebidos</p>
                  </div>
                  
                  {todayOrdersData.lastOrderTime && (
                    <div className="flex justify-between text-sm text-zinc-500 pt-4 border-t">
                      <span>Último pedido: {todayOrdersData.lastOrderTime}</span>
                      <span>Pico: {todayOrdersData.peakHour}</span>
                    </div>
                  )}
                  
                  <div className="mt-4">
                    <MiniBarChart
                      data={todayOrdersData.hourlyDistribution}
                      title="Pedidos por hora"
                      color="emerald"
                      height={50}
                    />
                  </div>
                </div>
              )}
            </GlassCard>
          </FadeInUp>

          {/* 👥 Analytics Customer */}
          <FadeInUp delay={200}>
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Users className="h-5 w-5 text-blue-700" />
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-900">Analytics Customer</h3>
                </div>
                <Badge className="bg-blue-100 text-blue-700">Estimado</Badge>
              </div>
              
              {isLoading ? (
                <LoadingSkeleton rows={2} />
              ) : (
                <div className="space-y-4">
                  {/* Métricas principais */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-700">
                        <AnimatedNumber value={customerAccessData.todayAccess} />
                      </div>
                      <p className="text-xs text-blue-600">Acessos</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-700">
                        <AnimatedNumber value={customerAccessData.uniqueVisitors} />
                      </div>
                      <p className="text-xs text-purple-600">Visitantes</p>
                    </div>
                  </div>
                  
                  {/* Estatísticas extras */}
                  <div className="flex justify-between text-sm text-zinc-500 pt-2 border-t">
                    <span>Taxa rejeição: {customerAccessData.bounceRate}%</span>
                    <span>{Math.round(customerAccessData.pageViews / customerAccessData.uniqueVisitors)} pág/visita</span>
                  </div>
                  
                  <div className="mt-4">
                    <MiniBarChart
                      data={customerAccessData.hourlyDistribution}
                      title="Acessos por hora"
                      color="blue"
                      height={50}
                    />
                  </div>
                </div>
              )}
            </GlassCard>
          </FadeInUp>
        </div>

        {/* Páginas Mais Acessadas */}
        <FadeInUp delay={300}>
          <GlassCard className="p-6">
            <TopPagesCard 
              pages={customerAccessData.mostAccessedPages} 
              loading={isLoading}
            />
          </GlassCard>
        </FadeInUp>

        {/* 🆕 NOVO: Dashboard de Usuários com Filtro de Data */}
        <div className="border-t pt-8">
          
          {/* Header do Analytics de Usuários */}
          <FadeInUp delay={400}>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-200 shadow-lg">
                  <Filter className="h-6 w-6 text-indigo-700" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-zinc-900">Analytics de Usuários</h2>
                  <p className="text-sm text-zinc-600">Análise detalhada por período</p>
                </div>
              </div>
              
              {/* Filtros de Data */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Filtros Rápidos */}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => applyQuickFilter(7)}
                    className="text-xs"
                  >
                    7 dias
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => applyQuickFilter(30)}
                    className="text-xs"
                  >
                    30 dias
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => applyQuickFilter(90)}
                    className="text-xs"
                  >
                    90 dias
                  </Button>
                </div>
                
                {/* Seletores de Data */}
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-36 h-9"
                  />
                  <span className="text-zinc-500">até</span>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-36 h-9"
                  />
                </div>
              </div>
            </div>
          </FadeInUp>

          {/* Cards de Métricas de Usuários */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            
            <FadeInUp delay={500}>
              <GlassCard className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="p-2 rounded-lg bg-indigo-100">
                    <Users className="h-5 w-5 text-indigo-700" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-indigo-700 mb-1">
                  <AnimatedNumber value={userDataByPeriod.totalUsers} />
                </div>
                <p className="text-xs text-zinc-600">Total de Usuários</p>
              </GlassCard>
            </FadeInUp>

            <FadeInUp delay={550}>
              <GlassCard className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="p-2 rounded-lg bg-green-100">
                    <UserPlus className="h-5 w-5 text-green-700" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-green-700 mb-1">
                  <AnimatedNumber value={userDataByPeriod.newUsers} />
                </div>
                <p className="text-xs text-zinc-600">Novos Usuários</p>
              </GlassCard>
            </FadeInUp>

            <FadeInUp delay={600}>
              <GlassCard className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="p-2 rounded-lg bg-orange-100">
                    <UserCheck className="h-5 w-5 text-orange-700" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-orange-700 mb-1">
                  <AnimatedNumber value={userDataByPeriod.returningUsers} />
                </div>
                <p className="text-xs text-zinc-600">Usuários Recorrentes</p>
              </GlassCard>
            </FadeInUp>

            <FadeInUp delay={650}>
              <GlassCard className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <TrendingUp className="h-5 w-5 text-purple-700" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-purple-700 mb-1">
                  <AnimatedNumber value={userDataByPeriod.avgOrdersPerUser} decimals={1} />
                </div>
                <p className="text-xs text-zinc-600">Pedidos/Usuário</p>
              </GlassCard>
            </FadeInUp>
          </div>

          {/* Gráficos e Tabelas de Usuários */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Atividade Diária */}
            <FadeInUp delay={700}>
              <GlassCard className="p-6">
                <DailyActivityChart 
                  data={userDataByPeriod.dailyActivity}
                  color="purple"
                  height={60}
                />
              </GlassCard>
            </FadeInUp>

            {/* Usuários Mais Ativos */}
            <FadeInUp delay={750}>
              <GlassCard className="p-6">
                <TopUsersCard 
                  users={userDataByPeriod.topUsers}
                  loading={isLoading}
                />
              </GlassCard>
            </FadeInUp>
          </div>

          {/* Resumo do Período */}
          <FadeInUp delay={800}>
            <GlassCard className="p-6 mt-6">
              <div className="text-center">
                <h4 className="text-lg font-semibold text-zinc-900 mb-4">Resumo do Período</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-2xl font-bold text-zinc-700">
                      <AnimatedNumber value={userDataByPeriod.periodOrders} />
                    </div>
                    <p className="text-sm text-zinc-600">Pedidos no período</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-zinc-700">
                      {userDataByPeriod.totalUsers > 0 ? 
                        Math.round((userDataByPeriod.newUsers / userDataByPeriod.totalUsers) * 100) : 0}%
                    </div>
                    <p className="text-sm text-zinc-600">Taxa de novos usuários</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-zinc-700">
                      {userDataByPeriod.totalUsers > 0 ? 
                        Math.round((userDataByPeriod.returningUsers / userDataByPeriod.totalUsers) * 100) : 0}%
                    </div>
                    <p className="text-sm text-zinc-600">Taxa de retenção</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </FadeInUp>
        </div>

      </div>
    </MainLayout>
  );
};

export default StoreDashboard;