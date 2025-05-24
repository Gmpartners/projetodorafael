import React, { useState, useEffect, useMemo } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { notificationService } from '@/services/notificationService';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';
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
  TagIcon,
  FileTextIcon,
  RefreshCcwIcon,
  TestTubeIcon,
  AlertTriangleIcon,
  WifiIcon,
  WifiOffIcon,
  SmartphoneIcon,
  ComputerIcon
} from 'lucide-react';
import MainLayout from '@/components/common/layout/MainLayout';
import { cn } from '@/lib/utils';

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

const DeviceConfigurationCard = () => {
  const [fcmToken, setFcmToken] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState(notificationService.getPermissionStatus());
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [systemStatus, setSystemStatus] = useState(notificationService.getSystemStatus());
  const [tokenData, setTokenData] = useState(notificationService.getStoredTokenData());

  // Atualizar status do sistema
  useEffect(() => {
    const updateStatus = () => {
      setSystemStatus(notificationService.getSystemStatus());
      setTokenData(notificationService.getStoredTokenData());
    };
    
    updateStatus();
    const interval = setInterval(updateStatus, 2000); // Atualizar a cada 2 segundos
    
    return () => clearInterval(interval);
  }, [permissionStatus, fcmToken]);

  const handleRequestPermission = async () => {
    setLoading(true);
    try {
      const token = await notificationService.requestPermissionAndGetToken();
      setFcmToken(token);
      setPermissionStatus('granted');
      
      if (token) {
        const result = await notificationService.registerToken(token);
        toast.success('🎉 Notificações configuradas com sucesso! (Modo offline)');
        console.log('Resultado do registro:', result);
      }
    } catch (error) {
      console.error('Erro ao configurar notificações:', error);
      toast.error('❌ Erro ao configurar notificações: ' + error.message);
      setPermissionStatus('denied');
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestNotification = async () => {
    if (!fcmToken && !tokenData) {
      toast.error('Configure as notificações primeiro');
      return;
    }

    setTestLoading(true);
    try {
      const result = await notificationService.sendTestNotification(fcmToken || tokenData?.token);
      toast.success('🔔 Notificação de teste enviada! Verifique sua área de notificações.');
    } catch (error) {
      console.error('Erro ao enviar teste:', error);
      toast.error('❌ Erro ao enviar notificação de teste: ' + error.message);
    } finally {
      setTestLoading(false);
    }
  };

  const handleClearData = () => {
    notificationService.clearStoredData();
    setFcmToken(null);
    setTokenData(null);
    toast.success('Dados limpos com sucesso');
  };

  const getPermissionIcon = () => {
    switch (permissionStatus) {
      case 'granted':
        return <CheckCircleIcon className="h-5 w-5 text-emerald-600" />;
      case 'denied':
        return <XCircleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <AlertTriangleIcon className="h-5 w-5 text-amber-600" />;
    }
  };

  const getPermissionText = () => {
    switch (permissionStatus) {
      case 'granted':
        return 'Notificações ativadas';
      case 'denied':
        return 'Notificações bloqueadas';
      default:
        return 'Permissão pendente';
    }
  };

  const getStatusColor = (status) => {
    if (status) return 'text-emerald-600';
    return 'text-red-600';
  };

  return (
    <GlassCard className="p-6 border-0 shadow-premium">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 shadow-lg">
          <SmartphoneIcon className="h-6 w-6 text-blue-700" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-zinc-900">Configuração do Dispositivo</h3>
          <p className="text-zinc-600">Configure notificações push para este navegador</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Status do Sistema */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-zinc-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-600">Suporte do Navegador</span>
              <span className={cn("text-sm font-semibold", getStatusColor(systemStatus.supported))}>
                {systemStatus.supported ? '✅ Suportado' : '❌ Não suportado'}
              </span>
            </div>
          </div>
          
          <div className="p-3 bg-zinc-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-600">Firebase Messaging</span>
              <span className={cn("text-sm font-semibold", getStatusColor(systemStatus.messaging))}>
                {systemStatus.messaging ? '✅ Ativo' : '❌ Inativo'}
              </span>
            </div>
          </div>
          
          <div className="p-3 bg-zinc-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-600">Permissão</span>
              <span className={cn("text-sm font-semibold", getStatusColor(systemStatus.permission === 'granted'))}>
                {systemStatus.permission === 'granted' ? '✅ Concedida' : '❌ Negada'}
              </span>
            </div>
          </div>
          
          <div className="p-3 bg-zinc-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-600">Token Registrado</span>
              <span className={cn("text-sm font-semibold", getStatusColor(systemStatus.hasToken))}>
                {systemStatus.hasToken ? '✅ Sim' : '❌ Não'}
              </span>
            </div>
          </div>
        </div>

        {/* Status da Permissão */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-zinc-50 to-blue-50 rounded-xl border border-zinc-200">
          <div className="flex items-center space-x-3">
            {getPermissionIcon()}
            <div>
              <h4 className="font-semibold text-zinc-900">{getPermissionText()}</h4>
              <p className="text-sm text-zinc-600">
                {systemStatus.ready 
                  ? 'Sistema pronto para receber notificações'
                  : 'Configure o sistema para receber notificações'
                }
              </p>
            </div>
          </div>
          
          {permissionStatus !== 'granted' && notificationService.isSupported() && (
            <Button 
              onClick={handleRequestPermission}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Configurando...
                </>
              ) : (
                <>
                  <Settings className="h-4 w-4 mr-2" />
                  Ativar Notificações
                </>
              )}
            </Button>
          )}
        </div>

        {/* Informações do Token */}
        {(fcmToken || tokenData) && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-zinc-700">Dados do Dispositivo</Label>
              <Badge className="bg-emerald-100 text-emerald-700">
                {tokenData ? 'Salvo localmente' : 'Novo token'}
              </Badge>
            </div>
            
            <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200">
              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-semibold text-emerald-800">Token:</span>
                  <span className="ml-2 font-mono text-emerald-700">
                    {(fcmToken || tokenData?.token)?.substring(0, 40)}...
                  </span>
                </div>
                {tokenData && (
                  <>
                    <div>
                      <span className="font-semibold text-emerald-800">Registrado em:</span>
                      <span className="ml-2 text-emerald-700">
                        {new Date(tokenData.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-emerald-800">Status:</span>
                      <span className="ml-2 text-emerald-700">
                        ✅ Ativo (Modo offline)
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Controles de Teste */}
        {systemStatus.ready && (
          <div className="pt-4 border-t border-zinc-200">
            <div className="flex gap-3">
              <Button 
                onClick={handleSendTestNotification}
                disabled={testLoading}
                variant="outline"
                className="flex-1 border-emerald-300 hover:bg-emerald-50"
              >
                {testLoading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-emerald-600 border-t-transparent rounded-full mr-2" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <TestTubeIcon className="h-4 w-4 mr-2" />
                    Teste de Notificação
                  </>
                )}
              </Button>
              
              <Button 
                onClick={handleClearData}
                variant="outline"
                size="sm"
                className="border-amber-300 hover:bg-amber-50"
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Aviso sobre modo offline */}
        <Alert className="border-amber-200 bg-amber-50/50">
          <AlertTriangleIcon className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Modo de Desenvolvimento:</strong> O sistema está funcionando offline. 
            Os tokens são salvos localmente até que o backend seja implementado.
          </AlertDescription>
        </Alert>

        {/* Mensagem de erro se não suportar */}
        {!notificationService.isSupported() && (
          <Alert className="border-red-200 bg-red-50/50">
            <AlertTriangleIcon className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Este navegador não suporta notificações push. Recomendamos usar Chrome, Firefox, Edge ou Opera.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </GlassCard>
  );
};



// Componente de criação de notificação manual
const CreateNotificationCard = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState('custom');
  const [targetType, setTargetType] = useState('all');
  const [loading, setLoading] = useState(false);

  const handleSendNotification = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error('Preencha título e mensagem');
      return;
    }

    setLoading(true);
    try {
      // Aqui você implementaria a API real para enviar notificação
      // Por enquanto, simularemos
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Notificação enviada com sucesso!');
      setTitle('');
      setBody('');
    } catch (error) {
      toast.error('Erro ao enviar notificação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard className="p-6 border-0 shadow-premium">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 shadow-lg">
          <PlusIcon className="h-6 w-6 text-purple-700" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-zinc-900">Criar Notificação</h3>
          <p className="text-zinc-600">Envie uma notificação personalizada</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Tipo de Notificação */}
        <div className="space-y-2">
          <Label htmlFor="type">Tipo de Notificação</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="promotion">🎁 Promoção</SelectItem>
              <SelectItem value="news">📢 Novidade</SelectItem>
              <SelectItem value="order_update">📦 Atualização de Pedido</SelectItem>
              <SelectItem value="feedback">⭐ Solicitação de Avaliação</SelectItem>
              <SelectItem value="custom">💬 Personalizada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Destinatário */}
        <div className="space-y-2">
          <Label htmlFor="target">Destinatário</Label>
          <Select value={targetType} onValueChange={setTargetType}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o destinatário..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">👥 Todos os Clientes</SelectItem>
              <SelectItem value="active">✅ Clientes Ativos</SelectItem>
              <SelectItem value="new">🆕 Clientes Novos</SelectItem>
              <SelectItem value="vip">⭐ Clientes VIP</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Título */}
        <div className="space-y-2">
          <Label htmlFor="title">Título da Notificação</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Nova promoção disponível!"
            maxLength={50}
          />
          <p className="text-xs text-zinc-500">{title.length}/50 caracteres</p>
        </div>

        {/* Mensagem */}
        <div className="space-y-2">
          <Label htmlFor="body">Mensagem</Label>
          <Textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Digite a mensagem da notificação..."
            rows={4}
            maxLength={160}
          />
          <p className="text-xs text-zinc-500">{body.length}/160 caracteres</p>
        </div>

        {/* Preview */}
        {(title || body) && (
          <div className="p-4 bg-gradient-to-r from-zinc-50 to-blue-50 rounded-xl border border-zinc-200">
            <h4 className="text-sm font-semibold text-zinc-700 mb-3 flex items-center">
              <EyeIcon className="h-4 w-4 mr-2" />
              Preview da Notificação
            </h4>
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BellIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h5 className="font-semibold text-zinc-900 text-sm">
                    {title || 'Título da notificação'}
                  </h5>
                  <p className="text-sm text-zinc-600 mt-1">
                    {body || 'Mensagem da notificação'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enviar */}
        <Button 
          onClick={handleSendNotification}
          disabled={loading || !title.trim() || !body.trim()}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {loading ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
              Enviando...
            </>
          ) : (
            <>
              <SendIcon className="h-4 w-4 mr-2" />
              Enviar Notificação
            </>
          )}
        </Button>
      </div>
    </GlassCard>
  );
};

const NotificationManagementPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    total: 156,
    sent: 142,
    scheduled: 8,
    draft: 6,
    read: 78.5,
    clicked: 12.3
  });
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Performance cards
  const performanceCards = useMemo(() => [
    {
      title: 'Taxa de Leitura',
      value: stats?.read || 0,
      suffix: '%',
      icon: EyeIcon,
      color: 'purple',
      change: 4.2,
      changeLabel: 'vs mês anterior',
      trend: 'up'
    },
    {
      title: 'Taxa de Clique',
      value: stats?.clicked || 0,
      suffix: '%',
      icon: TargetIcon,
      color: 'emerald',
      change: 2.1,
      changeLabel: 'vs mês anterior',
      trend: 'up'
    }
  ], [stats]);

  // Quick actions
  const quickActions = useMemo(() => [
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
      badge: 0,
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
      badge: 3,
      badgeColor: 'bg-emerald-500',
      onClick: () => setActiveTab('campaigns')
    },
    {
      id: 'test_notifications',
      title: 'Testar Sistema',
      description: 'Enviar notificação de teste',
      icon: TestTubeIcon,
      color: 'amber',
      bgColor: 'from-amber-50 to-amber-100',
      borderColor: 'border-amber-200',
      hoverColor: 'hover:border-amber-400 hover:bg-amber-50',
      textColor: 'text-amber-600',
      badge: 0,
      badgeColor: 'bg-amber-500',
      onClick: () => setActiveTab('config')
    }
  ], []);

  return (
    <MainLayout userType="store" pageTitle="Gerenciamento de Notificações">
      <div className="space-y-6 pb-8">
        <FloatingParticles className="fixed inset-0 z-0" count={8} />
        
        {/* Header */}
        <FadeInUp delay={0}>
          <div className="relative">
            <GlassCard variant="gradient" className="p-4 border-0 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-blue-600/5 to-indigo-600/5" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-400/10 to-transparent rounded-full transform translate-x-16 -translate-y-8" />
              
              <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 shadow-lg">
                        <BellIcon className="h-6 w-6 text-purple-700" />
                      </div>
                      <PulseEffect color="purple" size="sm" className="absolute -top-1 -right-1" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 bg-clip-text text-transparent">
                        Central de Notificações Push
                      </h1>
                      <p className="text-sm text-zinc-600 font-medium">
                        Configure e gerencie notificações push em tempo real
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                      placeholder="Buscar notificações..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-10 w-56 border-zinc-200 focus:border-purple-300 focus:ring-purple-200 bg-white/80 backdrop-blur-sm"
                    />
                  </div>
                  
                  <Button className="btn-premium h-10 px-4">
                    <FilterIcon className="h-4 w-4 mr-2" />
                    Filtros
                  </Button>
                  <Button className="btn-premium h-10 px-4" onClick={() => setActiveTab('create')}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Nova Notificação
                  </Button>
                </div>
              </div>
            </GlassCard>
          </div>
        </FadeInUp>

        {/* Tabs */}
        <FadeInUp delay={200}>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/50 shadow-xl p-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full max-w-3xl mx-auto bg-gradient-to-r from-zinc-100/80 to-zinc-200/80 backdrop-blur-sm p-1.5 rounded-xl shadow-inner border border-white/50">
                <TabsTrigger 
                  value="overview" 
                  className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:scale-105 transition-all duration-300 rounded-lg font-semibold"
                >
                  <BarChart3Icon className="h-4 w-4 mr-2" />
                  Visão Geral
                </TabsTrigger>
                <TabsTrigger 
                  value="config"
                  className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:scale-105 transition-all duration-300 rounded-lg font-semibold"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Configuração
                </TabsTrigger>
                <TabsTrigger 
                  value="create"
                  className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:scale-105 transition-all duration-300 rounded-lg font-semibold"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Criar
                </TabsTrigger>
                <TabsTrigger 
                  value="campaigns"
                  className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:scale-105 transition-all duration-300 rounded-lg font-semibold"
                >
                  <TargetIcon className="h-4 w-4 mr-2" />
                  Campanhas
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-6 space-y-6">
                {/* Quick Stats */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl border border-emerald-200/50">
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-emerald-700">{stats?.total || 0}</div>
                      <div className="text-xs text-emerald-600">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-700">{stats?.sent || 0}</div>
                      <div className="text-xs text-blue-600">Enviadas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-amber-700">{stats?.scheduled || 0}</div>
                      <div className="text-xs text-amber-600">Agendadas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-700">{stats?.draft || 0}</div>
                      <div className="text-xs text-purple-600">Rascunhos</div>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-emerald-300 hover:bg-emerald-50"
                  >
                    <RefreshCcwIcon className="h-4 w-4 mr-2" />
                    Atualizar
                  </Button>
                </div>

                {/* Performance Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {performanceCards.map((stat, i) => (
                    <FadeInUp key={i} delay={400 + i * 100}>
                      <Card className="hover-lift border-0 shadow-premium bg-gradient-to-br from-white to-zinc-50/50">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="space-y-3">
                              <div className="flex items-center space-x-3">
                                <div className={cn(
                                  "p-2.5 rounded-xl shadow-md",
                                  stat.color === 'purple' && "bg-gradient-to-br from-purple-100 to-purple-200",
                                  stat.color === 'emerald' && "bg-gradient-to-br from-emerald-100 to-emerald-200"
                                )}>
                                  <stat.icon className={cn(
                                    "h-5 w-5",
                                    stat.color === 'purple' && "text-purple-700",
                                    stat.color === 'emerald' && "text-emerald-700"
                                  )} />
                                </div>
                                <h3 className="font-semibold text-zinc-800">{stat.title}</h3>
                              </div>
                              
                              <div className="space-y-1">
                                <AnimatedNumber 
                                  value={stat.value} 
                                  suffix={stat.suffix}
                                  className="text-2xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-700 bg-clip-text text-transparent"
                                />
                                <div className="flex items-center space-x-1 text-xs">
                                  <TrendingUpIcon className="h-3 w-3 text-emerald-600" />
                                  <span className="text-emerald-600 font-medium">+{stat.change}%</span>
                                  <span className="text-zinc-500">{stat.changeLabel}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </FadeInUp>
                  ))}
                </div>

                {/* Quick Actions */}
                <FadeInUp delay={700}>
                  <GlassCard className="p-6 border-0 shadow-premium">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-200 shadow-md">
                          <ZapIcon className="h-5 w-5 text-emerald-700" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-zinc-900">Ações Rápidas</h3>
                          <p className="text-sm text-zinc-600">Configure e gerencie notificações push</p>
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
              </TabsContent>
              
              <TabsContent value="config" className="mt-6">
                <FadeInUp delay={0}>
                  <DeviceConfigurationCard />
                </FadeInUp>
              </TabsContent>
              
              <TabsContent value="create" className="mt-6">
                <FadeInUp delay={0}>
                  <CreateNotificationCard />
                </FadeInUp>
              </TabsContent>
              
              <TabsContent value="campaigns" className="mt-6">
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