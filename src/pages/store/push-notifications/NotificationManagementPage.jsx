import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  BellIcon, 
  PlusIcon, 
  SearchIcon,
  Settings,
  BarChart3Icon,
  TargetIcon,
  RefreshCcwIcon,
  Loader2
} from 'lucide-react';
import MainLayout from '@/components/common/layout/MainLayout';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';

// Componentes separados
import NotificationOverview from './components/NotificationOverview';
import DeviceConfiguration from './components/DeviceConfiguration';
import CreateNotification from './components/CreateNotification';
import NotificationList from './components/NotificationList';

const NotificationManagementPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    sent: 0,
    scheduled: 0,
    draft: 0,
    subscribers: 0,
    validTokens: 0
  });

  useEffect(() => {
    fetchNotificationStats();
  }, []);

  const fetchNotificationStats = async () => {
    try {
      setIsLoading(true);
      
      try {
        const tokenStats = await apiService.getWebPushStoreStats('E47OkrK3IcNu1Ys8gD4CA29RrHk2');
        const notifications = await apiService.getStoreNotifications();
        
        const notificationStats = {
          total: notifications.length,
          sent: notifications.filter(n => n.status === 'sent').length,
          scheduled: notifications.filter(n => n.status === 'scheduled').length,
          draft: notifications.filter(n => n.status === 'draft').length,
        };
        
        setStats({
          ...notificationStats,
          subscribers: tokenStats.totalSubscriptions || 0,
          validTokens: tokenStats.activeSubscriptions || 0
        });
      } catch (apiError) {
        setStats({
          total: 0,
          sent: 0,
          scheduled: 0,
          draft: 0,
          subscribers: 0,
          validTokens: 0
        });
      }
      
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout userType="store" pageTitle="Gerenciamento de Notificações">
      <div className="space-y-6 pb-8">
        
        {/* Header */}
        <div className="bg-white rounded-xl border shadow-sm p-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 shadow-md">
                  <BellIcon className="h-6 w-6 text-purple-700" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-purple-900">
                    Gerenciamento de Notificações
                  </h1>
                  <p className="text-sm text-zinc-600 font-medium">
                    Envie alertas personalizados para seus clientes
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  placeholder="Buscar notificações..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 w-56 border-zinc-200 focus:border-purple-300 focus:ring-purple-200"
                />
              </div>
              
              <Button 
                className="h-10 px-4 bg-purple-600 hover:bg-purple-700 text-white"
                onClick={fetchNotificationStats}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCcwIcon className="h-4 w-4 mr-2" />
                )}
                Atualizar
              </Button>
              
              <Button 
                className="h-10 px-4 bg-green-600 hover:bg-green-700 text-white" 
                onClick={() => setActiveTab('create')}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Nova Notificação
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border shadow-sm p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full max-w-4xl mx-auto bg-gray-100 p-2 rounded-xl">
              <TabsTrigger 
                value="overview" 
                className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 rounded-lg font-semibold h-10 px-4"
              >
                <BarChart3Icon className="h-4 w-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger 
                value="create"
                className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 rounded-lg font-semibold h-10 px-4"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Criar
              </TabsTrigger>
              <TabsTrigger 
                value="config"
                className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 rounded-lg font-semibold h-10 px-4"
              >
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </TabsTrigger>
              <TabsTrigger 
                value="campaigns"
                className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 rounded-lg font-semibold h-10 px-4"
              >
                <TargetIcon className="h-4 w-4 mr-2" />
                Histórico
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-6">
              <NotificationOverview stats={stats} onRefresh={fetchNotificationStats} setActiveTab={setActiveTab} />
            </TabsContent>
            
            <TabsContent value="create" className="mt-6">
              <CreateNotification />
            </TabsContent>
            
            <TabsContent value="config" className="mt-6">
              <DeviceConfiguration />
            </TabsContent>
            
            <TabsContent value="campaigns" className="mt-6">
              <NotificationList searchQuery={searchQuery} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default NotificationManagementPage;