// src/components/notifications/NotificationSetupCard.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { notificationService } from '@/services/notificationService';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';
import { 
  BellIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  AlertTriangleIcon,
  SmartphoneIcon,
  TestTubeIcon,
  Loader2,
  SettingsIcon,
  InfoIcon
} from 'lucide-react';

const NotificationSetupCard = ({ className = '', compact = false }) => {
  const { userProfile } = useAuth();
  const [permissionStatus, setPermissionStatus] = useState(notificationService.getPermissionStatus());
  const [systemStatus, setSystemStatus] = useState(notificationService.getSystemStatus());
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [tokenData, setTokenData] = useState(null);

  // Atualizar status periodicamente
  useEffect(() => {
    const updateStatus = () => {
      setSystemStatus(notificationService.getSystemStatus());
      setTokenData(notificationService.getStoredTokenData());
    };
    
    updateStatus();
    const interval = setInterval(updateStatus, 3000);
    
    return () => clearInterval(interval);
  }, [permissionStatus]);

  // Configurar notificações
  const handleSetupNotifications = async () => {
    setLoading(true);
    try {
      console.log('🔔 Configurando notificações...');
      
      // 1. Solicitar permissão e obter token
      const token = await notificationService.requestPermissionAndGetToken();
      console.log('✅ Token obtido:', token.substring(0, 30) + '...');
      
      setPermissionStatus('granted');

      // 2. Registrar no backend
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
        console.log('✅ Token registrado no backend:', result);
        
        // 3. Se for cliente, inscrever na loja
        if (userProfile?.role === 'customer') {
          try {
            await apiService.subscribeToStore('E47OkrK3IcNu1Ys8gD4CA29RrHk2'); // ID fixo da loja
            console.log('✅ Inscrito para receber notificações da loja');
          } catch (subscribeError) {
            console.log('⚠️ Erro ao se inscrever na loja:', subscribeError.message);
          }
        }
        
        toast.success('🎉 Notificações configuradas!', {
          description: userProfile?.role === 'customer' 
            ? 'Você receberá atualizações dos seus pedidos'
            : 'Você pode gerenciar notificações no painel'
        });

      } catch (backendError) {
        console.error('❌ Erro ao registrar no backend:', backendError);
        
        // Fallback: salvar localmente
        await notificationService.registerToken(token);
        toast.warning('⚠️ Configuração parcial', {
          description: 'Salvo localmente. Tente novamente mais tarde.'
        });
      }

    } catch (error) {
      console.error('❌ Erro ao configurar notificações:', error);
      toast.error('❌ Erro: ' + error.message);
      setPermissionStatus('denied');
    } finally {
      setLoading(false);
    }
  };

  // Enviar notificação de teste
  const handleSendTest = async () => {
    if (!tokenData?.token) {
      toast.error('Configure as notificações primeiro');
      return;
    }

    setTestLoading(true);
    try {
      // Tentar via backend primeiro
      try {
        const result = await apiService.sendTestNotification(tokenData.token);
        console.log('✅ Teste enviado via backend:', result);
        toast.success('🔔 Notificação de teste enviada!');
      } catch (backendError) {
        // Fallback: notificação local
        console.log('⚠️ Backend indisponível, enviando teste local...');
        await notificationService.sendTestNotification(tokenData.token);
        toast.success('🔔 Teste local enviado!');
      }
    } catch (error) {
      console.error('❌ Erro no teste:', error);
      toast.error('❌ Erro ao enviar teste: ' + error.message);
    } finally {
      setTestLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (systemStatus.ready) return <CheckCircleIcon className="w-5 h-5 text-emerald-600" />;
    if (permissionStatus === 'denied') return <XCircleIcon className="w-5 h-5 text-red-600" />;
    return <AlertTriangleIcon className="w-5 h-5 text-amber-600" />;
  };

  const getStatusText = () => {
    if (systemStatus.ready) return 'Notificações Ativas';
    if (permissionStatus === 'denied') return 'Notificações Bloqueadas';
    if (!systemStatus.supported) return 'Navegador Não Suportado';
    return 'Configurar Notificações';
  };

  const getStatusDescription = () => {
    if (systemStatus.ready) {
      return userProfile?.role === 'customer' 
        ? 'Você receberá atualizações sobre seus pedidos'
        : 'Sistema pronto para enviar notificações';
    }
    if (permissionStatus === 'denied') {
      return 'Acesse as configurações do navegador para permitir';
    }
    if (!systemStatus.supported) {
      return 'Use Chrome, Firefox, Edge ou Opera';
    }
    return 'Clique para ativar notificações push';
  };

  if (compact) {
    return (
      <div className={`flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 ${className}`}>
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <div className="font-medium text-sm text-gray-900">{getStatusText()}</div>
            <div className="text-xs text-gray-600">{getStatusDescription()}</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {systemStatus.ready && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleSendTest}
              disabled={testLoading}
              className="border-emerald-300 hover:bg-emerald-50"
            >
              {testLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <TestTubeIcon className="w-3 h-3" />
              )}
            </Button>
          )}
          
          {!systemStatus.ready && systemStatus.supported && permissionStatus !== 'denied' && (
            <Button
              size="sm"
              onClick={handleSetupNotifications}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Configurando...
                </>
              ) : (
                <>
                  <SettingsIcon className="w-3 h-3 mr-1" />
                  Ativar
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className={`border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/30 ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 shadow-sm">
            <SmartphoneIcon className="w-5 h-5 text-blue-700" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Notificações Push</h3>
            <p className="text-sm text-gray-600 font-normal">
              {userProfile?.role === 'customer' 
                ? 'Receba atualizações dos seus pedidos em tempo real'
                : 'Configure notificações para seus clientes'
              }
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status Principal */}
        <div className="flex items-center justify-between p-4 bg-white/80 rounded-xl border border-gray-200">
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <div>
              <h4 className="font-semibold text-gray-900">{getStatusText()}</h4>
              <p className="text-sm text-gray-600">{getStatusDescription()}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {systemStatus.ready && (
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">
                Ativo
              </Badge>
            )}
          </div>
        </div>

        {/* Informações do Sistema */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-white/60 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Navegador</span>
              <Badge variant={systemStatus.supported ? "default" : "destructive"} className="text-xs">
                {systemStatus.supported ? 'Suportado' : 'Não Suportado'}
              </Badge>
            </div>
          </div>
          
          <div className="p-3 bg-white/60 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Permissão</span>
              <Badge 
                variant={permissionStatus === 'granted' ? "default" : permissionStatus === 'denied' ? "destructive" : "secondary"} 
                className="text-xs"
              >
                {permissionStatus === 'granted' ? 'Concedida' : 
                 permissionStatus === 'denied' ? 'Negada' : 'Pendente'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Token Info (se disponível) */}
        {tokenData && (
          <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-emerald-800">Dispositivo Registrado</span>
              <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xs text-emerald-700">
              Registrado em: {new Date(tokenData.timestamp).toLocaleString()}
            </div>
          </div>
        )}

        {/* Controles */}
        <div className="flex gap-3 pt-2">
          {!systemStatus.ready && systemStatus.supported && permissionStatus !== 'denied' && (
            <Button
              onClick={handleSetupNotifications}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 w-4 mr-2 animate-spin" />
                  Configurando...
                </>
              ) : (
                <>
                  <SettingsIcon className="w-4 h-4 mr-2" />
                  Ativar Notificações
                </>
              )}
            </Button>
          )}
          
          {systemStatus.ready && (
            <Button
              onClick={handleSendTest}
              disabled={testLoading}
              variant="outline"
              className="flex-1 border-emerald-300 hover:bg-emerald-50"
            >
              {testLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <TestTubeIcon className="w-4 h-4 mr-2" />
                  Enviar Teste
                </>
              )}
            </Button>
          )}
        </div>

        {/* Informações Adicionais */}
        {userProfile?.role === 'store' && systemStatus.ready && (
          <Alert className="border-blue-200 bg-blue-50/50">
            <InfoIcon className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Próximo passo:</strong> Acesse{' '}
              <a href="/store/push-notifications" className="underline font-medium">
                Gerenciar Notificações
              </a>{' '}
              para criar campanhas e enviar mensagens para seus clientes.
            </AlertDescription>
          </Alert>
        )}
        
        {!systemStatus.supported && (
          <Alert className="border-red-200 bg-red-50/50">
            <AlertTriangleIcon className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Este navegador não suporta notificações push. Recomendamos usar Chrome, Firefox, Edge ou Opera.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationSetupCard;