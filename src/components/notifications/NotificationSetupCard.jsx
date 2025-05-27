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
  InfoIcon,
  RefreshCwIcon,
  TrashIcon
} from 'lucide-react';

const NotificationSetupCard = ({ className = '', compact = false }) => {
  const { userProfile } = useAuth();
  const [permissionStatus, setPermissionStatus] = useState('default');
  const [systemStatus, setSystemStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState(null);

  // Atualizar status periodicamente
  useEffect(() => {
    const updateStatus = async () => {
      try {
        const status = await notificationService.getSystemStatus();
        setSystemStatus(status);
        setPermissionStatus(status.permission);
        
        // Pegar dados da subscription local
        const storedData = notificationService.getStoredSubscriptionData();
        setSubscriptionData(storedData);
      } catch (error) {
        console.error('Erro ao atualizar status:', error);
      }
    };
    
    updateStatus();
    const interval = setInterval(updateStatus, 3000);
    
    return () => clearInterval(interval);
  }, []);

  // Configurar notificações Web Push
  const handleSetupNotifications = async () => {
    setLoading(true);
    try {
      console.log('🔔 Configurando Web Push...');
      
      // Solicitar permissão e fazer subscribe
      await notificationService.requestPermissionAndSubscribe();
      
      toast.success('🎉 Notificações ativadas!', {
        description: 'Você receberá notificações Web Push'
      });

      // Atualizar status
      const status = await notificationService.getSystemStatus();
      setSystemStatus(status);
      setPermissionStatus(status.permission);

    } catch (error) {
      console.error('❌ Erro ao configurar notificações:', error);
      toast.error('❌ Erro: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Enviar notificação de teste
  const handleSendTest = async () => {
    setTestLoading(true);
    try {
      await notificationService.sendTestNotification();
      toast.success('🔔 Notificação de teste enviada!');
    } catch (error) {
      console.error('❌ Erro no teste:', error);
      toast.error('❌ Erro ao enviar teste: ' + error.message);
    } finally {
      setTestLoading(false);
    }
  };

  // Cancelar inscrição
  const handleUnsubscribe = async () => {
    setLoading(true);
    try {
      await notificationService.unsubscribe();
      toast.success('Notificações desativadas');
      
      // Atualizar status
      const status = await notificationService.getSystemStatus();
      setSystemStatus(status);
      setPermissionStatus(status.permission);
      setSubscriptionData(null);
    } catch (error) {
      console.error('❌ Erro ao cancelar inscrição:', error);
      toast.error('Erro ao desativar notificações');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (systemStatus?.isSubscribed) return <CheckCircleIcon className="w-5 h-5 text-emerald-600" />;
    if (permissionStatus === 'denied') return <XCircleIcon className="w-5 h-5 text-red-600" />;
    return <AlertTriangleIcon className="w-5 h-5 text-amber-600" />;
  };

  const getStatusText = () => {
    if (systemStatus?.isSubscribed) return 'Notificações Ativas';
    if (permissionStatus === 'denied') return 'Notificações Bloqueadas';
    if (!systemStatus?.supported) return 'Navegador Não Suportado';
    return 'Configurar Notificações';
  };

  const getStatusDescription = () => {
    if (systemStatus?.isSubscribed) {
      return 'Você receberá notificações Web Push';
    }
    if (permissionStatus === 'denied') {
      return 'Acesse as configurações do navegador para permitir';
    }
    if (!systemStatus?.supported) {
      return 'Use Chrome, Firefox, Edge ou Safari';
    }
    return 'Clique para ativar notificações push';
  };

  if (!systemStatus) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

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
          {systemStatus.isSubscribed && (
            <>
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
              
              <Button
                size="sm"
                variant="outline"
                onClick={handleUnsubscribe}
                disabled={loading}
                className="border-red-300 hover:bg-red-50"
              >
                <XCircleIcon className="w-3 h-3" />
              </Button>
            </>
          )}
          
          {!systemStatus.isSubscribed && systemStatus.supported && permissionStatus !== 'denied' && (
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
            <h3 className="text-lg font-bold text-gray-900">Notificações Web Push</h3>
            <p className="text-sm text-gray-600 font-normal">
              Sistema nativo de notificações sem FCM
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
            {systemStatus.isSubscribed && (
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

        {/* Subscription Info */}
        {subscriptionData && (
          <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-emerald-800">Dispositivo Registrado</span>
              <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xs text-emerald-700">
              Registrado em: {new Date(subscriptionData.timestamp).toLocaleString()}
            </div>
          </div>
        )}

        {/* Controles */}
        <div className="flex gap-3 pt-2">
          {!systemStatus.isSubscribed && systemStatus.supported && permissionStatus !== 'denied' && (
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
          
          {systemStatus.isSubscribed && (
            <>
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
              
              <Button
                onClick={handleUnsubscribe}
                disabled={loading}
                variant="outline"
                className="border-red-300 hover:bg-red-50"
              >
                <XCircleIcon className="w-4 h-4 mr-2" />
                Desativar
              </Button>
            </>
          )}
        </div>

        {/* Avisos */}
        {!systemStatus.supported && (
          <Alert className="border-red-200 bg-red-50/50">
            <AlertTriangleIcon className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Este navegador não suporta Web Push. Use Chrome, Firefox, Edge ou Safari.
            </AlertDescription>
          </Alert>
        )}
        
        {permissionStatus === 'denied' && (
          <Alert className="border-red-200 bg-red-50/50">
            <XCircleIcon className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Notificações bloqueadas. Acesse as configurações do navegador para permitir.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationSetupCard;