// src/components/NotificationSettings.jsx
import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Check, X, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { notificationService } from '@/services/notificationService';
import { toast } from 'sonner';

export function NotificationSettings() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [enabling, setEnabling] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      setLoading(true);
      const currentStatus = await notificationService.getSystemStatus();
      setStatus(currentStatus);
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      toast.error('Erro ao verificar status das notificações');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleNotifications = async () => {
    try {
      setEnabling(true);
      
      if (status?.isSubscribed) {
        // Desativar notificações
        await notificationService.unsubscribe();
        toast.success('Notificações desativadas');
      } else {
        // Ativar notificações
        await notificationService.requestPermissionAndSubscribe();
        toast.success('Notificações ativadas com sucesso!');
      }
      
      await checkStatus();
    } catch (error) {
      console.error('Erro ao alterar notificações:', error);
      toast.error(error.message || 'Erro ao alterar configurações');
    } finally {
      setEnabling(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      setTesting(true);
      await notificationService.sendTestNotification();
      toast.success('Notificação de teste enviada!');
    } catch (error) {
      console.error('Erro ao enviar teste:', error);
      toast.error('Erro ao enviar notificação de teste');
    } finally {
      setTesting(false);
    }
  };

  const getPermissionBadge = () => {
    if (!status) return null;
    
    switch (status.permission) {
      case 'granted':
        return <Badge variant="success">Permitido</Badge>;
      case 'denied':
        return <Badge variant="destructive">Bloqueado</Badge>;
      default:
        return <Badge variant="secondary">Não solicitado</Badge>;
    }
  };

  const getStatusIcon = () => {
    if (!status) return null;
    
    if (status.isSubscribed && status.permission === 'granted') {
      return <Bell className="h-5 w-5 text-green-500" />;
    } else {
      return <BellOff className="h-5 w-5 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const isBlocked = status?.permission === 'denied';
  const isEnabled = status?.isSubscribed && status?.permission === 'granted';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Notificações Push</CardTitle>
            {getStatusIcon()}
          </div>
          {getPermissionBadge()}
        </div>
        <CardDescription>
          Receba notificações sobre seus pedidos e mensagens
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status do Sistema */}
        {!status?.supported && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Navegador não compatível</AlertTitle>
            <AlertDescription>
              Seu navegador não suporta notificações push. 
              Tente usar Chrome, Firefox ou Safari.
            </AlertDescription>
          </Alert>
        )}
        
        {isBlocked && (
          <Alert variant="destructive">
            <X className="h-4 w-4" />
            <AlertTitle>Notificações bloqueadas</AlertTitle>
            <AlertDescription>
              Você bloqueou as notificações para este site. 
              Para reativar, acesse as configurações do seu navegador.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Toggle Principal */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-1">
            <div className="font-medium">Ativar Notificações</div>
            <div className="text-sm text-muted-foreground">
              Receba alertas em tempo real
            </div>
          </div>
          <Switch
            checked={isEnabled}
            onCheckedChange={handleToggleNotifications}
            disabled={enabling || isBlocked || !status?.supported}
          />
        </div>
        
        {/* Informações do Dispositivo */}
        {isEnabled && status && (
          <div className="space-y-2 text-sm">
            <div className="font-medium">Informações do dispositivo:</div>
            <div className="grid grid-cols-2 gap-2 text-muted-foreground">
              <div>Navegador:</div>
              <div>{status.device?.browser || 'Desconhecido'}</div>
              <div>Sistema:</div>
              <div>{status.device?.os || 'Desconhecido'}</div>
              <div>Status:</div>
              <div className="flex items-center gap-1">
                <Check className="h-3 w-3 text-green-500" />
                <span>Ativo</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Botão de Teste */}
        {isEnabled && (
          <Button
            onClick={handleTestNotification}
            disabled={testing}
            variant="outline"
            className="w-full"
          >
            {testing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando teste...
              </>
            ) : (
              <>
                <Bell className="mr-2 h-4 w-4" />
                Enviar Notificação de Teste
              </>
            )}
          </Button>
        )}
        
        {/* Dica */}
        <div className="text-xs text-muted-foreground">
          <p>💡 Dica: As notificações funcionam mesmo com o site fechado!</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default NotificationSettings;
