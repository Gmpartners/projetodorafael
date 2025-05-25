// src/components/NotificationTester.jsx
import React from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BellIcon, 
  CheckCircleIcon, 
  AlertTriangleIcon,
  SmartphoneIcon,
  TestTubeIcon,
  RefreshCcwIcon,
  TrashIcon,
  Loader2,
  SendIcon
} from 'lucide-react';

const NotificationTester = () => {
  const {
    isInitialized,
    isLoading,
    error,
    systemStatus,
    registeredTokens,
    isReady,
    isSupported,
    hasPermission,
    hasTokens,
    initialize,
    requestPermission,
    sendTestNotification,
    refreshTokens,
    clearData,
    sendImmediateNotification
  } = useNotifications();

  // Inicializar automaticamente
  React.useEffect(() => {
    if (!isInitialized && isSupported) {
      initialize();
    }
  }, [isInitialized, isSupported, initialize]);

  const handleSendQuickTest = async () => {
    try {
      await sendImmediateNotification({
        title: '🚀 Teste Rápido',
        body: 'Esta é uma notificação de teste enviada via backend!',
        target: 'subscribers',
        data: {
          type: 'test',
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Erro no teste rápido:', error);
    }
  };

  if (!isSupported) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <AlertTriangleIcon className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Navegador Não Suportado</h3>
          <p className="text-sm text-gray-600">
            Este navegador não suporta notificações push. 
            Use Chrome, Firefox, Edge ou Safari.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellIcon className="h-5 w-5" />
            Testador de Notificações Push
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Status do Sistema */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm">Suporte</span>
              <Badge variant={isSupported ? "default" : "destructive"}>
                {isSupported ? "✅ Sim" : "❌ Não"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm">Permissão</span>
              <Badge variant={hasPermission ? "default" : "secondary"}>
                {hasPermission ? "✅ Sim" : "⚠️ Não"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm">Tokens</span>
              <Badge variant={hasTokens ? "default" : "secondary"}>
                {registeredTokens.length}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm">Status</span>
              <Badge variant={isReady ? "default" : "secondary"}>
                {isReady ? "✅ Pronto" : "⚠️ Config"}
              </Badge>
            </div>
          </div>

          {/* Mensagem de Erro */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangleIcon className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Tokens Registrados */}
          {registeredTokens.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Tokens Registrados:</h4>
              {registeredTokens.map((token, index) => (
                <div key={token.id || index} className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-xs space-y-1">
                    <div><strong>Device:</strong> {token.deviceInfo?.browser || 'Web'}</div>
                    <div><strong>Status:</strong> {token.isValid ? '✅ Válido' : '❌ Inválido'}</div>
                    <div><strong>Token:</strong> {token.token ? token.token.substring(0, 30) + '...' : 'N/A'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Ações */}
          <div className="space-y-3">
            {!hasPermission && (
              <Button 
                onClick={requestPermission} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <SmartphoneIcon className="h-4 w-4 mr-2" />
                )}
                Ativar Notificações
              </Button>
            )}
            
            {hasPermission && (
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={() => sendTestNotification(true)} 
                  disabled={isLoading || !hasTokens}
                  variant="outline"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <TestTubeIcon className="h-4 w-4 mr-2" />
                  )}
                  Teste Backend
                </Button>
                
                <Button 
                  onClick={() => sendTestNotification(false)} 
                  disabled={isLoading}
                  variant="outline"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <TestTubeIcon className="h-4 w-4 mr-2" />
                  )}
                  Teste Local
                </Button>
              </div>
            )}
            
            {hasTokens && (
              <Button 
                onClick={handleSendQuickTest} 
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <SendIcon className="h-4 w-4 mr-2" />
                )}
                Enviar Teste Rápido
              </Button>
            )}
            
            <div className="flex gap-2">
              <Button 
                onClick={refreshTokens} 
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <RefreshCcwIcon className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              
              <Button 
                onClick={clearData} 
                variant="outline"
                size="sm"
                className="border-red-300 hover:bg-red-50"
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Status Ready */}
          {isReady && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Sistema Pronto!</strong> As notificações push estão configuradas e funcionando.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationTester;