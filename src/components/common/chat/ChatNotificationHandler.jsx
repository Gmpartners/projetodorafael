import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { 
  Bell, 
  BellOff, 
  Volume2, 
  VolumeX,
  MessageSquare,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

// Tipos de eventos que podem gerar notificações
const EVENT_TYPES = {
  NEW_MESSAGE: 'new_message',
  STATUS_UPDATE: 'status_update',
  URGENT: 'urgent'
};

// Sons para diferentes tipos de notificações
const NOTIFICATION_SOUNDS = {
  [EVENT_TYPES.NEW_MESSAGE]: '/sounds/message.mp3',
  [EVENT_TYPES.STATUS_UPDATE]: '/sounds/status-update.mp3',
  [EVENT_TYPES.URGENT]: '/sounds/urgent.mp3'
};

const ChatNotificationHandler = ({
  orderId,
  onNewNotification,
  userType = 'store'
}) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [hasWebNotificationPermission, setHasWebNotificationPermission] = useState(false);
  
  // Verificar permissão para notificações do navegador
  useEffect(() => {
    if ('Notification' in window) {
      const checkPermission = async () => {
        if (Notification.permission === 'granted') {
          setHasWebNotificationPermission(true);
        } else if (Notification.permission !== 'denied') {
          const permission = await Notification.requestPermission();
          setHasWebNotificationPermission(permission === 'granted');
        }
      };
      
      checkPermission();
    }
  }, []);
  
  // Simular recebimento de notificações (na implementação real, usaria WebSockets)
  useEffect(() => {
    // Apenas para simulação - removeríamos isto na implementação real
    const simulateIncomingNotifications = () => {
      // Não simular se as notificações estiverem desativadas
      if (!notificationsEnabled) return;
      
      const newNotification = {
        id: `notif-${Date.now()}`,
        type: EVENT_TYPES.NEW_MESSAGE,
        orderId,
        title: userType === 'store' ? 'Nova mensagem do cliente' : 'Nova mensagem da loja',
        message: userType === 'store' 
          ? 'O cliente enviou uma nova mensagem sobre o pedido.'
          : 'A loja respondeu à sua mensagem.',
        timestamp: new Date(),
        read: false
      };
      
      handleNewNotification(newNotification);
    };
    
    // Simulação para demonstração
    const simulationInterval = setInterval(simulateIncomingNotifications, 30000);
    
    return () => clearInterval(simulationInterval);
  }, [orderId, notificationsEnabled, userType]);
  
  // Processar nova notificação
  const handleNewNotification = (notification) => {
    // Adicionar notificação à lista
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Chamar callback
    if (onNewNotification) {
      onNewNotification(notification);
    }
    
    // Reproduzir som de notificação, se habilitado
    if (soundEnabled) {
      playNotificationSound(notification.type);
    }
    
    // Exibir notificação do navegador, se permissão concedida
    if (hasWebNotificationPermission && notificationsEnabled && document.hidden) {
      const webNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/images/logo.png' // Caminho para o ícone da notificação
      });
      
      webNotification.onclick = () => {
        window.focus();
        markAllAsRead();
      };
    }
  };
  
  // Reproduzir som de notificação
  const playNotificationSound = (type) => {
    const soundUrl = NOTIFICATION_SOUNDS[type] || NOTIFICATION_SOUNDS[EVENT_TYPES.NEW_MESSAGE];
    const audio = new Audio(soundUrl);
    audio.play().catch(error => {
      // Lidar com erros de reprodução (geralmente devido a interação do usuário ser necessária)
      console.warn('Não foi possível reproduzir o som de notificação:', error);
    });
  };
  
  // Marcar todas notificações como lidas
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };
  
  // Alternar notificações sonoras
  const toggleSound = () => {
    setSoundEnabled(prev => !prev);
    // Salvar preferência no localStorage
    localStorage.setItem('chatSoundEnabled', !soundEnabled);
  };
  
  // Alternar notificações
  const toggleNotifications = () => {
    setNotificationsEnabled(prev => !prev);
    // Salvar preferência no localStorage
    localStorage.setItem('chatNotificationsEnabled', !notificationsEnabled);
  };
  
  // Carregar preferências do localStorage no carregamento do componente
  useEffect(() => {
    const savedSoundEnabled = localStorage.getItem('chatSoundEnabled');
    const savedNotificationsEnabled = localStorage.getItem('chatNotificationsEnabled');
    
    if (savedSoundEnabled !== null) {
      setSoundEnabled(savedSoundEnabled === 'true');
    }
    
    if (savedNotificationsEnabled !== null) {
      setNotificationsEnabled(savedNotificationsEnabled === 'true');
    }
  }, []);
  
  return (
    <div className="flex items-center space-x-2">
      {unreadCount > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 hover:text-purple-800"
                onClick={markAllAsRead}
              >
                <MessageSquare className="h-4 w-4" />
                <span>{unreadCount} {unreadCount === 1 ? 'nova mensagem' : 'novas mensagens'}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Marcar todas como lidas</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      
      <div className="flex gap-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={toggleSound}
              >
                {soundEnabled ? (
                  <Volume2 className="h-4 w-4 text-zinc-600" />
                ) : (
                  <VolumeX className="h-4 w-4 text-zinc-400" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{soundEnabled ? 'Desativar sons' : 'Ativar sons'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={toggleNotifications}
              >
                {notificationsEnabled ? (
                  <Bell className="h-4 w-4 text-zinc-600" />
                ) : (
                  <BellOff className="h-4 w-4 text-zinc-400" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{notificationsEnabled ? 'Desativar notificações' : 'Ativar notificações'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {!hasWebNotificationPermission && notificationsEnabled && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-amber-500"
                  onClick={async () => {
                    if ('Notification' in window) {
                      const permission = await Notification.requestPermission();
                      setHasWebNotificationPermission(permission === 'granted');
                    }
                  }}
                >
                  <AlertCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Permitir notificações do navegador</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {hasWebNotificationPermission && notificationsEnabled && (
          <Badge variant="outline" className="h-8 flex items-center gap-1 border-green-200 text-green-700 px-2">
            <CheckCircle2 className="h-3 w-3" />
            <span className="text-xs">Notificações ativas</span>
          </Badge>
        )}
      </div>
    </div>
  );
};

export default ChatNotificationHandler;