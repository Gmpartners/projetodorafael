import React, { useState } from 'react';
import { createNotification } from '@/services/push-notifications/pushNotificationService';
import NotificationEditor from './NotificationEditor';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const NotificationCreate = ({ onClose, onNotificationCreated }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSave = async (notificationData) => {
    setIsLoading(true);
    try {
      await createNotification(notificationData);
      onNotificationCreated();
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="shadow-md border-zinc-200 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Nova Notificação</CardTitle>
            <CardDescription>
              Crie uma nova notificação para enviar aos seus clientes
            </CardDescription>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="h-9 w-9"
          >
            <XIcon className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <NotificationEditor 
          onSave={handleSave}
          onCancel={onClose}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
};

export default NotificationCreate;
