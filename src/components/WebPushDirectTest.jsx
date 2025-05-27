// src/components/WebPushDirectTest.jsx
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Zap,
  Bell,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import webPushService from '@/services/webPushService';

const WebPushDirectTest = () => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState(null);

  const testDirectNotification = async () => {
    setTesting(true);
    setResult(null);
    
    try {
      console.log('🧪 Iniciando teste direto do Service Worker...');
      
      // Verificar se tem permissão primeiro
      if (Notification.permission !== 'granted') {
        throw new Error('Permissão de notificação não concedida');
      }
      
      // Testar diretamente do SW
      await webPushService.testDirectFromServiceWorker();
      
      setResult({
        success: true,
        message: 'Notificação criada diretamente pelo Service Worker!'
      });
      
    } catch (error) {
      console.error('❌ Erro no teste direto:', error);
      setResult({
        success: false,
        message: error.message
      });
    } finally {
      setTesting(false);
    }
  };

  const testSimpleNotification = async () => {
    setTesting(true);
    setResult(null);
    
    try {
      // Teste super simples sem SW
      if (Notification.permission !== 'granted') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          throw new Error('Permissão negada');
        }
      }
      
      // Criar notificação simples
      const notification = new Notification('🧪 Teste Simples', {
        body: 'Esta é uma notificação criada diretamente sem SW',
        icon: '/vite.svg'
      });
      
      setResult({
        success: true,
        message: 'Notificação simples criada com sucesso!'
      });
      
      // Fechar após 5 segundos
      setTimeout(() => notification.close(), 5000);
      
    } catch (error) {
      console.error('❌ Erro na notificação simples:', error);
      setResult({
        success: false,
        message: error.message
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="border-2 border-yellow-300 shadow-lg mb-6">
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-lg bg-yellow-100">
            <Zap className="h-5 w-5 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-900">Teste Direto de Notificação</h3>
            <p className="text-sm text-zinc-600">Testar notificações sem depender do backend</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={testSimpleNotification}
              disabled={testing}
              variant="outline"
              className="w-full"
            >
              {testing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Bell className="h-4 w-4 mr-2" />
                  Teste Simples
                </>
              )}
            </Button>
            
            <Button
              onClick={testDirectNotification}
              disabled={testing}
              className="w-full bg-yellow-600 hover:bg-yellow-700"
            >
              {testing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Teste do SW
                </>
              )}
            </Button>
          </div>

          {result && (
            <Alert className={result.success ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50"}>
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className="ml-2">
                {result.message}
              </AlertDescription>
            </Alert>
          )}

          <div className="text-xs text-gray-600 space-y-1">
            <p><strong>Teste Simples:</strong> Cria notificação diretamente (sem SW)</p>
            <p><strong>Teste do SW:</strong> Solicita ao Service Worker criar notificação</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WebPushDirectTest;