// src/components/debug/NotificationDebugPanel.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';
import { checkServiceWorkerStatus, updateServiceWorker } from '@/services/swRegistration';
import { 
  BellIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  AlertTriangleIcon,
  RefreshCcwIcon,
  TestTubeIcon,
  InfoIcon,
  SettingsIcon,
  Loader2
} from 'lucide-react';

const NotificationDebugPanel = ({ className = '' }) => {
  const {
    isSupported,
    permission,
    hasToken,
    isReady,
    fcmToken,
    swStatus,
    loading,
    requestPermission,
    sendTestNotification,
    getDetailedStats
  } = useNotifications();

  const [stats, setStats] = useState(null);
  const [testLoading, setTestLoading] = useState(false);
  const [swUpdateLoading, setSwUpdateLoading] = useState(false);

  // Atualizar estatísticas
  const refreshStats = () => {
    const detailedStats = getDetailedStats();
    setStats(detailedStats);
  };

  useEffect(() => {
    refreshStats();
  }, [isReady, fcmToken]);

  const handleRequestPermission = async () => {
    try {
      const result = await requestPermission();
      console.log('🔔 Resultado da permissão:', result);
      refreshStats();
    } catch (error) {
      console.error('❌ Erro ao solicitar permissão:', error);
    }
  };

  const handleSendTest = async () => {
    setTestLoading(true);
    try {
      const result = await sendTestNotification();
      console.log('🧪 Resultado do teste:', result);
    } catch (error) {
      console.error('❌ Erro no teste:', error);
    } finally {
      setTestLoading(false);
    }
  };

  const handleUpdateSW = async () => {
    setSwUpdateLoading(true);
    try {
      await updateServiceWorker();
      // Recarregar status após update
      setTimeout(refreshStats, 1000);
    } catch (error) {
      console.error('❌ Erro ao atualizar SW:', error);
    } finally {
      setSwUpdateLoading(false);
    }
  };

  const getStatusBadge = (status, label) => {
    const config = {
      true: { color: 'bg-emerald-500', icon: CheckCircleIcon, text: 'text-white' },
      false: { color: 'bg-red-500', icon: XCircleIcon, text: 'text-white' },
      'granted': { color: 'bg-emerald-500', icon: CheckCircleIcon, text: 'text-white' },
      'denied': { color: 'bg-red-500', icon: XCircleIcon, text: 'text-white' },
      'default': { color: 'bg-amber-500', icon: AlertTriangleIcon, text: 'text-white' }
    };
    
    const statusConfig = config[status] || config.false;
    const IconComponent = statusConfig.icon;
    
    return (
      <Badge className={`inline-flex items-center gap-1.5 px-3 py-1 ${statusConfig.color} ${statusConfig.text}`}>
        <IconComponent className="w-3 h-3" />
        {label}
      </Badge>
    );
  };

  return (
    <Card className={`border-2 border-dashed border-blue-300 bg-blue-50/30 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="p-1 rounded bg-blue-100">
              <BellIcon className="w-4 h-4 text-blue-600" />
            </div>
            Debug de Notificações
          </CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={refreshStats}
              className="border-blue-300"
            >
              <RefreshCcwIcon className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleUpdateSW}
              disabled={swUpdateLoading}
              className="border-blue-300"
            >
              {swUpdateLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <SettingsIcon className="w-3 h-3" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status Geral */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Suporte:</span>
              {getStatusBadge(isSupported, isSupported ? 'Sim' : 'Não')}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Permissão:</span>
              {getStatusBadge(permission, permission)}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Token:</span>
              {getStatusBadge(hasToken, hasToken ? 'Sim' : 'Não')}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">SW Ativo:</span>
              {getStatusBadge(swStatus.active, swStatus.active ? 'Sim' : 'Não')}
            </div>
          </div>
        </div>

        {/* Status Consolidado */}
        <div className="p-3 rounded-lg bg-white/80 border">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-700">Sistema:</span>
            {getStatusBadge(isReady, isReady ? 'PRONTO' : 'CONFIGURAR')}
          </div>
        </div>

        {/* Informações do Token */}
        {fcmToken && (
          <div className="p-3 rounded-lg bg-white/80 border">
            <div className="text-xs">
              <div className="font-semibold text-gray-700 mb-1">Token FCM:</div>
              <div className="font-mono text-gray-600 break-all">
                {fcmToken.substring(0, 30)}...
              </div>
            </div>
          </div>
        )}

        {/* Service Worker Status */}
        <div className="p-3 rounded-lg bg-white/80 border">
          <div className="text-xs space-y-1">
            <div className="font-semibold text-gray-700 mb-2">Service Worker:</div>
            <div className="grid grid-cols-2 gap-2">
              <div>Suportado: {swStatus.supported ? '✅' : '❌'}</div>
              <div>Registrado: {swStatus.registered ? '✅' : '❌'}</div>
            </div>
            {swStatus.scope && (
              <div className="mt-2 text-gray-500">
                Scope: {swStatus.scope}
              </div>
            )}
          </div>
        </div>

        {/* Estatísticas Detalhadas */}
        {stats && (
          <div className="p-3 rounded-lg bg-white/80 border">
            <div className="text-xs">
              <div className="font-semibold text-gray-700 mb-2">Estatísticas:</div>
              <div className="space-y-1">
                <div>Navegador: {stats.device.browser}</div>
                <div>Plataforma: {stats.device.platform}</div>
                <div>Online: {stats.device.onLine ? '✅' : '❌'}</div>
                <div>Idioma: {stats.device.language}</div>
              </div>
            </div>
          </div>
        )}

        {/* Controles */}
        <div className="flex gap-2">
          {!isReady && (
            <Button
              size="sm"
              onClick={handleRequestPermission}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Configurando...
                </>
              ) : (
                <>
                  <SettingsIcon className="w-3 h-3 mr-1" />
                  Configurar
                </>
              )}
            </Button>
          )}
          
          {isReady && (
            <Button
              size="sm"
              onClick={handleSendTest}
              disabled={testLoading}
              variant="outline"
              className="flex-1 border-emerald-300 hover:bg-emerald-50"
            >
              {testLoading ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <TestTubeIcon className="w-3 h-3 mr-1" />
                  Teste
                </>
              )}
            </Button>
          )}
        </div>

        {/* Info sobre LocalStorage */}
        <div className="text-xs text-gray-500 p-2 bg-gray-100/50 rounded">
          <InfoIcon className="w-3 h-3 inline mr-1" />
          SW Registrado: {localStorage.getItem('sw_registered') || 'false'}
          {localStorage.getItem('sw_error') && (
            <div className="mt-1 text-red-600">
              Erro: {localStorage.getItem('sw_error')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationDebugPanel;