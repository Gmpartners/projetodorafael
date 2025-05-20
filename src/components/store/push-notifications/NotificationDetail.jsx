import React, { useState } from 'react';
import { 
  sendNotification, 
  deleteNotification 
} from '@/services/push-notifications/pushNotificationService';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  XIcon, 
  SendIcon, 
  TrashIcon, 
  EditIcon,
  EyeIcon,
  CalendarIcon,
  UserIcon,
  UsersIcon,
  CheckIcon
} from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import NotificationEditor from './NotificationEditor';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const NotificationDetail = ({ notification, onClose, onNotificationUpdated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSend = async () => {
    setIsLoading(true);
    try {
      await sendNotification(notification.id);
      onNotificationUpdated();
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteNotification(notification.id);
      onNotificationUpdated();
    } catch (error) {
      console.error('Erro ao excluir notificação:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
  };
  
  const handleSaveEdit = () => {
    onNotificationUpdated();
    setIsEditing(false);
  };
  
  // Formatar datas
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
      locale: ptBR
    });
  };
  
  // Se estiver no modo de edição, mostrar o editor
  if (isEditing) {
    return (
      <NotificationEditor 
        notification={notification}
        onCancel={handleCancelEdit}
        onSave={handleSaveEdit}
        isEditing={true}
      />
    );
  }
  
  return (
    <Card className="shadow-md border-zinc-200 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl mb-1">{notification.title}</CardTitle>
            <CardDescription>
              {notification.status === 'sent' ? (
                <span className="flex items-center">
                  <SendIcon className="h-4 w-4 mr-1 text-green-600" />
                  Enviada {formatDate(notification.sentAt)}
                </span>
              ) : notification.status === 'scheduled' ? (
                <span className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1 text-amber-600" />
                  Agendada para {formatDate(notification.scheduledFor)}
                </span>
              ) : (
                <span className="flex items-center">
                  <EditIcon className="h-4 w-4 mr-1 text-zinc-600" />
                  Rascunho
                </span>
              )}
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
      
      <CardContent className="space-y-4">
        <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-200">
          <div className="mb-3">
            <h4 className="text-sm font-medium text-zinc-900 mb-1">Conteúdo da Notificação</h4>
            <div className="bg-white p-4 rounded-lg border border-zinc-200 shadow-sm">
              <h3 className="font-medium text-zinc-900 mb-1">{notification.title}</h3>
              <p className="text-zinc-700">{notification.body}</p>
            </div>
          </div>
          
          <div className="mb-3">
            <h4 className="text-sm font-medium text-zinc-900 mb-1">Tipo de Notificação</h4>
            <Badge 
              variant="outline" 
              className="bg-purple-50 text-purple-700 border-purple-200"
            >
              {notification.type}
            </Badge>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-zinc-900 mb-1">Destinatário</h4>
            {notification.targetCustomer ? (
              <div className="flex items-center">
                <UserIcon className="h-4 w-4 mr-2 text-blue-600" />
                <span className="text-sm text-zinc-700">
                  Cliente específico: <span className="font-medium">{notification.targetCustomer.name}</span>
                </span>
              </div>
            ) : notification.targetSegment ? (
              <div className="flex items-center">
                <UsersIcon className="h-4 w-4 mr-2 text-indigo-600" />
                <span className="text-sm text-zinc-700">
                  Segmento: <span className="font-medium">{notification.targetSegment}</span>
                </span>
              </div>
            ) : (
              <div className="flex items-center">
                <UsersIcon className="h-4 w-4 mr-2 text-zinc-600" />
                <span className="text-sm text-zinc-700">Todos os clientes</span>
              </div>
            )}
          </div>
        </div>
        
        {notification.status === 'sent' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200">
              <h4 className="text-sm font-medium text-zinc-700 mb-1">Leitura</h4>
              <div className="flex items-center">
                <EyeIcon className="h-4 w-4 mr-1 text-zinc-500" />
                <span className="text-sm">
                  {notification.readAt ? (
                    <span className="text-green-600 font-medium">Lida {formatDate(notification.readAt)}</span>
                  ) : (
                    <span className="text-zinc-500">Não lida</span>
                  )}
                </span>
              </div>
            </div>
            
            <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200">
              <h4 className="text-sm font-medium text-zinc-700 mb-1">Link</h4>
              <div className="flex items-center">
                <CheckIcon className="h-4 w-4 mr-1 text-zinc-500" />
                <span className="text-sm">
                  {notification.metadata?.deepLink ? (
                    <span className="text-blue-600 font-medium">{notification.metadata.deepLink}</span>
                  ) : (
                    <span className="text-zinc-500">Sem link</span>
                  )}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-2 flex justify-between">
        <div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                <TrashIcon className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Isso excluirá permanentemente esta notificação.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  className="bg-red-600 hover:bg-red-700"
                  onClick={handleDelete}
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleEdit}
          >
            <EditIcon className="h-4 w-4 mr-2" />
            Editar
          </Button>
          
          {notification.status !== 'sent' && (
            <Button 
              onClick={handleSend} 
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              <SendIcon className="h-4 w-4 mr-2" />
              {notification.status === 'scheduled' ? 'Enviar Agora' : 'Enviar'}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default NotificationDetail;
