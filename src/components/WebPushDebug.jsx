// src/components/WebPushDebug.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bug,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Smartphone,
  Chrome,
  Monitor,
  Apple,
  RefreshCw,
  Bell,
  Loader2,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import webPushService from '@/services/webPushService';
import { apiService } from '@/services/apiService';

const WebPushDebug = () => {
  const [debugInfo, setDebugInfo] = useState({});
  const [testing, setTesting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    checkAllFeatures();
  }, []);

  const checkAllFeatures = async () => {
    setRefreshing(true);
    try {
      // 1. Detecção básica
      const userAgent = navigator.userAgent;
      const isIOS = /iPhone|iPad|iPod/.test(userAgent);
      const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
      const isIOSSafari = isIOS && isSafari;
      const isAndroid = /Android/.test(userAgent);
      const isChrome = /Chrome/.test(userAgent) && !/Edg/.test(userAgent);
      const isFirefox = /Firefox/.test(userAgent);
      const isEdge = /Edg/.test(userAgent);
      
      // 2. Verificar APIs disponíveis
      const hasSW = 'serviceWorker' in navigator;
      const hasPush = 'PushManager' in window;
      const hasNotification = 'Notification' in window;
      const hasPermissions = 'permissions' in navigator;
      
      // 3. Verificar Service Worker
      let swRegistration = null;
      let swActive = false;
      let swScriptURL = null;
      
      if (hasSW) {
        try {
          swRegistration = await navigator.serviceWorker.getRegistration('/');
          if (swRegistration) {
            swActive = !!swRegistration.active;
            swScriptURL = swRegistration.active?.scriptURL;
          }
        } catch (e) {
          console.error('Erro ao verificar SW:', e);
        }
      }
      
      // 4. Verificar permissões
      let notificationPermission = 'not-available';
      if (hasNotification) {
        notificationPermission = Notification.permission;
      }
      
      // 5. Verificar subscription
      let hasSubscription = false;
      let subscriptionEndpoint = null;
      
      if (swRegistration && hasPush) {
        try {
          const subscription = await swRegistration.pushManager.getSubscription();
          hasSubscription = !!subscription;
          subscriptionEndpoint = subscription?.endpoint;
        } catch (e) {
          console.error('Erro ao verificar subscription:', e);
        }
      }
      
      // 6. Verificar HTTPS
      const isHTTPS = location.protocol === 'https:';
      const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
      const isSecureContext = window.isSecureContext;
      
      // 7. Verificar PWA
      const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                    window.navigator.standalone === true;
      
      // 8. Compatibilidade específica
      let compatibility = {
        webPush: false,
        reason: 'Unknown'
      };
      
      if (isIOSSafari && !isPWA) {
        compatibility = {
          webPush: false,
          reason: 'iOS Safari não suporta Web Push (apenas em PWAs instaladas)'
        };
      } else if (!isSecureContext) {
        compatibility = {
          webPush: false,
          reason: 'Contexto não seguro (precisa HTTPS)'
        };
      } else if (!hasSW || !hasPush || !hasNotification) {
        compatibility = {
          webPush: false,
          reason: 'APIs necessárias não disponíveis'
        };
      } else {
        compatibility = {
          webPush: true,
          reason: 'Todas as APIs disponíveis'
        };
      }
      
      const debug = {
        // Browser Info
        browser: {
          userAgent,
          isIOS,
          isSafari,
          isIOSSafari,
          isAndroid,
          isChrome,
          isFirefox,
          isEdge,
          isPWA,
          displayMode: window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser'
        },
        
        // APIs
        apis: {
          serviceWorker: hasSW,
          pushManager: hasPush,
          notification: hasNotification,
          permissions: hasPermissions
        },
        
        // Service Worker
        serviceWorker: {
          registered: !!swRegistration,
          active: swActive,
          scriptURL: swScriptURL,
          scope: swRegistration?.scope
        },
        
        // Permissions
        permissions: {
          notification: notificationPermission
        },
        
        // Subscription
        subscription: {
          exists: hasSubscription,
          endpoint: subscriptionEndpoint ? 'exists' : 'none'
        },
        
        // Security
        security: {
          protocol: location.protocol,
          hostname: location.hostname,
          isHTTPS,
          isLocalhost,
          isSecureContext
        },
        
        // Compatibility
        compatibility,
        
        // Timestamp
        checkedAt: new Date().toISOString()
      };
      
      setDebugInfo(debug);
      console.log('🐛 Debug Info:', debug);
      
    } catch (error) {
      console.error('❌ Erro no debug:', error);
      setDebugInfo({ error: error.message });
    } finally {
      setRefreshing(false);
    }
  };

  const sendTestNotification = async () => {
    setTesting(true);
    try {
      // Se não tem suporte nativo, mostrar alternativa
      if (!debugInfo.compatibility?.webPush) {
        if (debugInfo.browser?.isIOSSafari) {
          alert('💡 iOS Safari: Instale este site como PWA para receber notificações!\n\n1. Toque no botão Compartilhar\n2. Adicionar à Tela de Início\n3. Abra o app instalado');
        } else {
          alert('❌ Seu navegador não suporta Web Push nativo');
        }
        return;
      }
      
      // Tentar enviar notificação de teste
      await apiService.sendWebPushTestNotification();
      alert('✅ Notificação de teste enviada! Verifique sua área de notificações.');
      
    } catch (error) {
      console.error('❌ Erro ao enviar teste:', error);
      alert(`❌ Erro: ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getIcon = (condition) => {
    if (condition === true) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (condition === false) return <XCircle className="h-4 w-4 text-red-600" />;
    return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
  };

  const getBrowserIcon = () => {
    if (debugInfo.browser?.isChrome) return <Chrome className="h-5 w-5" />;
    if (debugInfo.browser?.isSafari) return <Apple className="h-5 w-5" />;
    if (debugInfo.browser?.isAndroid) return <Smartphone className="h-5 w-5" />;
    return <Monitor className="h-5 w-5" />;
  };

  return (
    <Card className="border-2 border-orange-300 shadow-lg mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-orange-100">
              <Bug className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900">Web Push Debug v7.0</h3>
              <p className="text-sm text-zinc-600">Diagnóstico completo do sistema</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={checkAllFeatures}
              disabled={refreshing}
            >
              {refreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              size="sm"
              onClick={sendTestNotification}
              disabled={testing || !debugInfo.compatibility?.webPush}
            >
              {testing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Bell className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Status Principal */}
        {debugInfo.compatibility && (
          <Alert className={cn(
            "mb-4",
            debugInfo.compatibility.webPush 
              ? "border-green-300 bg-green-50" 
              : "border-red-300 bg-red-50"
          )}>
            <div className="flex items-start space-x-2">
              {getIcon(debugInfo.compatibility.webPush)}
              <AlertDescription>
                <strong className={debugInfo.compatibility.webPush ? "text-green-800" : "text-red-800"}>
                  {debugInfo.compatibility.webPush ? '✅ Web Push Suportado' : '❌ Web Push Não Suportado'}
                </strong>
                <p className="text-sm mt-1">
                  {debugInfo.compatibility.reason}
                </p>
              </AlertDescription>
            </div>
          </Alert>
        )}

        {/* Alternativa para iOS */}
        {debugInfo.browser?.isIOSSafari && !debugInfo.browser?.isPWA && (
          <Alert className="mb-4 border-blue-300 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="ml-2">
              <strong className="text-blue-800">Instale como App para receber notificações:</strong>
              <ol className="text-sm mt-2 list-decimal list-inside text-blue-700">
                <li>Toque no botão Compartilhar (⬆️)</li>
                <li>Escolha "Adicionar à Tela de Início"</li>
                <li>Abra o app instalado</li>
              </ol>
            </AlertDescription>
          </Alert>
        )}

        {/* Seções de Debug */}
        <div className="space-y-3">
          {/* Browser */}
          <div className="border rounded-lg">
            <button
              onClick={() => toggleSection('browser')}
              className="w-full p-3 flex items-center justify-between hover:bg-gray-50"
            >
              <div className="flex items-center space-x-2">
                {getBrowserIcon()}
                <span className="font-medium">Browser</span>
              </div>
              <span className="text-sm text-gray-500">
                {debugInfo.browser?.isChrome && 'Chrome'}
                {debugInfo.browser?.isSafari && 'Safari'}
                {debugInfo.browser?.isFirefox && 'Firefox'}
                {debugInfo.browser?.isEdge && 'Edge'}
                {debugInfo.browser?.isIOSSafari && ' (iOS)'}
              </span>
            </button>
            
            {expandedSections.browser && (
              <div className="p-3 border-t bg-gray-50 text-xs font-mono">
                <pre>{JSON.stringify(debugInfo.browser, null, 2)}</pre>
              </div>
            )}
          </div>

          {/* APIs */}
          <div className="border rounded-lg">
            <button
              onClick={() => toggleSection('apis')}
              className="w-full p-3 flex items-center justify-between hover:bg-gray-50"
            >
              <span className="font-medium">APIs Disponíveis</span>
              <div className="flex items-center space-x-1">
                {getIcon(debugInfo.apis?.serviceWorker)}
                {getIcon(debugInfo.apis?.pushManager)}
                {getIcon(debugInfo.apis?.notification)}
              </div>
            </button>
            
            {expandedSections.apis && (
              <div className="p-3 border-t bg-gray-50">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Service Worker</span>
                    {getIcon(debugInfo.apis?.serviceWorker)}
                  </div>
                  <div className="flex justify-between">
                    <span>Push Manager</span>
                    {getIcon(debugInfo.apis?.pushManager)}
                  </div>
                  <div className="flex justify-between">
                    <span>Notification API</span>
                    {getIcon(debugInfo.apis?.notification)}
                  </div>
                  <div className="flex justify-between">
                    <span>Permissions API</span>
                    {getIcon(debugInfo.apis?.permissions)}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Service Worker */}
          <div className="border rounded-lg">
            <button
              onClick={() => toggleSection('sw')}
              className="w-full p-3 flex items-center justify-between hover:bg-gray-50"
            >
              <span className="font-medium">Service Worker</span>
              {getIcon(debugInfo.serviceWorker?.active)}
            </button>
            
            {expandedSections.sw && (
              <div className="p-3 border-t bg-gray-50 text-xs">
                <div className="space-y-1">
                  <div>Status: {debugInfo.serviceWorker?.active ? '✅ Ativo' : '❌ Inativo'}</div>
                  <div>Scope: {debugInfo.serviceWorker?.scope || 'N/A'}</div>
                  <div className="truncate">Script: {debugInfo.serviceWorker?.scriptURL || 'N/A'}</div>
                </div>
              </div>
            )}
          </div>

          {/* Permissões */}
          <div className="border rounded-lg">
            <button
              onClick={() => toggleSection('permissions')}
              className="w-full p-3 flex items-center justify-between hover:bg-gray-50"
            >
              <span className="font-medium">Permissões</span>
              <span className="text-sm">
                {debugInfo.permissions?.notification === 'granted' && '✅ Concedida'}
                {debugInfo.permissions?.notification === 'denied' && '❌ Negada'}
                {debugInfo.permissions?.notification === 'default' && '⏳ Pendente'}
              </span>
            </button>
            
            {expandedSections.permissions && (
              <div className="p-3 border-t bg-gray-50 text-sm">
                <div>Notificações: {debugInfo.permissions?.notification || 'N/A'}</div>
              </div>
            )}
          </div>

          {/* Segurança */}
          <div className="border rounded-lg">
            <button
              onClick={() => toggleSection('security')}
              className="w-full p-3 flex items-center justify-between hover:bg-gray-50"
            >
              <span className="font-medium">Segurança</span>
              {getIcon(debugInfo.security?.isSecureContext)}
            </button>
            
            {expandedSections.security && (
              <div className="p-3 border-t bg-gray-50 text-sm">
                <div className="space-y-1">
                  <div>Protocolo: {debugInfo.security?.protocol}</div>
                  <div>HTTPS: {debugInfo.security?.isHTTPS ? '✅' : '❌'}</div>
                  <div>Contexto Seguro: {debugInfo.security?.isSecureContext ? '✅' : '❌'}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Timestamp */}
        <div className="mt-4 text-xs text-gray-500 text-center">
          Última verificação: {new Date(debugInfo.checkedAt || Date.now()).toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
};

export default WebPushDebug;