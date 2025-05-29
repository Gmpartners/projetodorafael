import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/animations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';
import { NotificationStatusBadge, NotificationTypeBadge } from './NotificationBadges';
import { 
  BellIcon,
  RefreshCcwIcon,
  SearchIcon,
  Loader2,
  PauseIcon,
  TrashIcon,
  MoreVerticalIcon,
  ImageIcon
} from 'lucide-react';

const NotificationListCard = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadNotifications = async () => {
    try {
      setLoading(true);
      
      const filters = {};
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }
      if (searchQuery.trim()) {
        filters.search = searchQuery.trim();
      }

      const notificationList = await apiService.getStoreNotifications(filters);
      setNotifications(notificationList || []);
      
    } catch (error) {
      toast.error('Erro ao carregar notificações');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [statusFilter]);

  const handleSearch = () => {
    loadNotifications();
  };

  const handleDeleteNotification = async (notificationId) => {
    if (!confirm('Tem certeza que deseja deletar esta notificação?')) return;

    try {
      await apiService.deleteNotification(notificationId);
      toast.success('Notificação deletada com sucesso');
      await loadNotifications();
    } catch (error) {
      toast.error('Erro ao deletar notificação');
    }
  };

  const handleCancelNotification = async (notificationId) => {
    if (!confirm('Tem certeza que deseja cancelar esta notificação?')) return;

    try {
      await apiService.cancelNotification(notificationId);
      toast.success('Notificação cancelada com sucesso');
      await loadNotifications();
    } catch (error) {
      toast.error('Erro ao cancelar notificação');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Data não disponível';
    
    try {
      let date;
      if (dateString._seconds) {
        date = new Date(dateString._seconds * 1000);
      } else {
        date = new Date(dateString);
      }
      
      return date.toLocaleString('pt-BR');
    } catch (error) {
      return 'Data inválida';
    }
  };

  return (
    <GlassCard className="p-6 border-0 shadow-premium">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 shadow-lg">
            <BellIcon className="h-6 w-6 text-emerald-700" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-zinc-900">Minhas Notificações</h3>
            <p className="text-zinc-600">Gerencie notificações enviadas e agendadas</p>
          </div>
        </div>
        <Button onClick={loadNotifications} disabled={loading} variant="outline">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCcwIcon className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Buscar notificações..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="sent">Enviadas</SelectItem>
            <SelectItem value="scheduled">Agendadas</SelectItem>
            <SelectItem value="draft">Rascunhos</SelectItem>
            <SelectItem value="failed">Falharam</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleSearch}>
          <SearchIcon className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-3" />
            <p className="text-zinc-600">Carregando notificações...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8">
            <BellIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma notificação encontrada</h3>
            <p className="text-gray-500">Crie sua primeira notificação</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <Card key={notification.id} className="border border-zinc-200 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-zinc-900">{notification.title}</h4>
                      <NotificationStatusBadge status={notification.status} />
                      {notification.type && <NotificationTypeBadge type={notification.type} />}
                      {(notification.image || notification.data?.imageUrl) && (
                        <Badge className="bg-purple-100 text-purple-700">
                          <ImageIcon className="h-3 w-3 mr-1" />
                          Com imagem
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-zinc-600 text-sm mb-3">{notification.body}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                      {notification.sentAt && (
                        <span>📤 Enviada: {formatDate(notification.sentAt)}</span>
                      )}
                      {notification.scheduledDate && !notification.sentAt && (
                        <span>📅 Agendada: {formatDate(notification.scheduledDate)}</span>
                      )}
                      {notification.target && (
                        <span>🎯 Para: {notification.target === 'subscribers' ? 'Todos os inscritos' : 'Usuário específico'}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {notification.status === 'scheduled' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancelNotification(notification.id)}
                        className="border-amber-300 hover:bg-amber-50"
                      >
                        <PauseIcon className="h-3 w-3" />
                      </Button>
                    )}
                    
                    {(notification.status === 'draft' || notification.status === 'scheduled') && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteNotification(notification.id)}
                        className="border-red-300 hover:bg-red-50"
                      >
                        <TrashIcon className="h-3 w-3" />
                      </Button>
                    )}
                    
                    <Button size="sm" variant="ghost">
                      <MoreVerticalIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </GlassCard>
  );
};

export default NotificationListCard;