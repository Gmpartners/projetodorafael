import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  SmartphoneIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertTriangleIcon,
  Settings,
  TestTubeIcon,
  Loader2
} from 'lucide-react';
import { notificationService } from '@/services/notificationService';
import { apiService } from '@/services/apiService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import WebPushDiagnostics from '@/components/WebPushDiagnostics';
import WebPushDirectTest from '@/components/WebPushDirectTest';

const DeviceConfiguration = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [systemStatus, setSystemStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        setError(null);
        const status = await notificationService.getSystemStatus();
        setSystemStatus(status);
      } catch (error) {
        console.error('❌ Erro ao verificar status:', error);
        setError('Erro ao verificar status do sistema');
        setSystemStatus({
          supported: false,
          permission: 'default',
          isSubscribed: false,
          ready: false
        });
      }
    };
    checkStatus();
  }, []);

  const handleRequestPermission = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔔 Iniciando configuração Web Push...');
      
      // Verificar se o navegador suporta
      if (!('serviceWorker' in navigator)) {
        throw new Error('Service Workers não são suportados neste navegador');
      }

      if (!('PushManager' in window)) {
        throw new Error('Web Push não é suportado neste navegador');
      }

      // Primeiro inicializar o sistema
      await notificationService.initializeNotificationSystem('store');
      
      // Depois solicitar permissão e fazer subscribe
      const subscription = await notificationService.requestPermissionAndSubscribe();
      console.log('✅ Subscription criada:', subscription);
      
      // Tentar inscrever na loja (não crítico se falhar)
      if (userProfile?.id) {
        try {
          await apiService.subscribeToStoreWebPush(userProfile.id);
          console.log('✅ Inscrito na loja para receber notificações');
        } catch (subscribeError) {
          console.log('⚠️ Erro ao se inscrever na loja (não crítico):', subscribeError.message);
          // Não é crítico se isso falhar
        }
      }
      
      toast.success('🎉 Notificações Web Push configuradas!', {
        description: 'Você receberá notificações push em tempo real'
      });

      // Atualizar status
      const newStatus = await notificationService.getSystemStatus();
      setSystemStatus(newStatus);

    } catch (error) {
      console.error('❌ Erro ao configurar notificações:', error);
      setError(error.message);
      toast.error('❌ Erro ao configurar notificações: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestNotification = async () => {
    if (!systemStatus?.ready) {
      toast.error('Configure as notificações primeiro');
      return;
    }

    setTestLoading(true);
    setError(null);
    
    try {
      console.log('🧪 Enviando notificação de teste Web Push...');

      const result = await notificationService.sendTestNotification();
      console.log('✅ Notificação enviada:', result);
      
      toast.success('🔔 Notificação de teste enviada!', {
        description: 'Verifique sua área de notificações'
      });

    } catch (error) {
      console.error('❌ Erro ao enviar teste:', error);
      setError('Erro ao enviar notificação de teste: ' + error.message);
      toast.error('❌ Erro ao enviar notificação: ' + error.message);
    } finally {
      setTestLoading(false);
    }
  };

  const getPermissionIcon = () => {
    if (!systemStatus) return <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />;
    
    switch (systemStatus.permission) {
      case 'granted':
        return <CheckCircleIcon className="h-5 w-5 text-emerald-600" />;
      case 'denied':
        return <XCircleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <AlertTriangleIcon className="h-5 w-5 text-amber-600" />;
    }
  };

  const getPermissionText = () => {
    if (!systemStatus) return 'Verificando...';
    
    switch (systemStatus.permission) {
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
    <div className="space-y-6">
      {/* TESTE DIRETO DE NOTIFICAÇÃO */}
      <WebPushDirectTest />
      
      {/* DIAGNÓSTICO COMPLETO */}
      <WebPushDiagnostics />
      
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 shadow-lg">
              <SmartphoneIcon className="h-6 w-6 text-blue-700" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-zinc-900">Configuração Web Push</h3>
              <p className="text-zinc-600">Configure notificações push nativas para este navegador</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Error Alert */}
            {error && (
              <Alert className="border-red-200 bg-red-50/50">
                <AlertTriangleIcon className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Erro:</strong> {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Status Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-zinc-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-600">Suporte do Navegador</span>
                  <span className={cn("text-sm font-semibold", getStatusColor(systemStatus?.supported))}>
                    {systemStatus?.supported ? '✅ Suportado' : '❌ Não suportado'}
                  </span>
                </div>
              </div>
              
              <div className="p-3 bg-zinc-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-600">Service Worker</span>
                  <span className={cn("text-sm font-semibold", getStatusColor(systemStatus?.hasActiveServiceWorker))}>
                    {systemStatus?.hasActiveServiceWorker ? '✅ Ativo' : '❌ Inativo'}
                  </span>
                </div>
              </div>
              
              <div className="p-3 bg-zinc-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-600">Permissão</span>
                  <span className={cn("text-sm font-semibold", getStatusColor(systemStatus?.permission === 'granted'))}>
                    {systemStatus?.permission === 'granted' ? '✅ Concedida' : '❌ Negada'}
                  </span>
                </div>
              </div>
              
              <div className="p-3 bg-zinc-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-600">Subscription</span>
                  <span className={cn("text-sm font-semibold", getStatusColor(systemStatus?.isSubscribed))}>
                    {systemStatus?.isSubscribed ? '✅ Ativo' : '❌ Inativo'}
                  </span>
                </div>
              </div>
            </div>

            {/* Main Status */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-zinc-50 to-blue-50 rounded-xl border border-zinc-200">
              <div className="flex items-center space-x-3">
                {getPermissionIcon()}
                <div>
                  <h4 className="font-semibold text-zinc-900">{getPermissionText()}</h4>
                  <p className="text-sm text-zinc-600">
                    {systemStatus?.ready 
                      ? 'Sistema pronto para receber notificações'
                      : 'Configure o sistema para receber notificações'
                    }
                  </p>
                </div>
              </div>
              
              {systemStatus?.permission !== 'granted' && systemStatus?.supported && (
                <Button 
                  onClick={handleRequestPermission}
                  disabled={loading}
                  className="h-10 px-4 bg-blue-600 hover:bg-blue-700"
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

            {/* Test Button */}
            {systemStatus?.ready && (
              <div className="pt-4 border-t border-zinc-200">
                <Button 
                  onClick={handleSendTestNotification}
                  disabled={testLoading}
                  variant="outline"
                  className="w-full h-10 px-4 border-emerald-300 hover:bg-emerald-50"
                >
                  {testLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <TestTubeIcon className="h-4 w-4 mr-2" />
                      Enviar Teste Web Push via Backend
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Info Alerts */}
            <Alert className="border-blue-200 bg-blue-50/50">
              <AlertTriangleIcon className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Sistema Web Push Nativo:</strong> As notificações usam o padrão Web Push sem dependência do Firebase. 
                Compatível com Chrome, Firefox, Edge e Safari (macOS).
              </AlertDescription>
            </Alert>

            {!systemStatus?.supported && (
              <Alert className="border-red-200 bg-red-50/50">
                <AlertTriangleIcon className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  Este navegador não suporta Web Push. Use o diagnóstico acima para ver os detalhes.
                </AlertDescription>
              </Alert>
            )}

            {/* Debug Info */}
            {systemStatus && (
              <details className="text-xs text-zinc-500">
                <summary className="cursor-pointer hover:text-zinc-700">Debug Info</summary>
                <pre className="mt-2 p-2 bg-zinc-100 rounded text-xs overflow-auto">
                  {JSON.stringify(systemStatus, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeviceConfiguration;