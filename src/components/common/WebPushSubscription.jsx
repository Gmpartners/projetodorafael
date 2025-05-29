import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  BellIcon, 
  BellOffIcon, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Settings,
  Sparkles
} from 'lucide-react';
import webPushService from '@/services/webPushService';
import { toast } from 'sonner';

const WebPushSubscription = ({ 
  userType = 'customer', 
  showSettings = true, 
  compact = false,
  autoInit = true 
}) => {
  const [status, setStatus] = useState({
    isSupported: false,
    isSubscribed: false,
    permission: 'default',
    loading: false,
    error: null
  });

  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (autoInit) {
      checkSubscriptionStatus();
    }
  }, [autoInit]);

  const checkSubscriptionStatus = async () => {
    try {
      setStatus(prev => ({ ...prev, loading: true }));
      
      const subscriptionStatus = await webPushService.checkSubscription();
      
      setStatus({
        isSupported: subscriptionStatus.isSupported,
        isSubscribed: subscriptionStatus.isSubscribed,
        permission: subscriptionStatus.permission,
        loading: false,
        error: null,
        swActive: subscriptionStatus.hasActiveServiceWorker,
        features: subscriptionStatus.features
      });
      
    } catch (error) {
      console.error('Erro ao verificar status da subscription:', error);
      setStatus(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    }
  };

  const handleSubscribe = async () => {
    if (status.loading) return;
    
    try {
      setStatus(prev => ({ ...prev, loading: true }));
      
      // Inicializar Web Push Service se necessário
      const initialized = await webPushService.initialize();
      if (!initialized) {
        throw new Error('Falha ao inicializar serviço de notificações');
      }
      
      // Criar subscription
      const subscription = await webPushService.subscribe();
      
      if (subscription) {
        setStatus(prev => ({
          ...prev,
          isSubscribed: true,
          permission: 'granted',
          loading: false,
          error: null
        }));
        
        toast.success('🔔 Notificações ativadas!', {
          description: 'Você receberá notificações sobre atualizações importantes.'
        });
        
        // Enviar notificação de teste opcional
        if (userType === 'store') {
          setTimeout(() => {
            webPushService.sendTestNotification(
              'https://projeto-rafael-53f73.web.app/store/push-notifications',
              {
                title: '🎉 Notificações ativas!',
                body: 'Sistema configurado com sucesso!'
              }
            ).catch(e => console.log('Teste opcional falhou:', e));
          }, 2000);
        }
      }
      
    } catch (error) {
      console.error('Erro ao se inscrever:', error);
      
      setStatus(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
      
      if (error.message.includes('denied')) {
        toast.error('❌ Permissão negada', {
          description: 'Você precisa permitir notificações no navegador.'
        });
      } else {
        toast.error('❌ Erro ao ativar notificações', {
          description: error.message
        });
      }
    }
  };

  const handleUnsubscribe = async () => {
    if (status.loading) return;
    
    try {
      setStatus(prev => ({ ...prev, loading: true }));
      
      await webPushService.unsubscribe();
      
      setStatus(prev => ({
        ...prev,
        isSubscribed: false,
        loading: false,
        error: null
      }));
      
      toast.success('🔕 Notificações desativadas', {
        description: 'Você não receberá mais notificações.'
      });
      
    } catch (error) {
      console.error('Erro ao cancelar subscription:', error);
      setStatus(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
      
      toast.error('❌ Erro ao desativar notificações', {
        description: error.message
      });
    }
  };

  const handleTestNotification = async () => {
    try {
      const testUrl = userType === 'store' 
        ? 'https://projeto-rafael-53f73.web.app/store/push-notifications'
        : 'https://projeto-rafael-53f73.web.app/customer/dashboard';
        
      await webPushService.sendTestNotification(testUrl, {
        title: '🧪 Teste de notificação',
        body: 'Se você está vendo isso, as notificações estão funcionando!'
      });
      
      toast.success('🧪 Teste enviado!', {
        description: 'Verifique se recebeu a notificação'
      });
      
    } catch (error) {
      console.error('Erro no teste:', error);
      toast.error('❌ Erro no teste', {
        description: error.message
      });
    }
  };

  // Não mostrar se não suportado - remover aviso que confunde usuário
  if (!status.isSupported) {
    return null;
  }

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <Badge 
          variant={status.isSubscribed ? "default" : "secondary"}
          className="flex items-center space-x-1"
        >
          {status.isSubscribed ? (
            <BellIcon className="h-3 w-3" />
          ) : (
            <BellOffIcon className="h-3 w-3" />
          )}
          <span>{status.isSubscribed ? 'Ativo' : 'Inativo'}</span>
        </Badge>
        
        <Button
          size="sm"
          variant="outline"
          onClick={status.isSubscribed ? handleUnsubscribe : handleSubscribe}
          disabled={status.loading}
          className="h-10 px-4"
        >
          {status.loading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : status.isSubscribed ? (
            'Desativar'
          ) : (
            'Ativar'
          )}
        </Button>
      </div>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-xl shadow-md ${
              status.isSubscribed 
                ? 'bg-gradient-to-br from-green-100 to-green-200' 
                : 'bg-gradient-to-br from-gray-100 to-gray-200'
            }`}>
              {status.isSubscribed ? (
                <BellIcon className="h-6 w-6 text-green-700" />
              ) : (
                <BellOffIcon className="h-6 w-6 text-gray-600" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900 flex items-center">
                Notificações
                {status.features?.urlPersonalizada && (
                  <Sparkles className="h-4 w-4 ml-2 text-purple-600" />
                )}
              </h3>
              <p className="text-sm text-zinc-600">
                {status.isSubscribed 
                  ? 'Receba atualizações em tempo real' 
                  : 'Ative para receber notificações importantes'
                }
              </p>
            </div>
          </div>
          
          <Badge 
            variant={status.isSubscribed ? "default" : "secondary"}
            className="flex items-center space-x-1"
          >
            {status.isSubscribed ? (
              <CheckCircle className="h-3 w-3" />
            ) : (
              <AlertCircle className="h-3 w-3" />
            )}
            <span>{status.isSubscribed ? 'Ativo' : 'Inativo'}</span>
          </Badge>
        </div>

        {status.error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">❌ {status.error}</p>
          </div>
        )}

        {/* Benefícios das notificações */}
        {!status.isSubscribed && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-blue-800 mb-2">✨ Benefícios:</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">🔔 Alertas instantâneos</Badge>
              <Badge variant="outline" className="text-xs">📱 Funciona offline</Badge>
              <Badge variant="outline" className="text-xs">🎯 Informações importantes</Badge>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            onClick={status.isSubscribed ? handleUnsubscribe : handleSubscribe}
            disabled={status.loading}
            className={`flex-1 h-10 px-4 ${
              status.isSubscribed 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {status.loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {status.isSubscribed ? 'Desativando...' : 'Ativando...'}
              </>
            ) : (
              <>
                {status.isSubscribed ? (
                  <>
                    <BellOffIcon className="h-4 w-4 mr-2" />
                    Desativar Notificações
                  </>
                ) : (
                  <>
                    <BellIcon className="h-4 w-4 mr-2" />
                    Ativar Notificações
                  </>
                )}
              </>
            )}
          </Button>

          {status.isSubscribed && (
            <Button
              variant="outline"
              onClick={handleTestNotification}
              disabled={status.loading}
              className="h-10 px-4"
            >
              🧪 Testar
            </Button>
          )}

          {showSettings && (
            <Button
              variant="outline"
              onClick={() => setShowDetails(!showDetails)}
              disabled={status.loading}
              className="h-10 px-4"
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Detalhes técnicos */}
        {showDetails && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
            <h4 className="text-sm font-medium text-gray-800 mb-2">Detalhes:</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <div>Permissão: <Badge variant="outline">{status.permission}</Badge></div>
              <div>Service Worker: <Badge variant="outline">{status.swActive ? 'Ativo' : 'Inativo'}</Badge></div>
              <div>Subscription: <Badge variant="outline">{status.isSubscribed ? 'Sim' : 'Não'}</Badge></div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WebPushSubscription;