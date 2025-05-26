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
  ComputerIcon,
  Loader2,
  PlayIcon,
  PauseIcon,
  MoreVerticalIcon,
  ImageIcon,
  UploadIcon,
  LinkIcon
} from 'lucide-react';
import MainLayout from '@/components/common/layout/MainLayout';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

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
  const { userProfile } = useAuth();
  const [fcmToken, setFcmToken] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState(notificationService.getPermissionStatus());
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [systemStatus, setSystemStatus] = useState(notificationService.getSystemStatus());
  const [tokenData, setTokenData] = useState(notificationService.getStoredTokenData());
  const [myTokens, setMyTokens] = useState([]);

  useEffect(() => {
    const updateStatus = () => {
      setSystemStatus(notificationService.getSystemStatus());
      setTokenData(notificationService.getStoredTokenData());
    };
    
    updateStatus();
    const interval = setInterval(updateStatus, 2000);
    
    return () => clearInterval(interval);
  }, [permissionStatus, fcmToken]);

  const handleRequestPermission = async () => {
    setLoading(true);
    try {
      console.log('🔔 Iniciando configuração FCM...');
      
      const token = await notificationService.requestPermissionAndGetToken();
      console.log('✅ Token FCM obtido:', token.substring(0, 40) + '...');
      
      setFcmToken(token);
      setPermissionStatus('granted');

      try {
        console.log('📡 Registrando token no backend...');
        
        const deviceInfo = {
          platform: 'web',
          browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : 
                   navigator.userAgent.includes('Firefox') ? 'Firefox' : 
                   navigator.userAgent.includes('Safari') ? 'Safari' : 'Unknown',
          os: navigator.platform,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        };

        const result = await apiService.registerFCMToken(token, deviceInfo);
        console.log('✅ Token registrado no backend:', result);
        
        toast.success('🎉 Notificações configuradas com sucesso!', {
          description: 'Você receberá notificações push em tempo real'
        });

        if (userProfile?.role === 'customer') {
          try {
            await apiService.subscribeToStore('E47OkrK3IcNu1Ys8gD4CA29RrHk2');
            console.log('✅ Inscrito na loja para receber notificações');
          } catch (subscribeError) {
            console.log('⚠️ Erro ao se inscrever na loja:', subscribeError.message);
          }
        }

        await handleGetMyTokens();

      } catch (backendError) {
        console.error('❌ Erro ao registrar no backend:', backendError);
        
        await notificationService.registerToken(token);
        toast.warning('⚠️ Token salvo localmente', {
          description: 'Backend indisponível. Funcionará quando estiver online.'
        });
      }

    } catch (error) {
      console.error('❌ Erro ao configurar notificações:', error);
      toast.error('❌ Erro ao configurar notificações: ' + error.message);
      setPermissionStatus('denied');
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestNotification = async () => {
    if (!fcmToken && !tokenData && myTokens.length === 0) {
      toast.error('Configure as notificações primeiro');
      return;
    }

    setTestLoading(true);
    try {
      const token = fcmToken || tokenData?.token || myTokens[0]?.token;
      console.log('🧪 Enviando notificação de teste via backend...');

      const result = await apiService.sendTestNotification(token);
      console.log('✅ Notificação enviada via backend:', result);
      
      toast.success('🔔 Notificação de teste enviada!', {
        description: 'Verifique sua área de notificações'
      });

    } catch (error) {
      console.error('❌ Erro ao enviar teste via backend:', error);
      
      try {
        const token = fcmToken || tokenData?.token;
        if (token) {
          await notificationService.sendTestNotification(token);
          toast.success('🔔 Notificação de teste local enviada!');
        }
      } catch (localError) {
        toast.error('❌ Erro ao enviar notificação: ' + error.message);
      }
    } finally {
      setTestLoading(false);
    }
  };

  const handleGetMyTokens = async () => {
    try {
      const tokens = await apiService.getMyTokens();
      console.log('📱 Meus tokens:', tokens);
      setMyTokens(tokens);
      
      if (tokens.length > 0) {
        toast.success(`✅ Você tem ${tokens.length} dispositivo(s) registrado(s)`);
      }
      return tokens;
    } catch (error) {
      console.error('❌ Erro ao buscar tokens:', error);
      toast.error('Erro ao buscar dispositivos registrados');
      return [];
    }
  };

  const handleClearData = async () => {
    try {
      notificationService.clearStoredData();
      setFcmToken(null);
      setTokenData(null);
      setMyTokens([]);
      toast.success('Dados limpos com sucesso');
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
      toast.error('Erro ao limpar dados');
    }
  };

  useEffect(() => {
    if (systemStatus.ready) {
      handleGetMyTokens();
    }
  }, [systemStatus.ready]);

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
              <span className="text-sm text-zinc-600">Tokens Registrados</span>
              <span className={cn("text-sm font-semibold", getStatusColor(myTokens.length > 0))}>
                {myTokens.length > 0 ? `✅ ${myTokens.length}` : '❌ 0'}
              </span>
            </div>
          </div>
        </div>

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
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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

        {myTokens.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-zinc-700">Dispositivos Registrados no Backend</Label>
              <Badge className="bg-emerald-100 text-emerald-700">
                {myTokens.length} dispositivo{myTokens.length > 1 ? 's' : ''}
              </Badge>
            </div>
            
            <div className="space-y-2">
              {myTokens.map((tokenInfo, index) => (
                <div key={tokenInfo.id || index} className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200">
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="font-semibold text-emerald-800">Token:</span>
                      <span className="ml-2 font-mono text-emerald-700">
                        {tokenInfo.token ? tokenInfo.token.substring(0, 40) + '...' : 'Token não disponível'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="font-semibold text-emerald-800">Dispositivo:</span>
                        <span className="ml-2 text-emerald-700">
                          {tokenInfo.deviceInfo?.browser || 'Web'} ({tokenInfo.deviceInfo?.platform || 'Unknown'})
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-emerald-800">Status:</span>
                        <span className="ml-2 text-emerald-700">
                          {tokenInfo.isValid ? '✅ Ativo' : '❌ Inválido'}
                        </span>
                      </div>
                    </div>
                    {tokenInfo.createdAt && (
                      <div>
                        <span className="font-semibold text-emerald-800">Registrado em:</span>
                        <span className="ml-2 text-emerald-700">
                          {new Date(tokenInfo.createdAt._seconds ? tokenInfo.createdAt._seconds * 1000 : tokenInfo.createdAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {tokenInfo.storeSubscriptions && tokenInfo.storeSubscriptions.length > 0 && (
                      <div>
                        <span className="font-semibold text-emerald-800">Inscrições:</span>
                        <span className="ml-2 text-emerald-700">
                          {tokenInfo.storeSubscriptions.length} loja{tokenInfo.storeSubscriptions.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tokenData && myTokens.length === 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-zinc-700">Token Local (Fallback)</Label>
              <Badge className="bg-amber-100 text-amber-700">
                Apenas Local
              </Badge>
            </div>
            
            <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200">
              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-semibold text-amber-800">Token:</span>
                  <span className="ml-2 font-mono text-amber-700">
                    {tokenData.token.substring(0, 40)}...
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-amber-800">Registrado em:</span>
                  <span className="ml-2 text-amber-700">
                    {new Date(tokenData.timestamp).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-amber-800">Status:</span>
                  <span className="ml-2 text-amber-700">
                    ⚠️ Apenas local (backend indisponível)
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

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
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <TestTubeIcon className="h-4 w-4 mr-2" />
                    Teste via Backend
                  </>
                )}
              </Button>
              
              <Button 
                onClick={handleGetMyTokens}
                variant="outline"
                size="sm"
                className="border-blue-300 hover:bg-blue-50"
              >
                <RefreshCcwIcon className="h-4 w-4" />
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

        <Alert className="border-blue-200 bg-blue-50/50">
          <AlertTriangleIcon className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Sistema Integrado:</strong> As notificações estão conectadas com o backend real. 
            Tokens são registrados no Firebase e validados automaticamente.
          </AlertDescription>
        </Alert>

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

const CreateNotificationCard = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState('custom');
  const [targetType, setTargetType] = useState('subscribers');
  const [targetUserId, setTargetUserId] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState('');

  const [notificationImage, setNotificationImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [notificationLogo, setNotificationLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Apenas arquivos de imagem são permitidos');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 5MB');
      return;
    }

    setNotificationImage(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
    
    toast.success('Imagem selecionada! 📸');
  };

  const handleRemoveImage = () => {
    setNotificationImage(null);
    setImagePreview(null);
    const imageInput = document.getElementById('notification-image');
    if (imageInput) imageInput.value = '';
    toast.success('Imagem removida');
  };

  const handleLogoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Apenas arquivos de imagem são permitidos');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo muito grande. Máximo 2MB');
      return;
    }

    setNotificationLogo(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target.result);
    };
    reader.readAsDataURL(file);
    
    toast.success('Logo selecionado! 🎯');
  };

  const handleRemoveLogo = () => {
    setNotificationLogo(null);
    setLogoPreview(null);
    const logoInput = document.getElementById('notification-logo');
    if (logoInput) logoInput.value = '';
    toast.success('Logo removido');
  };

  const uploadNotificationImage = async () => {
    if (!notificationImage) return null;

    try {
      setUploadingImage(true);
      console.log('📤 Fazendo upload da imagem da notificação...');
      
      const result = await apiService.uploadBanner(notificationImage);
      console.log('✅ Imagem da notificação uploadada:', result);
      
      return result.data?.imageUrl || result.imageUrl;
    } catch (error) {
      console.error('❌ Erro no upload da imagem:', error);
      toast.error('Erro ao fazer upload da imagem: ' + error.message);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const uploadNotificationLogo = async () => {
    if (!notificationLogo) return null;

    try {
      setUploadingLogo(true);
      console.log('📤 Fazendo upload do logo da notificação...');
      
      const result = await apiService.uploadLogo(notificationLogo);
      console.log('✅ Logo da notificação uploadado:', result);
      
      return result.data?.imageUrl || result.imageUrl;
    } catch (error) {
      console.error('❌ Erro no upload do logo:', error);
      toast.error('Erro ao fazer upload do logo: ' + error.message);
      return null;
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSendNotification = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error('Preencha título e mensagem');
      return;
    }

    if (targetType === 'subscribers' && !scheduledDate) {
      if (!confirm(`Confirma o envio imediato para TODOS os usuários inscritos?`)) {
        return;
      }
    }

    setLoading(true);
    try {
      console.log('📤 Enviando notificação via backend...');

      let imageUrl = null;
      if (notificationImage) {
        console.log('📤 Fazendo upload da imagem primeiro...');
        imageUrl = await uploadNotificationImage();
        if (!imageUrl && notificationImage) {
          setLoading(false);
          return;
        }
      }

      let logoUrl = null;
      if (notificationLogo) {
        console.log('📤 Fazendo upload do logo primeiro...');
        logoUrl = await uploadNotificationLogo();
        if (!logoUrl && notificationLogo) {
          setLoading(false);
          return;
        }
      }

      const baseNotificationData = {
        title: title.trim(),
        body: body.trim(),
        type,
        data: {
          type,
          timestamp: new Date().toISOString(),
          source: 'manual_creation',
          ...(link && { link: link.trim() }),
          ...(imageUrl && { imageUrl }),
          ...(logoUrl && { logoUrl })
        }
      };

      if (imageUrl) {
        baseNotificationData.image = imageUrl;
      }

      if (logoUrl) {
        baseNotificationData.icon = logoUrl;
      }

      if (scheduledDate) {
        const notificationData = {
          ...baseNotificationData,
          scheduledDate: new Date(scheduledDate).toISOString()
        };

        const result = await apiService.createNotification(notificationData);
        console.log('✅ Notificação agendada:', result);
        
        toast.success('📅 Notificação agendada com sucesso!', {
          description: `Será enviada em ${new Date(scheduledDate).toLocaleString()}`
        });
      } else {
        const notificationData = {
          ...baseNotificationData,
          target: targetType,
          targetId: targetUserId || undefined
        };

        const result = await apiService.sendImmediateNotification(notificationData);
        console.log('✅ Notificação enviada:', result);
        
        toast.success('🚀 Notificação enviada com sucesso!', {
          description: `Enviada para ${targetType === 'subscribers' ? 'todos os inscritos' : 'usuário específico'}`
        });
      }
      
      setTitle('');
      setBody('');
      setTargetUserId('');
      setScheduledDate('');
      setLink('');
      handleRemoveImage();
      handleRemoveLogo();
      
    } catch (error) {
      console.error('❌ Erro ao enviar notificação:', error);
      toast.error('❌ Erro ao enviar notificação: ' + error.message);
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
          <h3 className="text-xl font-bold text-zinc-900">Criar Notificação Personalizada</h3>
          <p className="text-zinc-600">Envie uma notificação com texto, imagens e link</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="notification-logo">Logo/Ícone (Opcional)</Label>
            <div className="relative border-2 border-dashed border-zinc-300 rounded-lg p-4 hover:border-purple-400 transition-colors h-32">
              {logoPreview ? (
                <div className="relative h-full flex items-center justify-center">
                  <img 
                    src={logoPreview} 
                    alt="Preview do logo"
                    className="max-h-full max-w-full object-contain"
                  />
                  <Button
                    type="button"
                    onClick={handleRemoveLogo}
                    size="sm"
                    variant="destructive"
                    className="absolute top-0 right-0"
                  >
                    <TrashIcon className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <label htmlFor="notification-logo" className="cursor-pointer h-full flex flex-col items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-2 bg-zinc-100 rounded-lg flex items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-zinc-400" />
                    </div>
                    <p className="text-xs text-zinc-600">Ícone da notificação</p>
                    <p className="text-xs text-zinc-400">Máx. 2MB</p>
                  </div>
                </label>
              )}
              {!logoPreview && (
                <input
                  id="notification-logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoSelect}
                  className="hidden"
                />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notification-image">Imagem Grande (Opcional)</Label>
            <div className="relative border-2 border-dashed border-zinc-300 rounded-lg p-4 hover:border-purple-400 transition-colors h-32">
              {imagePreview ? (
                <div className="relative h-full">
                  <img 
                    src={imagePreview} 
                    alt="Preview da imagem"
                    className="w-full h-full object-cover rounded"
                  />
                  <Button
                    type="button"
                    onClick={handleRemoveImage}
                    size="sm"
                    variant="destructive"
                    className="absolute top-0 right-0"
                  >
                    <TrashIcon className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <label htmlFor="notification-image" className="cursor-pointer h-full flex flex-col items-center justify-center">
                  <div className="text-center">
                    <ImageIcon className="h-8 w-8 text-zinc-400 mx-auto mb-2" />
                    <p className="text-xs text-zinc-600">Banner expandível</p>
                    <p className="text-xs text-zinc-400">PNG, JPG ou WebP • Máx. 5MB</p>
                  </div>
                </label>
              )}
              {!imagePreview && (
                <input
                  id="notification-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              )}
            </div>
          </div>
        </div>

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

        <div className="space-y-2">
          <Label htmlFor="target">Destinatário</Label>
          <Select value={targetType} onValueChange={setTargetType}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o destinatário..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="subscribers">👥 Todos os Inscritos</SelectItem>
              <SelectItem value="user">👤 Usuário Específico</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {targetType === 'user' && (
          <div className="space-y-2">
            <Label htmlFor="targetUserId">ID do Usuário</Label>
            <Input
              id="targetUserId"
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              placeholder="Ex: 0HeRINZTlvOM5raS8J4AkITanWP2"
            />
          </div>
        )}

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="title">Título da Notificação</Label>
            <span className={cn(
              "text-xs",
              title.length > 40 ? "text-red-500 font-semibold" : "text-zinc-500"
            )}>
              {title.length}/50 {title.length > 40 && "⚠️"}
            </span>
          </div>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Nova promoção disponível!"
            maxLength={50}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="body">Mensagem</Label>
            <span className={cn(
              "text-xs",
              body.length > 140 ? "text-red-500 font-semibold" : "text-zinc-500"
            )}>
              {body.length}/160 {body.length > 140 && "⚠️"}
            </span>
          </div>
          <Textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Digite a mensagem da notificação..."
            rows={4}
            maxLength={160}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="link">Link de Destino (Opcional)</Label>
          <div className="relative">
            <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              id="link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://exemplo.com/promocao"
              className="pl-10"
            />
          </div>
          <p className="text-xs text-zinc-500">
            Ao clicar na notificação, o usuário será direcionado para este link
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="scheduledDate">Agendar Envio (Opcional)</Label>
          <Input
            id="scheduledDate"
            type="datetime-local"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
          />
          <p className="text-xs text-zinc-500">
            {scheduledDate ? 'Será enviada automaticamente na data especificada' : 'Deixe vazio para envio imediato'}
          </p>
        </div>

        {(title || body || imagePreview || logoPreview || link) && (
          <div className="p-4 bg-gradient-to-r from-zinc-50 to-blue-50 rounded-xl border border-zinc-200">
            <h4 className="text-sm font-semibold text-zinc-700 mb-3 flex items-center">
              <EyeIcon className="h-4 w-4 mr-2" />
              Preview da Notificação
            </h4>
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="h-10 w-10 rounded-lg object-cover" />
                  ) : (
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BellIcon className="h-6 w-6 text-blue-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-semibold text-zinc-900 text-sm truncate">
                    {title || 'Título da notificação'}
                  </h5>
                  <p className="text-sm text-zinc-600 mt-1">
                    {body || 'Mensagem da notificação'}
                  </p>
                  {imagePreview && (
                    <div className="mt-2">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full max-w-xs h-32 object-cover rounded border"
                      />
                    </div>
                  )}
                  {link && (
                    <div className="mt-2 flex items-center text-xs text-blue-600">
                      <LinkIcon className="h-3 w-3 mr-1" />
                      <span className="truncate">{link}</span>
                    </div>
                  )}
                  <div className="flex items-center mt-2 text-xs text-zinc-400 space-x-2">
                    <span>Projeto Rafael</span>
                    <span>•</span>
                    <span>{scheduledDate ? 'Agendada' : 'Agora'}</span>
                    {(imagePreview || logoPreview) && (
                      <>
                        <span>•</span>
                        <span className="flex items-center">
                          {logoPreview && '🎯'} 
                          {imagePreview && '📸'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <Button 
          onClick={handleSendNotification}
          disabled={loading || uploadingImage || uploadingLogo || !title.trim() || !body.trim()}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {loading || uploadingImage || uploadingLogo ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {uploadingImage || uploadingLogo ? 'Fazendo upload...' : (scheduledDate ? 'Agendando...' : 'Enviando...')}
            </>
          ) : (
            <>
              {scheduledDate ? (
                <>
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Agendar Notificação
                </>
              ) : (
                <>
                  <SendIcon className="h-4 w-4 mr-2" />
                  Enviar Agora
                </>
              )}
              {(imagePreview || logoPreview) && <ImageIcon className="h-4 w-4 ml-2" />}
            </>
          )}
        </Button>
      </div>
    </GlassCard>
  );
};

const NotificationListCard = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadNotifications = async () => {
    try {
      setLoading(true);
      console.log('📋 Carregando notificações do backend...');
      
      const filters = {};
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }
      if (searchQuery.trim()) {
        filters.search = searchQuery.trim();
      }

      const notificationList = await apiService.getStoreNotifications(filters);
      console.log('✅ Notificações carregadas:', notificationList);
      
      setNotifications(notificationList || []);
      
    } catch (error) {
      console.error('❌ Erro ao carregar notificações:', error);
      toast.error('Erro ao carregar notificações');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [statusFilter]);

  const handleSearch = () => {
    loadNotifications();
  };

  const handleDeleteNotification = async (notificationId) => {
    if (!confirm('Tem certeza que deseja deletar esta notificação?')) return;

    try {
      await apiService.deleteNotification(notificationId);
      toast.success('Notificação deletada com sucesso');
      await loadNotifications();
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
      toast.error('Erro ao deletar notificação');
    }
  };

  const handleCancelNotification = async (notificationId) => {
    if (!confirm('Tem certeza que deseja cancelar esta notificação?')) return;

    try {
      await apiService.cancelNotification(notificationId);
      toast.success('Notificação cancelada com sucesso');
      await loadNotifications();
    } catch (error) {
      console.error('Erro ao cancelar notificação:', error);
      toast.error('Erro ao cancelar notificação');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Data não disponível';
    
    try {
      let date;
      if (dateString._seconds) {
        date = new Date(dateString._seconds * 1000);
      } else {
        date = new Date(dateString);
      }
      
      return date.toLocaleString('pt-BR');
    } catch (error) {
      return 'Data inválida';
    }
  };

  return (
    <GlassCard className="p-6 border-0 shadow-premium">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 shadow-lg">
            <BellIcon className="h-6 w-6 text-emerald-700" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-zinc-900">Minhas Notificações</h3>
            <p className="text-zinc-600">Gerencie notificações enviadas e agendadas</p>
          </div>
        </div>
        <Button onClick={loadNotifications} disabled={loading} variant="outline">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCcwIcon className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Buscar notificações..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="sent">Enviadas</SelectItem>
            <SelectItem value="scheduled">Agendadas</SelectItem>
            <SelectItem value="draft">Rascunhos</SelectItem>
            <SelectItem value="failed">Falharam</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleSearch}>
          <SearchIcon className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-3" />
            <p className="text-zinc-600">Carregando notificações...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8">
            <BellIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma notificação encontrada</h3>
            <p className="text-gray-500">Crie sua primeira notificação</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <Card key={notification.id} className="border border-zinc-200 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-zinc-900">{notification.title}</h4>
                      <NotificationStatusBadge status={notification.status} />
                      {notification.type && <NotificationTypeBadge type={notification.type} />}
                      {(notification.image || notification.data?.imageUrl) && (
                        <Badge className="bg-purple-100 text-purple-700">
                          <ImageIcon className="h-3 w-3 mr-1" />
                          Imagem
                        </Badge>
                      )}
                      {(notification.icon || notification.data?.logoUrl) && (
                        <Badge className="bg-indigo-100 text-indigo-700">
                          🎯 Logo
                        </Badge>
                      )}
                      {notification.data?.link && (
                        <Badge className="bg-blue-100 text-blue-700">
                          <LinkIcon className="h-3 w-3 mr-1" />
                          Link
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-zinc-600 text-sm mb-3">{notification.body}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                      {notification.sentAt && (
                        <span>📤 Enviada: {formatDate(notification.sentAt)}</span>
                      )}
                      {notification.scheduledDate && !notification.sentAt && (
                        <span>📅 Agendada: {formatDate(notification.scheduledDate)}</span>
                      )}
                      {notification.target && (
                        <span>🎯 Para: {notification.target === 'subscribers' ? 'Todos os inscritos' : 'Usuário específico'}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {notification.status === 'scheduled' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancelNotification(notification.id)}
                        className="border-amber-300 hover:bg-amber-50"
                      >
                        <PauseIcon className="h-3 w-3" />
                      </Button>
                    )}
                    
                    {(notification.status === 'draft' || notification.status === 'scheduled') && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteNotification(notification.id)}
                        className="border-red-300 hover:bg-red-50"
                      >
                        <TrashIcon className="h-3 w-3" />
                      </Button>
                    )}
                    
                    <Button size="sm" variant="ghost">
                      <MoreVerticalIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </GlassCard>
  );
};

const NotificationManagementPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    sent: 0,
    scheduled: 0,
    draft: 0,
    subscribers: 0,
    validTokens: 0
  });

  useEffect(() => {
    fetchNotificationStats();
  }, []);

  const fetchNotificationStats = async () => {
    try {
      setIsLoading(true);
      
      const tokenStats = await apiService.getStoreTokenStats();
      console.log('📊 Estatísticas de tokens:', tokenStats);
      
      const notifications = await apiService.getStoreNotifications();
      console.log('📋 Notificações:', notifications);
      
      const notificationStats = {
        total: notifications.length,
        sent: notifications.filter(n => n.status === 'sent').length,
        scheduled: notifications.filter(n => n.status === 'scheduled').length,
        draft: notifications.filter(n => n.status === 'draft').length,
      };
      
      setStats({
        ...notificationStats,
        subscribers: tokenStats.totalSubscribers || 0,
        validTokens: tokenStats.validTokens || 0
      });
      
    } catch (error) {
      console.error('❌ Erro ao carregar estatísticas:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
    },
    {
      id: 'subscribers',
      title: 'Inscritos',
      description: 'Usuários que recebem notificações',
      icon: UsersIcon,
      color: 'amber',
      bgColor: 'from-amber-50 to-amber-100',
      borderColor: 'border-amber-200',
      hoverColor: 'hover:border-amber-400 hover:bg-amber-50',
      textColor: 'text-amber-600',
      badge: stats.subscribers,
      badgeColor: 'bg-amber-500',
      onClick: () => setActiveTab('subscribers')
    }
  ], [stats]);

  return (
    <MainLayout userType="store" pageTitle="Gerenciamento de Notificações">
      <div className="space-y-6 pb-8">
        <FloatingParticles className="fixed inset-0 z-0" count={8} />
        
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
                        Sistema integrado com Firebase Cloud Messaging
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
                  
                  <Button 
                    className="btn-premium h-10 px-4"
                    onClick={fetchNotificationStats}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCcwIcon className="h-4 w-4 mr-2" />
                    )}
                    Atualizar
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

        <FadeInUp delay={200}>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/50 shadow-xl p-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full max-w-4xl mx-auto bg-gradient-to-r from-zinc-100/80 to-zinc-200/80 backdrop-blur-sm p-1.5 rounded-xl shadow-inner border border-white/50">
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
                    onClick={fetchNotificationStats}
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <FadeInUp delay={400}>
                    <Card className="hover-lift border-0 shadow-premium bg-gradient-to-br from-white to-zinc-50/50">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                              <div className="p-2.5 rounded-xl shadow-md bg-gradient-to-br from-purple-100 to-purple-200">
                                <UsersIcon className="h-5 w-5 text-purple-700" />
                              </div>
                              <h3 className="font-semibold text-zinc-800">Dispositivos Ativos</h3>
                            </div>
                            
                            <div className="space-y-1">
                              <AnimatedNumber 
                                value={stats.validTokens} 
                                className="text-2xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-700 bg-clip-text text-transparent"
                              />
                              <div className="flex items-center space-x-1 text-xs">
                                <span className="text-zinc-500">Tokens FCM válidos</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </FadeInUp>

                  <FadeInUp delay={500}>
                    <Card className="hover-lift border-0 shadow-premium bg-gradient-to-br from-white to-zinc-50/50">
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
                              <AnimatedNumber 
                                value={stats.sent > 0 ? Math.round((stats.sent / (stats.sent + stats.draft)) * 100) : 0} 
                                suffix="%"
                                className="text-2xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-700 bg-clip-text text-transparent"
                              />
                              <div className="flex items-center space-x-1 text-xs">
                                <span className="text-zinc-500">Notificações entregues</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </FadeInUp>
                </div>

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
                        Sistema Integrado
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
                                      "text-white text-xs px-2 py-1",
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
                <FadeInUp delay={0}>
                  <NotificationListCard />
                </FadeInUp>
              </TabsContent>
            </Tabs>
          </div>
        </FadeInUp>
      </div>
    </MainLayout>
  );
};

export default NotificationManagementPage;