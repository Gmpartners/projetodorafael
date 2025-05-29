// src/components/WebPushDiagnostics.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bug,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Bell,
  Loader2,
  Info,
  Globe,
  Wifi,
  Key,
  Server,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import webPushService from '@/services/webPushService';
import { apiService } from '@/services/apiService';

const WebPushDiagnostics = () => {
  const [diagnostics, setDiagnostics] = useState({});
  const [running, setRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState('');

  useEffect(() => {
    runFullDiagnostics();
  }, []);

  const runFullDiagnostics = async () => {
    setRunning(true);
    const results = {};

    try {
      // 1. Browser Detection
      setCurrentStep('Detectando navegador...');
      const userAgent = navigator.userAgent;
      const isIOS = /iPhone|iPad|iPod/.test(userAgent);
      const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
      const isAndroid = /Android/.test(userAgent);
      const isChrome = /Chrome/.test(userAgent) && !/Edg/.test(userAgent);
      
      results.browser = {
        userAgent,
        isIOS,
        isSafari,
        isAndroid,
        isChrome,
        platform: navigator.platform,
        vendor: navigator.vendor
      };

      // 2. Protocol Check
      setCurrentStep('Verificando protocolo...');
      results.protocol = {
        isHTTPS: location.protocol === 'https:',
        isLocalhost: location.hostname === 'localhost',
        hostname: location.hostname,
        protocol: location.protocol,
        isSecureContext: window.isSecureContext
      };

      // 3. API Availability
      setCurrentStep('Verificando APIs...');
      results.apis = {
        serviceWorker: 'serviceWorker' in navigator,
        pushManager: 'PushManager' in window,
        notification: 'Notification' in window,
        promise: 'Promise' in window
      };

      // 4. Service Worker Status
      setCurrentStep('Verificando Service Worker...');
      let swRegistration = null;
      if (results.apis.serviceWorker) {
        try {
          swRegistration = await navigator.serviceWorker.getRegistration('/');
          results.serviceWorker = {
            registered: !!swRegistration,
            active: swRegistration?.active ? true : false,
            waiting: swRegistration?.waiting ? true : false,
            installing: swRegistration?.installing ? true : false,
            scope: swRegistration?.scope,
            scriptURL: swRegistration?.active?.scriptURL,
            state: swRegistration?.active?.state
          };
        } catch (e) {
          results.serviceWorker = { error: e.message };
        }
      }

      // 5. Notification Permission
      setCurrentStep('Verificando permissões...');
      if (results.apis.notification) {
        results.permission = {
          status: Notification.permission
        };
      }

      // 6. Backend Connection
      setCurrentStep('Testando conexão com backend...');
      try {
        const statusCheck = await apiService.testConnection();
        results.backend = {
          connected: true,
          status: statusCheck.status || 'ok'
        };
      } catch (e) {
        results.backend = {
          connected: false,
          error: e.message
        };
      }

      // 7. VAPID Key
      setCurrentStep('Verificando VAPID key...');
      try {
        const vapidResponse = await apiService.getWebPushVapidKey();
        results.vapid = {
          available: !!vapidResponse?.vapidKey,
          keyLength: vapidResponse?.vapidKey?.length || 0
        };
      } catch (e) {
        results.vapid = {
          available: false,
          error: e.message
        };
      }

      // 8. Current Subscription
      setCurrentStep('Verificando subscription...');
      if (swRegistration && results.apis.pushManager) {
        try {
          const subscription = await swRegistration.pushManager.getSubscription();
          results.subscription = {
            exists: !!subscription,
            endpoint: subscription?.endpoint ? 'exists' : null
          };
        } catch (e) {
          results.subscription = { error: e.message };
        }
      }

      // 9. Web Push Support Summary
      results.webPushSupport = calculateWebPushSupport(results);

    } catch (error) {
      console.error('Erro no diagnóstico:', error);
      results.error = error.message;
    }

    setDiagnostics(results);
    setRunning(false);
    setCurrentStep('');
  };

  const calculateWebPushSupport = (results) => {
    // iOS Safari não suporta Web Push no navegador
    if (results.browser?.isIOS && results.browser?.isSafari) {
      return {
        supported: false,
        reason: 'iOS Safari não suporta Web Push no navegador. Instale como PWA.',
        platform: 'ios-safari'
      };
    }

    // macOS Safari suporta desde 2023
    if (results.browser?.isSafari && !results.browser?.isIOS) {
      return {
        supported: true,
        reason: 'Safari no macOS suporta Web Push',
        platform: 'macos-safari'
      };
    }

    // Verificar requisitos básicos
    if (!results.protocol?.isSecureContext) {
      return {
        supported: false,
        reason: 'Contexto não seguro (HTTPS necessário)',
        platform: 'insecure'
      };
    }

    if (!results.apis?.serviceWorker || !results.apis?.pushManager) {
      return {
        supported: false,
        reason: 'APIs necessárias não disponíveis',
        platform: 'unsupported'
      };
    }

    // Android deve funcionar
    if (results.browser?.isAndroid) {
      return {
        supported: true,
        reason: 'Android suporta Web Push em navegadores modernos',
        platform: 'android'
      };
    }

    // Desktop browsers
    return {
      supported: true,
      reason: 'Navegador desktop moderno com suporte completo',
      platform: 'desktop'
    };
  };

  const attemptSubscription = async () => {
    try {
      setRunning(true);
      setCurrentStep('Inicializando Web Push...');
      
      // Primeiro inicializar
      await webPushService.initialize();
      
      setCurrentStep('Solicitando permissão...');
      
      // Depois fazer subscribe
      const subscription = await webPushService.subscribe();
      
      setCurrentStep('Sucesso!');
      alert('✅ Inscrito com sucesso no Web Push!');
      
      // Rerun diagnostics
      await runFullDiagnostics();
      
    } catch (error) {
      console.error('Erro ao inscrever:', error);
      alert(`❌ Erro: ${error.message}`);
    } finally {
      setRunning(false);
      setCurrentStep('');
    }
  };

  const sendTestPush = async () => {
    try {
      setRunning(true);
      setCurrentStep('Enviando teste...');
      
      await webPushService.sendTestNotification();
      
      alert('✅ Notificação de teste enviada!');
    } catch (error) {
      console.error('Erro ao enviar teste:', error);
      alert(`❌ Erro: ${error.message}`);
    } finally {
      setRunning(false);
      setCurrentStep('');
    }
  };

  const getStatusIcon = (condition) => {
    if (condition === true) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (condition === false) return <XCircle className="h-4 w-4 text-red-600" />;
    return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
  };

  return (
    <Card className="border-2 border-purple-300 shadow-lg mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-purple-100">
              <Bug className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900">Diagnóstico Completo Web Push v7.0</h3>
              <p className="text-sm text-zinc-600">Análise detalhada do sistema</p>
            </div>
          </div>
          
          <Button
            size="sm"
            variant="outline"
            onClick={runFullDiagnostics}
            disabled={running}
            className="h-10 px-4"
          >
            {running ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>

        {running && currentStep && (
          <Alert className="mb-4 border-blue-300 bg-blue-50">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <AlertDescription className="ml-2 text-blue-800">
              {currentStep}
            </AlertDescription>
          </Alert>
        )}

        {/* Status Principal */}
        {diagnostics.webPushSupport && (
          <Alert className={cn(
            "mb-6",
            diagnostics.webPushSupport.supported 
              ? "border-green-300 bg-green-50" 
              : "border-red-300 bg-red-50"
          )}>
            {getStatusIcon(diagnostics.webPushSupport.supported)}
            <AlertDescription className="ml-2">
              <strong className={diagnostics.webPushSupport.supported ? "text-green-800" : "text-red-800"}>
                {diagnostics.webPushSupport.supported ? '✅ Web Push Suportado' : '❌ Web Push Não Suportado'}
              </strong>
              <p className="text-sm mt-1">{diagnostics.webPushSupport.reason}</p>
            </AlertDescription>
          </Alert>
        )}

        {/* Detalhes */}
        <div className="space-y-4">
          {/* Browser */}
          {diagnostics.browser && (
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center">
                <Globe className="h-4 w-4 mr-2" />
                Navegador
              </h4>
              <div className="space-y-1 text-sm">
                <div>Plataforma: {diagnostics.browser.platform}</div>
                <div>Chrome: {diagnostics.browser.isChrome ? '✅' : '❌'}</div>
                <div>Safari: {diagnostics.browser.isSafari ? '✅' : '❌'}</div>
                <div>iOS: {diagnostics.browser.isIOS ? '✅' : '❌'}</div>
                <div>Android: {diagnostics.browser.isAndroid ? '✅' : '❌'}</div>
              </div>
            </div>
          )}

          {/* Protocol */}
          {diagnostics.protocol && (
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Segurança
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>HTTPS</span>
                  {getStatusIcon(diagnostics.protocol.isHTTPS)}
                </div>
                <div className="flex justify-between">
                  <span>Contexto Seguro</span>
                  {getStatusIcon(diagnostics.protocol.isSecureContext)}
                </div>
                <div>Host: {diagnostics.protocol.hostname}</div>
              </div>
            </div>
          )}

          {/* APIs */}
          {diagnostics.apis && (
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center">
                <Server className="h-4 w-4 mr-2" />
                APIs do Navegador
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Service Worker</span>
                  {getStatusIcon(diagnostics.apis.serviceWorker)}
                </div>
                <div className="flex justify-between">
                  <span>Push Manager</span>
                  {getStatusIcon(diagnostics.apis.pushManager)}
                </div>
                <div className="flex justify-between">
                  <span>Notification API</span>
                  {getStatusIcon(diagnostics.apis.notification)}
                </div>
              </div>
            </div>
          )}

          {/* Backend & VAPID */}
          <div className="grid grid-cols-2 gap-4">
            {diagnostics.backend && (
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2 flex items-center">
                  <Wifi className="h-4 w-4 mr-2" />
                  Backend
                </h4>
                <div className="flex justify-between text-sm">
                  <span>Conectado</span>
                  {getStatusIcon(diagnostics.backend.connected)}
                </div>
                {diagnostics.backend.error && (
                  <div className="text-xs text-red-600 mt-1">{diagnostics.backend.error}</div>
                )}
              </div>
            )}

            {diagnostics.vapid && (
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2 flex items-center">
                  <Key className="h-4 w-4 mr-2" />
                  VAPID Key
                </h4>
                <div className="flex justify-between text-sm">
                  <span>Disponível</span>
                  {getStatusIcon(diagnostics.vapid.available)}
                </div>
                {diagnostics.vapid.error && (
                  <div className="text-xs text-red-600 mt-1">{diagnostics.vapid.error}</div>
                )}
              </div>
            )}
          </div>

          {/* Service Worker & Permission */}
          {diagnostics.serviceWorker && (
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">Service Worker</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Registrado</span>
                  {getStatusIcon(diagnostics.serviceWorker.registered)}
                </div>
                <div className="flex justify-between">
                  <span>Ativo</span>
                  {getStatusIcon(diagnostics.serviceWorker.active)}
                </div>
                {diagnostics.serviceWorker.scriptURL && (
                  <div className="text-xs truncate">Script: {diagnostics.serviceWorker.scriptURL}</div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          {diagnostics.webPushSupport?.supported && (
            <div className="flex gap-2 mt-6">
              <Button
                onClick={attemptSubscription}
                disabled={running || diagnostics.subscription?.exists}
                className="flex-1 h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Bell className="h-4 w-4 mr-2" />
                Ativar Web Push
              </Button>
              
              <Button
                onClick={sendTestPush}
                disabled={running || !diagnostics.subscription?.exists}
                variant="outline"
                className="flex-1 h-10 px-4"
              >
                Enviar Teste
              </Button>
            </div>
          )}
        </div>

        {/* Info about Safari */}
        <div className="mt-6 space-y-2">
          <Alert className="border-blue-300 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="ml-2 text-blue-800 text-sm">
              <strong>Sobre Safari e Web Push:</strong>
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li><strong>Safari macOS:</strong> ✅ Suporta Web Push desde 2023</li>
                <li><strong>Safari iOS:</strong> ❌ NÃO suporta no navegador, apenas em PWAs instaladas</li>
                <li><strong>Chrome/Firefox/Edge:</strong> ✅ Suportam em todas as plataformas</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
};

export default WebPushDiagnostics;