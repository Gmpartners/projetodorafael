import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/common/layout/MainLayout';
import ChatList from '@/components/common/chat/ChatList';
import ChatInitiator from '@/components/store/chat/ChatInitiator';
import ChatWindow from '@/components/store/chat/ChatWindow';
import QuickResponsePanel from '@/components/store/chat/QuickResponsePanel';
import { 
  MetricCard, 
  TrendIndicator, 
  LoadingSkeleton, 
  EmptyState 
} from '@/components/ui/premium';
import { 
  FadeInUp, 
  HoverLift, 
  GlassCard, 
  AnimatedNumber,
  PulseEffect
} from '@/components/ui/animations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageSquareIcon, 
  Users, 
  BellOff, 
  CheckCircle2, 
  AlertCircle,
  TrendingUpIcon,
  ClockIcon,
  StarIcon,
  ZapIcon,
  ShieldCheckIcon,
  UsersIcon,
  SettingsIcon,
  BellIcon,
  MailIcon,
  VolumeXIcon,
  SmartphoneIcon,
  SearchIcon,
  FilterIcon,
  PlusIcon,
  UserPlusIcon,
  RefreshCcwIcon,
  MoreVerticalIcon,
  PhoneIcon,
  VideoIcon,
  DownloadIcon,
  ShareIcon,
  HeadphonesIcon,
  Activity,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ChatManagementPage = () => {
  const navigate = useNavigate();
  const [activeChat, setActiveChat] = useState(null);
  const [chatStats, setChatStats] = useState({
    total: 0,
    unread: 0,
    needAttention: 0,
    resolved: 0,
    avgResponseTime: 0,
    satisfaction: 0,
    todayMessages: 0,
    responseRate: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // Configurações de notificação otimizadas
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    soundEnabled: true,
    browserNotifications: true,
    autoReply: false,
    offlineMode: false,
    urgentOnly: false
  });

  // Real-time updates simulation
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      setChatStats(prev => ({
        ...prev,
        unread: Math.max(0, prev.unread + Math.floor(Math.random() * 3) - 1),
        todayMessages: prev.todayMessages + Math.floor(Math.random() * 2)
      }));
    }, 10000); // Update every 10 seconds
    
    return () => clearInterval(interval);
  }, [autoRefresh]);
  
  // Carregar estatísticas e dados iniciais - otimizado
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Simulação com dados mais realistas
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setChatStats({
        total: 24,
        unread: 8,
        needAttention: 5,
        resolved: 19,
        avgResponseTime: 12,
        satisfaction: 4.7,
        todayMessages: 156,
        responseRate: 92.5
      });
      
      setIsLoading(false);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // Selecionar um chat para visualização - otimizado
  const handleSelectChat = useCallback((chat) => {
    setActiveChat(chat);
    
    // Marcar como lido se necessário
    if (chat?.unreadCount > 0) {
      setChatStats(prev => ({
        ...prev,
        unread: Math.max(0, prev.unread - chat.unreadCount)
      }));
    }
  }, []);
  
  // Iniciar novo chat - otimizado
  const handleStartNewChat = useCallback((chatData) => {
    const newChat = {
      id: `chat-${Date.now()}`,
      name: chatData.customerName,
      orderId: chatData.orderId,
      orderStatus: 'processing',
      avatar: `https://i.pravatar.cc/150?u=${chatData.customerName}`,
      initials: chatData.customerName.split(' ').map(n => n[0]).join(''),
      isCustomer: true,
      isVerified: true,
      online: true,
      lastMessage: {
        text: chatData.initialMessage,
        timestamp: new Date(),
        senderId: 'store-1'
      },
      unreadCount: 0,
      hasAttention: false,
      priority: 'medium',
      hasAttachment: false,
      hasRating: false,
      isUrgent: false
    };
    
    setActiveChat(newChat);
    setActiveTab('chats');
    
    // Atualizar estatísticas
    setChatStats(prev => ({
      ...prev,
      total: prev.total + 1
    }));
  }, []);
  
  // Alternar configuração de notificação - otimizado
  const toggleNotificationSetting = useCallback((setting) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  }, []);

  // Estatísticas principais - memoizadas para performance
  const statsCards = useMemo(() => [
    {
      title: 'Total de Conversas',
      value: chatStats.total,
      icon: MessageSquareIcon,
      color: 'purple',
      change: 8.2,
      changeLabel: 'vs semana anterior',
      trend: 'up'
    },
    {
      title: 'Não Lidas',
      value: chatStats.unread,
      icon: BellOff,
      color: 'blue',
      change: -12.5,
      changeLabel: 'vs ontem',
      trend: 'down',
      urgent: chatStats.unread > 5
    },
    {
      title: 'Precisam Atenção',
      value: chatStats.needAttention,
      icon: AlertCircle,
      color: 'amber',
      change: 5.1,
      changeLabel: 'vs ontem',
      trend: 'up',
      urgent: chatStats.needAttention > 3
    },
    {
      title: 'Resolvidas Hoje',
      value: chatStats.resolved,
      icon: CheckCircle2,
      color: 'emerald',
      change: 15.3,
      changeLabel: 'vs ontem',
      trend: 'up'
    }
  ], [chatStats]);

  const performanceCards = useMemo(() => [
    {
      title: 'Tempo Resposta Médio',
      value: chatStats.avgResponseTime,
      suffix: ' min',
      icon: ClockIcon,
      color: 'blue',
      change: -8.5,
      changeLabel: 'vs semana anterior',
      trend: 'down'
    },
    {
      title: 'Satisfação Cliente',
      value: chatStats.satisfaction,
      suffix: '/5',
      icon: StarIcon,
      color: 'amber',
      change: 2.1,
      changeLabel: 'vs mês anterior',
      trend: 'up'
    },
    {
      title: 'Mensagens Hoje',
      value: chatStats.todayMessages,
      icon: Activity,
      color: 'purple',
      change: 18.7,
      changeLabel: 'vs ontem',
      trend: 'up'
    },
    {
      title: 'Taxa de Resposta',
      value: chatStats.responseRate,
      suffix: '%',
      icon: BarChart3,
      color: 'emerald',
      change: 3.2,
      changeLabel: 'vs semana anterior',
      trend: 'up'
    }
  ], [chatStats]);

  // Quick response handler
  const handleQuickResponse = useCallback((responseText) => {
    if (!activeChat) return;
    
    // Simular envio da resposta rápida
    console.log('Resposta rápida enviada:', responseText);
    
    // Atualizar estatísticas
    setChatStats(prev => ({
      ...prev,
      todayMessages: prev.todayMessages + 1
    }));
  }, [activeChat]);

  return (
    <MainLayout userType="store" pageTitle="Gerenciamento de Chats">
      <div className="space-y-6 pb-8">
        
        {/* Header Otimizado */}
        <FadeInUp delay={0}>
          <div className="relative">
            <GlassCard variant="gradient" className="p-4 border-0 overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-blue-600/5 to-indigo-600/5" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-400/10 to-transparent rounded-full transform translate-x-16 -translate-y-8" />
              
              <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 shadow-lg">
                        <MessageSquareIcon className="h-6 w-6 text-purple-700" />
                      </div>
                      {chatStats.unread > 0 && (
                        <div className="absolute -top-2 -right-2">
                          <PulseEffect color="red">
                            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                              <span className="text-xs text-white font-bold">{chatStats.unread}</span>
                            </div>
                          </PulseEffect>
                        </div>
                      )}
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 bg-clip-text text-transparent">
                        Central de Atendimento
                      </h1>
                      <p className="text-sm text-zinc-600 font-medium">
                        Gerencie todas as conversas em tempo real
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {/* Auto-refresh toggle */}
                  <div className="flex items-center space-x-2 px-3 py-2 bg-white/60 backdrop-blur-sm rounded-lg border border-white/50">
                    <RefreshCcwIcon className={cn(
                      "h-4 w-4 text-emerald-600 transition-all duration-300",
                      autoRefresh && "animate-spin"
                    )} />
                    <span className="text-sm font-medium text-zinc-700">
                      {autoRefresh ? 'Auto-sync' : 'Manual'}
                    </span>
                    <Switch 
                      checked={autoRefresh}
                      onCheckedChange={setAutoRefresh}
                      size="sm"
                    />
                  </div>
                  
                  {/* Search */}
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                      placeholder="Buscar conversas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-10 w-56 border-zinc-200 focus:border-purple-300 focus:ring-purple-200 bg-white/80 backdrop-blur-sm"
                    />
                  </div>
                  
                  {/* Actions */}
                  <Button 
                    className="btn-premium h-10 px-4"
                    onClick={() => setActiveTab('chats')}
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Nova Conversa
                  </Button>
                </div>
              </div>
            </GlassCard>
          </div>
        </FadeInUp>

        {/* Tabs Principal - Redesenhadas */}
        <FadeInUp delay={200}>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/50 shadow-xl p-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full max-w-2xl mx-auto bg-gradient-to-r from-zinc-100/80 to-zinc-200/80 backdrop-blur-sm p-1.5 rounded-xl shadow-inner border border-white/50">
                <TabsTrigger 
                  value="overview" 
                  className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:scale-105 transition-all duration-300 rounded-lg font-semibold"
                >
                  <TrendingUpIcon className="h-4 w-4 mr-2" />
                  Visão Geral
                </TabsTrigger>
                <TabsTrigger 
                  value="chats"
                  className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:scale-105 transition-all duration-300 rounded-lg font-semibold relative"
                >
                  <MessageSquareIcon className="h-4 w-4 mr-2" />
                  Conversas
                  {chatStats.unread > 0 && (
                    <Badge className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 animate-pulse">
                      {chatStats.unread}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="settings"
                  className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:scale-105 transition-all duration-300 rounded-lg font-semibold"
                >
                  <SettingsIcon className="h-4 w-4 mr-2" />
                  Configurações
                </TabsTrigger>
              </TabsList>
              
              {/* Tab: Visão Geral - Melhorada */}
              <TabsContent value="overview" className="mt-6 space-y-6">
                {/* Quick Stats Bar */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl border border-emerald-200/50">
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-emerald-700">{chatStats.total}</div>
                      <div className="text-xs text-emerald-600">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-700">{chatStats.unread}</div>
                      <div className="text-xs text-blue-600">Não Lidas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-amber-700">{chatStats.needAttention}</div>
                      <div className="text-xs text-amber-600">Urgentes</div>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={fetchData}
                    className="border-emerald-300 hover:bg-emerald-50"
                  >
                    <RefreshCcwIcon className="h-4 w-4 mr-2" />
                    Atualizar
                  </Button>
                </div>

                {/* Estatísticas Principais */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {statsCards.map((stat, i) => (
                    <FadeInUp key={i} delay={i * 100}>
                      <div className="relative">
                        {stat.urgent && (
                          <div className="absolute -top-2 -right-2 z-10">
                            <PulseEffect color="red">
                              <div className="w-4 h-4 bg-red-500 rounded-full" />
                            </PulseEffect>
                          </div>
                        )}
                        <MetricCard
                          {...stat}
                          value={
                            <AnimatedNumber 
                              value={stat.value} 
                              className="text-2xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-700 bg-clip-text text-transparent"
                            />
                          }
                          loading={isLoading}
                          className="hover-lift"
                        />
                      </div>
                    </FadeInUp>
                  ))}
                </div>

                {/* Performance Cards Expandidas */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  {performanceCards.map((stat, i) => (
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

                {/* Quick Actions Melhoradas */}
                <FadeInUp delay={800}>
                  <GlassCard className="p-6 border-0 shadow-premium">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-200 shadow-md">
                          <ZapIcon className="h-5 w-5 text-emerald-700" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-zinc-900">Ações Rápidas</h3>
                          <p className="text-sm text-zinc-600">Acesso rápido às funcionalidades principais</p>
                        </div>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-700">
                        4 disponíveis
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <HoverLift>
                        <Button 
                          variant="outline" 
                          className="h-20 flex-col space-y-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 hover:shadow-lg group transition-all duration-300"
                          onClick={() => setActiveTab('chats')}
                        >
                          <div className="relative">
                            <MessageSquareIcon className="h-6 w-6 text-purple-600 group-hover:scale-110 transition-transform" />
                            {chatStats.unread > 0 && (
                              <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                                {chatStats.unread}
                              </div>
                            )}
                          </div>
                          <span className="text-sm font-medium">Ver Conversas</span>
                        </Button>
                      </HoverLift>
                      
                      <HoverLift>
                        <Button 
                          variant="outline" 
                          className="h-20 flex-col space-y-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 hover:shadow-lg group transition-all duration-300"
                          onClick={() => {
                            setActiveTab('chats');
                            // Trigger new chat modal
                          }}
                        >
                          <UserPlusIcon className="h-6 w-6 text-blue-600 group-hover:scale-110 transition-transform" />
                          <span className="text-sm font-medium">Nova Conversa</span>
                        </Button>
                      </HoverLift>
                      
                      <HoverLift>
                        <Button 
                          variant="outline" 
                          className="h-20 flex-col space-y-2 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 hover:shadow-lg group transition-all duration-300"
                          onClick={() => setActiveTab('settings')}
                        >
                          <SettingsIcon className="h-6 w-6 text-emerald-600 group-hover:scale-110 transition-transform" />
                          <span className="text-sm font-medium">Configurações</span>
                        </Button>
                      </HoverLift>
                      
                      <HoverLift>
                        <Button 
                          variant="outline" 
                          className="h-20 flex-col space-y-2 border-amber-200 hover:border-amber-400 hover:bg-amber-50 hover:shadow-lg group transition-all duration-300"
                        >
                          <DownloadIcon className="h-6 w-6 text-amber-600 group-hover:scale-110 transition-transform" />
                          <span className="text-sm font-medium">Exportar Dados</span>
                        </Button>
                      </HoverLift>
                    </div>
                  </GlassCard>
                </FadeInUp>
              </TabsContent>
              
              {/* Tab: Conversas - Layout Otimizado */}
              <TabsContent value="chats" className="mt-6">
                <div className="h-[calc(100vh-280px)] min-h-[650px] max-h-[900px]">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
                    {/* Lista de Conversas - Coluna responsiva */}
                    <div className="lg:col-span-4 xl:col-span-3 h-full">
                      <FadeInUp delay={0} className="h-full">
                        <div className="h-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg">
                          {/* Header da lista */}
                          <div className="p-4 border-b border-zinc-100 bg-gradient-to-r from-purple-50 to-indigo-50">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-bold text-zinc-900">Conversas</h3>
                              <div className="flex items-center space-x-2">
                                <Badge className="bg-purple-100 text-purple-700 text-xs">
                                  {chatStats.total}
                                </Badge>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                  <MoreVerticalIcon className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            {/* Quick filters */}
                            <div className="flex space-x-2">
                              <Button 
                                variant={filterStatus === 'all' ? 'default' : 'outline'}
                                size="sm"
                                className="text-xs"
                                onClick={() => setFilterStatus('all')}
                              >
                                Todas
                              </Button>
                              <Button 
                                variant={filterStatus === 'unread' ? 'default' : 'outline'}
                                size="sm"
                                className="text-xs"
                                onClick={() => setFilterStatus('unread')}
                              >
                                Não Lidas {chatStats.unread > 0 && `(${chatStats.unread})`}
                              </Button>
                              <Button 
                                variant={filterStatus === 'urgent' ? 'default' : 'outline'}
                                size="sm"
                                className="text-xs"
                                onClick={() => setFilterStatus('urgent')}
                              >
                                Urgentes
                              </Button>
                            </div>
                          </div>
                          
                          <ChatList 
                            onSelectChat={handleSelectChat}
                            userType="store"
                            activeChat={activeChat}
                            onCreateChat={() => setActiveTab('chats')}
                            searchTerm={searchTerm}
                            filterStatus={filterStatus}
                          />
                        </div>
                      </FadeInUp>
                    </div>
                    
                    {/* Janela de Chat */}
                    <div className="lg:col-span-5 xl:col-span-6 h-full">
                      <FadeInUp delay={200} className="h-full">
                        <div className="h-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg">
                          <ChatWindow 
                            activeChat={activeChat}
                            onStartNewChat={handleStartNewChat}
                            onSelectResponse={handleQuickResponse}
                          />
                        </div>
                      </FadeInUp>
                    </div>
                    
                    {/* Painel de Respostas Rápidas */}
                    <div className="lg:col-span-3 xl:col-span-3 h-full">
                      <FadeInUp delay={400} className="h-full">
                        <div className="h-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg">
                          <div className="p-3 border-b border-zinc-100 bg-gradient-to-r from-emerald-50 to-teal-50">
                            <h3 className="font-bold text-zinc-900 text-sm">Painel de Suporte</h3>
                            <p className="text-xs text-zinc-600">Ferramentas rápidas</p>
                          </div>
                          
                          <div className="p-3 space-y-3">
                            {/* Quick actions */}
                            <div className="grid grid-cols-2 gap-2">
                              <Button variant="outline" size="sm" className="text-xs">
                                <PhoneIcon className="h-3 w-3 mr-1" />
                                Ligar
                              </Button>
                              <Button variant="outline" size="sm" className="text-xs">
                                <VideoIcon className="h-3 w-3 mr-1" />
                                Vídeo
                              </Button>
                            </div>
                            
                            {/* Customer info panel would go here */}
                            {activeChat && (
                              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                                <h4 className="font-semibold text-sm text-purple-900 mb-2">
                                  Informações do Cliente
                                </h4>
                                <div className="space-y-1 text-xs text-purple-700">
                                  <div>Nome: {activeChat.name}</div>
                                  <div>Pedido: {activeChat.orderId}</div>
                                  <div>Status: {activeChat.orderStatus}</div>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Quick responses panel */}
                          <div className="flex-1 overflow-hidden">
                            <QuickResponsePanel 
                              onSelectResponse={handleQuickResponse}
                              orderId={activeChat?.orderId}
                            />
                          </div>
                        </div>
                      </FadeInUp>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Tab: Configurações - Expandidas */}
              <TabsContent value="settings" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Configurações de Notificação Expandidas */}
                  <FadeInUp delay={0}>
                    <GlassCard className="p-6 border-0 shadow-premium">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 shadow-lg">
                          <BellIcon className="h-6 w-6 text-blue-700" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-zinc-900">Notificações</h3>
                          <p className="text-zinc-600">Configure como receber alertas</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        {/* Enhanced notification options */}
                        {[
                          {
                            key: 'emailNotifications',
                            icon: MailIcon,
                            title: 'Email',
                            description: 'Receba emails para novas mensagens',
                            color: 'purple'
                          },
                          {
                            key: 'soundEnabled',
                            icon: HeadphonesIcon,
                            title: 'Sons',
                            description: 'Reproduzir sons para alertas',
                            color: 'blue'
                          },
                          {
                            key: 'browserNotifications',
                            icon: SmartphoneIcon,
                            title: 'Push',
                            description: 'Notificações do navegador',
                            color: 'emerald'
                          },
                          {
                            key: 'urgentOnly',
                            icon: AlertCircle,
                            title: 'Apenas Urgentes',
                            description: 'Notificar apenas mensagens urgentes',
                            color: 'amber'
                          },
                          {
                            key: 'offlineMode',
                            icon: VolumeXIcon,
                            title: 'Modo Offline',
                            description: 'Pausar todas as notificações',
                            color: 'zinc'
                          }
                        ].map((setting) => (
                          <HoverLift key={setting.key}>
                            <div className={cn(
                              "flex items-center justify-between p-4 border-2 rounded-xl transition-all",
                              `border-${setting.color}-200 hover:border-${setting.color}-300`,
                              `bg-gradient-to-r from-white to-${setting.color}-50/30`
                            )}>
                              <div className="flex items-center space-x-3">
                                <div className={cn(
                                  "p-2 rounded-lg",
                                  `bg-${setting.color}-100`
                                )}>
                                  <setting.icon className={cn(
                                    "h-5 w-5",
                                    `text-${setting.color}-700`
                                  )} />
                                </div>
                                <div>
                                  <Label className="font-semibold text-zinc-900">{setting.title}</Label>
                                  <p className="text-sm text-zinc-600">{setting.description}</p>
                                </div>
                              </div>
                              <Switch 
                                checked={notificationSettings[setting.key]}
                                onCheckedChange={() => toggleNotificationSetting(setting.key)}
                                className={cn(
                                  `data-[state=checked]:bg-${setting.color}-600`
                                )}
                              />
                            </div>
                          </HoverLift>
                        ))}
                      </div>
                    </GlassCard>
                  </FadeInUp>
                  
                  {/* Configurações de Equipe Expandidas */}
                  <FadeInUp delay={200}>
                    <GlassCard className="p-6 border-0 shadow-premium">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 shadow-lg">
                            <UsersIcon className="h-6 w-6 text-emerald-700" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-zinc-900">Equipe</h3>
                            <p className="text-zinc-600">Gerencie membros da equipe</p>
                          </div>
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-700">
                          2 ativos
                        </Badge>
                      </div>
                      
                      <div className="space-y-4">
                        {/* Enhanced team member cards */}
                        <HoverLift>
                          <div className="flex items-center gap-4 p-4 border-2 border-purple-200 rounded-xl hover:border-purple-300 transition-all bg-gradient-to-r from-white to-purple-50/30">
                            <div className="relative">
                              <Avatar className="h-12 w-12 border-2 border-white shadow-lg">
                                <AvatarImage src="https://i.pravatar.cc/150?u=admin" />
                                <AvatarFallback className="bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700 font-bold">
                                  AD
                                </AvatarFallback>
                              </Avatar>
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <p className="font-semibold text-zinc-900">Administrador</p>
                                <ShieldCheckIcon className="h-4 w-4 text-emerald-600" />
                              </div>
                              <p className="text-sm text-zinc-600">admin@exemplo.com</p>
                              <p className="text-xs text-emerald-600">Online agora</p>
                            </div>
                            <div className="text-right">
                              <Badge className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300 mb-1">
                                Owner
                              </Badge>
                              <p className="text-xs text-zinc-500">12 conversas hoje</p>
                            </div>
                          </div>
                        </HoverLift>
                        
                        <HoverLift>
                          <div className="flex items-center gap-4 p-4 border-2 border-blue-200 rounded-xl hover:border-blue-300 transition-all bg-gradient-to-r from-white to-blue-50/30">
                            <div className="relative">
                              <Avatar className="h-12 w-12 border-2 border-white shadow-lg">
                                <AvatarImage src="https://i.pravatar.cc/150?u=agent1" />
                                <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 font-bold">
                                  AT
                                </AvatarFallback>
                              </Avatar>
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full border-2 border-white" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-zinc-900">Atendente 1</p>
                              <p className="text-sm text-zinc-600">atendente1@exemplo.com</p>
                              <p className="text-xs text-yellow-600">Ausente</p>
                            </div>
                            <div className="text-right">
                              <Badge className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300 mb-1">
                                Agent
                              </Badge>
                              <p className="text-xs text-zinc-500">8 conversas hoje</p>
                            </div>
                          </div>
                        </HoverLift>
                        
                        <Button 
                          variant="outline" 
                          className="w-full border-dashed border-2 border-zinc-300 hover:border-purple-400 hover:bg-purple-50 h-16 group"
                        >
                          <UserPlusIcon className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                          <span className="font-medium">Adicionar Membro da Equipe</span>
                        </Button>
                      </div>
                    </GlassCard>
                  </FadeInUp>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </FadeInUp>
      </div>
    </MainLayout>
  );
};

export default ChatManagementPage;