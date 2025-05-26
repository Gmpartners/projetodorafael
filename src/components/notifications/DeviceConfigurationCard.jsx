import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/animations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { notificationService } from '@/services/notificationService';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';
import { 
  Settings,
  CheckCircleIcon,
  XCircleIcon,
  AlertTriangleIcon,
  SmartphoneIcon,
  Loader2,
  RefreshCcwIcon,
  TestTubeIcon,
  TrashIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

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
      const token = await notificationService.requestPermissionAndGetToken();
      setFcmToken(token);
      setPermissionStatus('granted');

      try {
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
        
        toast.success('🎉 Notificações configuradas com sucesso!', {
          description: 'Você receberá notificações push em tempo real'
        });

        if (userProfile?.role === 'customer') {
          try {
            await apiService.subscribeToStore('E47OkrK3IcNu1Ys8gD4CA29RrHk2');
          } catch (subscribeError) {
            console.log('⚠️ Erro ao se inscrever na loja:', subscribeError.message);
          }
        }

        await handleGetMyTokens();

      } catch (backendError) {
        await notificationService.registerToken(token);
        toast.warning('⚠️ Token salvo localmente', {
          description: 'Backend indisponível. Funcionará quando estiver online.'
        });
      }

    } catch (error) {
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
      const result = await apiService.sendTestNotification(token);
      
      toast.success('🔔 Notificação de teste enviada!', {
        description: 'Verifique sua área de notificações'
      });

    } catch (error) {
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
      setMyTokens(tokens);
      
      if (tokens.length > 0) {
        toast.success(`✅ Você tem ${tokens.length} dispositivo(s) registrado(s)`);
      }
      return tokens;
    } catch (error) {
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

export default DeviceConfigurationCard;