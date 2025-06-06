import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStoreChat } from '@/contexts/StoreChatContext';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/common/layout/MainLayout';
import ChatList from '@/components/common/chat/ChatList';
import ChatInitiator from '@/components/store/chat/ChatInitiator';
import ChatWindow from '@/components/store/chat/ChatWindow';
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
  DownloadIcon,
  HeadphonesIcon,
  Activity,
  BarChart3,
  FileTextIcon,
  HelpCircleIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ChatManagementPage = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { 
    chats,
    activeChat,
    stats,
    isLoading,
    error,
    sendMessage,
    setActiveChat,
    startNewChat,
    loadActiveChats,
    getChatStats
  } = useStoreChat();

  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Configurações de notificação otimizadas
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    soundEnabled: true,
    browserNotifications: true,
    autoReply: false,
    offlineMode: false
  });

  // Carregar estatísticas e dados iniciais - usando dados reais
  const fetchData = useCallback(async () => {
    try {
      await loadActiveChats();
      await getChatStats();
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  }, [loadActiveChats, getChatStats]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // Selecionar um chat para visualização - otimizado
  const handleSelectChat = useCallback((chat) => {
    setActiveChat(chat);
  }, [setActiveChat]);
  
  // Iniciar novo chat - usando função real
  const handleStartNewChat = useCallback(async (chatData) => {
    try {
      const newChat = await startNewChat(
        chatData.orderId, 
        chatData.customerId, 
        chatData.customerName
      );
      
      setActiveTab('chats');
      
    } catch (error) {
      console.error('Erro ao iniciar nova conversa:', error);
    }
  }, [startNewChat]);
  
  // Alternar configuração de notificação - otimizado
  const toggleNotificationSetting = useCallback((setting) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  }, []);

  // Performance cards - usando dados reais
  const performanceCards = useMemo(() => [
    {
      title: 'Mensagens Hoje',
      value: stats.total || 0,
      icon: Activity,
      color: 'purple',
      change: 0,
      changeLabel: 'vs ontem',
      trend: 'up'
    },
    {
      title: 'Taxa de Resposta',
      value: stats.total > 0 ? Math.round(((stats.total - stats.unread) / stats.total) * 100) : 100,
      suffix: '%',
      icon: BarChart3,
      color: 'emerald',
      change: 0,
      changeLabel: 'vs semana anterior',
      trend: 'up'
    }
  ], [stats]);

  // Dados das ações rápidas organizadas - usando dados reais (sem urgentes)
  const quickActions = useMemo(() => [
    {
      id: 'chats',
      title: 'Ver Conversas',
      description: 'Gerenciar todas as conversas',
      icon: MessageSquareIcon,
      color: 'purple',
      bgColor: 'from-purple-50 to-purple-100',
      borderColor: 'border-purple-200',
      hoverColor: 'hover:border-purple-400 hover:bg-purple-50',
      textColor: 'text-purple-600',
      badge: stats.unread || 0,
      badgeColor: 'bg-red-500',
      onClick: () => setActiveTab('chats')
    },
    {
      id: 'new_chat',
      title: 'Nova Conversa',
      description: 'Iniciar atendimento',
      icon: UserPlusIcon,
      color: 'blue',
      bgColor: 'from-blue-50 to-blue-100',
      borderColor: 'border-blue-200',
      hoverColor: 'hover:border-blue-400 hover:bg-blue-50',
      textColor: 'text-blue-600',
      badge: 0,
      badgeColor: 'bg-blue-500',
      onClick: () => {
        setActiveTab('chats');
      }
    },
    {
      id: 'settings',
      title: 'Configurações',
      description: 'Ajustes de notificação',
      icon: SettingsIcon,
      color: 'emerald',
      bgColor: 'from-emerald-50 to-emerald-100',
      borderColor: 'border-emerald-200',
      hoverColor: 'hover:border-emerald-400 hover:bg-emerald-50',
      textColor: 'text-emerald-600',
      badge: 0,
      badgeColor: 'bg-emerald-500',
      onClick: () => setActiveTab('settings')
    }
  ], [stats.unread]);

  // Quick response handler - usando função real
  const handleQuickResponse = useCallback(async (responseText) => {
    if (!activeChat) return;
    
    try {
      await sendMessage(responseText);
    } catch (error) {
      console.error('Erro ao enviar resposta rápida:', error);
    }
  }, [activeChat, sendMessage]);

  return (
    <MainLayout userType="store" pageTitle="Central de Atendimento">
      <div className="space-y-6 pb-8">
        
        {/* Header Otimizado - com dados reais */}
        <FadeInUp delay={0}>
          <div className="relative">
            <GlassCard variant="gradient" className="p-4 sm:p-6 border-0 overflow-hidden">
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
                      {stats.unread > 0 && (
                        <div className="absolute -top-2 -right-2">
                          <PulseEffect color="red">
                            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                              <span className="text-xs text-white font-bold">{stats.unread}</span>
                            </div>
                          </PulseEffect>
                        </div>
                      )}
                    </div>
                    <div>
                      <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 bg-clip-text text-transparent">
                        Central de Atendimento
                      </h1>
                      <p className="text-sm text-zinc-600 font-medium">
                        {stats.total} conversas • {stats.unread} não lidas • {stats.online} online
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full lg:w-auto">
                  {/* Search */}
                  <div className="relative w-full sm:w-auto">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                      placeholder="Buscar conversas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-10 w-full sm:w-56 border-zinc-200 focus:border-purple-300 focus:ring-purple-200 bg-white/80 backdrop-blur-sm"
                    />
                  </div>
                  
                  {/* Actions */}
                  <div className="flex space-x-2 w-full sm:w-auto">
                    <Button 
                      className="btn-premium h-10 px-4 flex-1 sm:flex-none"
                      onClick={() => setActiveTab('chats')}
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Nova Conversa
                    </Button>

                    <Button 
                      variant="outline"
                      onClick={fetchData}
                      disabled={isLoading}
                      className="h-10 px-4"
                    >
                      <RefreshCcwIcon className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                      <span className="hidden sm:inline">Atualizar</span>
                    </Button>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </FadeInUp>

        {/* Error Message */}
        {error && (
          <FadeInUp delay={100}>
            <div className="bg-red-50 text-red-800 p-4 rounded-lg border border-red-200">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={fetchData}
                  className="text-red-600 hover:text-red-800"
                >
                  Tentar novamente
                </Button>
              </div>
            </div>
          </FadeInUp>
        )}

        {/* Tabs Principal - CORRIGIDO */}
        <FadeInUp delay={200}>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/50 shadow-xl overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="p-4 sm:p-6 border-b border-gray-100">
                <TabsList className="w-full max-w-2xl mx-auto bg-gradient-to-r from-zinc-100/80 to-zinc-200/80 backdrop-blur-sm p-1 rounded-xl shadow-inner border border-white/50 grid grid-cols-3">
                  <TabsTrigger 
                    value="overview" 
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-300 rounded-lg font-semibold h-10 px-4 text-sm"
                  >
                    <TrendingUpIcon className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Visão Geral</span>
                    <span className="sm:hidden">Geral</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="chats"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-300 rounded-lg font-semibold relative h-10 px-4 text-sm"
                  >
                    <MessageSquareIcon className="h-4 w-4 mr-2" />
                    Conversas
                    {stats.unread > 0 && (
                      <Badge className="ml-1 sm:ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 animate-pulse">
                        {stats.unread}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="settings"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-300 rounded-lg font-semibold h-10 px-4 text-sm"
                  >
                    <SettingsIcon className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Configurações</span>
                    <span className="sm:hidden">Config</span>
                  </TabsTrigger>
                </TabsList>
              </div>
              
              {/* Tab Content */}
              <div className="p-4 sm:p-6">
                {/* Tab: Visão Geral - LAYOUT CORRIGIDO */}
                <TabsContent value="overview" className="space-y-6 mt-0">
                  {/* Performance Cards - GRID RESPONSIVO CORRIGIDO */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {performanceCards.map((stat, i) => (
                      <FadeInUp key={i} delay={400 + i * 100}>
                        <MetricCard
                          {...stat}
                          value={
                            <AnimatedNumber 
                              value={stat.value} 
                              suffix={stat.suffix}
                              className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-700 bg-clip-text text-transparent"
                            />
                          }
                          loading={isLoading}
                          className="hover-lift"
                        />
                      </FadeInUp>
                    ))}
                  </div>

                  {/* Quick Actions - LAYOUT CORRIGIDO */}
                  <FadeInUp delay={800}>
                    <GlassCard className="p-4 sm:p-6 border-0 shadow-premium">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-2 sm:space-y-0">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-200 shadow-md">
                            <ZapIcon className="h-5 w-5 text-emerald-700" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-zinc-900">Ações Rápidas</h3>
                            <p className="text-sm text-zinc-600">Acesso rápido às funcionalidades principais</p>
                          </div>
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-700 self-start sm:self-auto">
                          {quickActions.length} disponíveis
                        </Badge>
                      </div>
                      
                      {/* Grid das Ações - RESPONSIVO CORRIGIDO */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {quickActions.map((action, index) => {
                          const IconComponent = action.icon;
                          
                          return (
                            <HoverLift key={action.id}>
                              <button 
                                onClick={action.onClick}
                                className={cn(
                                  "w-full p-4 rounded-xl border-2 transition-all duration-300 group text-left",
                                  "bg-gradient-to-r", action.bgColor,
                                  action.borderColor, action.hoverColor,
                                  "hover:shadow-md hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-300"
                                )}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                                    <div className={cn(
                                      "p-2.5 rounded-lg shadow-sm group-hover:scale-110 transition-transform flex-shrink-0",
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
                                    
                                    <div className="text-left min-w-0 flex-1">
                                      <h4 className={cn("font-semibold text-sm", action.textColor)}>
                                        {action.title}
                                      </h4>
                                      <p className="text-xs text-zinc-600 group-hover:text-zinc-700 truncate">
                                        {action.description}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  {action.badge > 0 && (
                                    <Badge 
                                      className={cn(
                                        "text-white text-xs px-2 py-1 animate-pulse ml-2 flex-shrink-0",
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
                </TabsContent>
                
                {/* Tab: Conversas - LAYOUT RESPONSIVO CORRIGIDO */}
                <TabsContent value="chats" className="mt-0">
                  <div className="h-[600px] lg:h-[700px]">
                    <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 h-full">
                      {/* Lista de Conversas */}
                      <div className="w-full lg:w-1/2 h-full lg:h-full">
                        <FadeInUp delay={0} className="h-full">
                          <div className="h-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg">
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
                      <div className="w-full lg:w-1/2 h-full lg:h-full">
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
                    </div>
                  </div>
                </TabsContent>
                
                {/* Tab: Configurações - LAYOUT CORRIGIDO */}
                <TabsContent value="settings" className="mt-0">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Configurações de Notificação - LAYOUT CORRIGIDO */}
                    <FadeInUp delay={0}>
                      <GlassCard className="p-6 border-0 shadow-premium h-fit">
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
                              title: 'Notificações',
                              description: 'Alertas do navegador',
                              color: 'emerald'
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
                              <div className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl transition-all hover:border-gray-300 bg-gradient-to-r from-white to-gray-50/30">
                                <div className="flex items-center space-x-3">
                                  <div className="p-2 rounded-lg bg-gray-100">
                                    <setting.icon className="h-5 w-5 text-gray-700" />
                                  </div>
                                  <div>
                                    <Label className="font-semibold text-zinc-900 cursor-pointer">
                                      {setting.title}
                                    </Label>
                                    <p className="text-sm text-zinc-600">{setting.description}</p>
                                  </div>
                                </div>
                                <Switch 
                                  checked={notificationSettings[setting.key]}
                                  onCheckedChange={() => toggleNotificationSetting(setting.key)}
                                />
                              </div>
                            </HoverLift>
                          ))}
                        </div>
                      </GlassCard>
                    </FadeInUp>
                    
                    {/* Configurações de Equipe - LAYOUT CORRIGIDO */}
                    <FadeInUp delay={200}>
                      <GlassCard className="p-6 border-0 shadow-premium h-fit">
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
                            1 ativo
                          </Badge>
                        </div>
                        
                        <div className="space-y-4">
                          {/* Membro atual da equipe */}
                          <HoverLift>
                            <div className="flex items-center gap-4 p-4 border-2 border-purple-200 rounded-xl hover:border-purple-300 transition-all bg-gradient-to-r from-white to-purple-50/30">
                              <div className="relative">
                                <Avatar className="h-12 w-12 border-2 border-white shadow-lg">
                                  <AvatarImage src={`https://i.pravatar.cc/150?u=${userProfile?.email}`} />
                                  <AvatarFallback className="bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700 font-bold">
                                    {userProfile?.name?.split(' ').map(n => n[0]).join('') || 'LT'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2">
                                  <p className="font-semibold text-zinc-900 truncate">{userProfile?.name || 'Loja'}</p>
                                  <ShieldCheckIcon className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                                </div>
                                <p className="text-sm text-zinc-600 truncate">{userProfile?.email}</p>
                                <p className="text-xs text-emerald-600">Online agora</p>
                              </div>
                              <div className="text-right">
                                <Badge className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300 mb-1">
                                  Administrador
                                </Badge>
                                <p className="text-xs text-zinc-500">{stats.total} conversas ativas</p>
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
              </div>
            </Tabs>
          </div>
        </FadeInUp>
      </div>
    </MainLayout>
  );
};

export default ChatManagementPage;