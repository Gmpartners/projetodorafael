import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  FlaskConical,
  Zap,
  TestTube,
  Target,
  Settings,
  Monitor,
  Play,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  MousePointer,
  Loader2,
  Clock,
  Activity
} from 'lucide-react';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const AdvancedTesting = () => {
  const [activeTest, setActiveTest] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [customTestUrl, setCustomTestUrl] = useState('');
  const [swStatus, setSwStatus] = useState({});
  const [loading, setLoading] = useState(false);

  // Estados para histórico de URLs testadas
  const [urlHistory, setUrlHistory] = useState([]);
  
  // Estados para monitor do Service Worker
  const [swLogs, setSwLogs] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    checkServiceWorkerStatus();
    loadUrlHistory();
    
    // Auto-refresh do status se ativado
    if (autoRefresh) {
      const interval = setInterval(checkServiceWorkerStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // 🧪 Tipos de teste disponíveis com URLs e actions específicas
  const testTypes = [
    {
      id: 'order_status',
      name: '📦 Status de Pedido',
      description: 'Testa notificação de atualização de pedido',
      defaultUrl: 'https://projeto-rafael-53f73.web.app/customer/orders/123',
      actions: [
        { action: 'view_order', title: '📦 Ver Pedido' },
        { action: 'track_order', title: '🚚 Rastrear' }
      ],
      testData: {
        title: '📦 Pedido Enviado!',
        body: 'Seu pedido #12345 foi enviado e está a caminho',
        orderId: '12345'
      }
    },
    {
      id: 'chat_message',
      name: '💬 Mensagem de Chat',
      description: 'Testa notificação de nova mensagem',
      defaultUrl: 'https://projeto-rafael-53f73.web.app/customer/chat/abc123',
      actions: [
        { action: 'reply_chat', title: '💬 Responder' },
        { action: 'view_chat', title: '👁️ Ver Chat' }
      ],
      testData: {
        title: '💬 Nova mensagem da loja',
        body: 'Você recebeu uma nova mensagem sobre seu pedido',
        chatId: 'abc123'
      }
    },
    {
      id: 'custom_step',
      name: '📊 Etapa Personalizada',
      description: 'Testa notificação de progresso customizado',
      defaultUrl: 'https://projeto-rafael-53f73.web.app/customer/orders/123/progress',
      actions: [
        { action: 'view_progress', title: '📊 Ver Progresso' },
        { action: 'view_details', title: '📋 Detalhes' }
      ],
      testData: {
        title: '📊 Produto Separado!',
        body: 'Seu pedido está sendo preparado para envio',
        orderId: '12345'
      }
    },
    {
      id: 'promotion',
      name: '🎁 Promoção',
      description: 'Testa notificação promocional',
      defaultUrl: 'https://projeto-rafael-53f73.web.app/customer/offers',
      actions: [
        { action: 'view_offer', title: '🛍️ Ver Oferta' },
        { action: 'shop_now', title: '🛒 Comprar' }
      ],
      testData: {
        title: '🎁 Oferta Especial!',
        body: '50% OFF em produtos selecionados por tempo limitado!',
        link: 'https://projeto-rafael-53f73.web.app/customer/offers'
      }
    },
    {
      id: 'news',
      name: '📢 Novidade',
      description: 'Testa notificação de novidades',
      defaultUrl: 'https://projeto-rafael-53f73.web.app/customer/news',
      actions: [
        { action: 'read_more', title: '📖 Ler Mais' },
        { action: 'share', title: '🔗 Compartilhar' }
      ],
      testData: {
        title: '📢 Novidades na Loja!',
        body: 'Confira os novos produtos que chegaram hoje',
        link: 'https://projeto-rafael-53f73.web.app/customer/news'
      }
    },
    {
      id: 'feedback',
      name: '⭐ Feedback',
      description: 'Testa solicitação de avaliação',
      defaultUrl: 'https://projeto-rafael-53f73.web.app/customer/feedback',
      actions: [
        { action: 'rate_now', title: '⭐ Avaliar' },
        { action: 'write_review', title: '✍️ Comentar' }
      ],
      testData: {
        title: '⭐ Como foi sua experiência?',
        body: 'Gostaríamos de saber sua opinião sobre nossos produtos',
        orderId: '12345'
      }
    }
  ];

  // 🔍 Verificar status do Service Worker
  const checkServiceWorkerStatus = async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration('/');
      
      const status = {
        registered: !!registration,
        active: !!(registration && registration.active),
        waiting: !!(registration && registration.waiting),
        installing: !!(registration && registration.installing),
        scope: registration?.scope,
        scriptURL: registration?.active?.scriptURL,
        state: registration?.active?.state,
        version: 'v7.0.0-web-push-complete'
      };
      
      setSwStatus(status);
      
      // Adicionar log
      addSwLog(`Status atualizado: ${status.active ? 'Ativo' : 'Inativo'}`, 'info');
      
    } catch (error) {
      console.error('❌ Erro ao verificar SW:', error);
      setSwStatus({ error: error.message });
      addSwLog(`Erro: ${error.message}`, 'error');
    }
  };

  // 📝 Adicionar log do Service Worker
  const addSwLog = (message, type = 'info') => {
    const logEntry = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    };
    
    setSwLogs(prev => [logEntry, ...prev.slice(0, 49)]); // Manter apenas 50 logs
  };

  // 📂 Carregar histórico de URLs
  const loadUrlHistory = () => {
    try {
      const history = localStorage.getItem('webpush_url_history');
      if (history) {
        setUrlHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error('❌ Erro ao carregar histórico:', error);
    }
  };

  // 💾 Salvar URL no histórico
  const saveUrlToHistory = (url, testType) => {
    const historyEntry = {
      url,
      testType,
      timestamp: new Date().toISOString(),
      id: Date.now()
    };
    
    const newHistory = [historyEntry, ...urlHistory.slice(0, 9)]; // Manter apenas 10
    setUrlHistory(newHistory);
    
    try {
      localStorage.setItem('webpush_url_history', JSON.stringify(newHistory));
    } catch (error) {
      console.error('❌ Erro ao salvar histórico:', error);
    }
  };

  // 🧪 Executar teste por tipo
  const runTypeTest = async (testType) => {
    if (loading) return;
    
    setLoading(true);
    setActiveTest(testType.id);
    
    try {
      const testUrl = customTestUrl || testType.defaultUrl;
      
      addSwLog(`Iniciando teste: ${testType.name}`, 'info');
      
      const result = await apiService.testWebPushByType(
        testType.id,
        testUrl,
        testType.testData
      );
      
      // Salvar no histórico
      saveUrlToHistory(testUrl, testType.name);
      
      // Adicionar resultado
      const testResult = {
        id: Date.now(),
        type: testType.name,
        url: testUrl,
        timestamp: new Date().toLocaleString(),
        success: true,
        result: result,
        actions: testType.actions
      };
      
      setTestResults(prev => [testResult, ...prev.slice(0, 19)]); // Manter 20 resultados
      
      addSwLog(`Teste concluído: ${testType.name}`, 'success');
      toast.success(`🧪 Teste ${testType.name} enviado!`, {
        description: `URL: ${testUrl}`
      });
      
    } catch (error) {
      console.error('❌ Erro no teste:', error);
      
      const testResult = {
        id: Date.now(),
        type: testType.name,
        url: customTestUrl || testType.defaultUrl,
        timestamp: new Date().toLocaleString(),
        success: false,
        error: error.message
      };
      
      setTestResults(prev => [testResult, ...prev.slice(0, 19)]);
      
      addSwLog(`Erro no teste: ${error.message}`, 'error');
      toast.error(`❌ Erro no teste: ${error.message}`);
    } finally {
      setLoading(false);
      setActiveTest(null);
    }
  };

  // 🎯 Teste de URL personalizada
  const runCustomUrlTest = async () => {
    if (!customTestUrl.trim()) {
      toast.error('Digite uma URL para testar');
      return;
    }
    
    if (loading) return;
    
    setLoading(true);
    
    try {
      addSwLog(`Testando URL personalizada: ${customTestUrl}`, 'info');
      
      const result = await apiService.sendWebPushTestWithCustomUrl(
        customTestUrl,
        {
          title: '🎯 Teste de URL Personalizada',
          body: `Testando navegação para: ${customTestUrl}`,
          type: 'custom'
        }
      );
      
      saveUrlToHistory(customTestUrl, 'URL Personalizada');
      
      const testResult = {
        id: Date.now(),
        type: 'URL Personalizada',
        url: customTestUrl,
        timestamp: new Date().toLocaleString(),
        success: true,
        result: result
      };
      
      setTestResults(prev => [testResult, ...prev.slice(0, 19)]);
      
      addSwLog('URL personalizada testada com sucesso', 'success');
      toast.success('🎯 Teste de URL enviado!', {
        description: `Clique na notificação para ir para: ${customTestUrl}`
      });
      
    } catch (error) {
      console.error('❌ Erro no teste de URL:', error);
      
      const testResult = {
        id: Date.now(),
        type: 'URL Personalizada',
        url: customTestUrl,
        timestamp: new Date().toLocaleString(),
        success: false,
        error: error.message
      };
      
      setTestResults(prev => [testResult, ...prev.slice(0, 19)]);
      
      addSwLog(`Erro no teste de URL: ${error.message}`, 'error');
      toast.error(`❌ Erro no teste: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Atualizar Service Worker
  const updateServiceWorker = async () => {
    try {
      addSwLog('Forçando atualização do Service Worker...', 'info');
      
      const registration = await navigator.serviceWorker.getRegistration('/');
      if (registration) {
        await registration.update();
        addSwLog('Service Worker atualizado com sucesso', 'success');
        toast.success('🔄 Service Worker atualizado!');
        
        // Aguardar um pouco e verificar status novamente
        setTimeout(checkServiceWorkerStatus, 1000);
      } else {
        addSwLog('Nenhum Service Worker registrado para atualizar', 'warning');
        toast.warning('⚠️ Nenhum Service Worker registrado');
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar SW:', error);
      addSwLog(`Erro ao atualizar SW: ${error.message}`, 'error');
      toast.error('❌ Erro ao atualizar Service Worker');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-100 to-green-200 shadow-lg">
                <FlaskConical className="h-6 w-6 text-green-700" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-zinc-900">Testes Avançados v7.0</h3>
                <p className="text-zinc-600">Suite completa de testes para Web Push</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant={swStatus.active ? "default" : "destructive"}>
                {swStatus.active ? 'SW Ativo' : 'SW Inativo'}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={updateServiceWorker}
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Atualizar SW
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Painel de Testes por Tipo */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <TestTube className="h-5 w-5 text-blue-600" />
              <h4 className="text-lg font-semibold">Testes por Tipo</h4>
            </div>
            
            <div className="space-y-3">
              {testTypes.map((test) => (
                <div key={test.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-semibold text-sm">{test.name}</h5>
                    <Button
                      size="sm"
                      onClick={() => runTypeTest(test)}
                      disabled={loading}
                      className={cn(
                        "h-8 px-3",
                        activeTest === test.id && "bg-blue-600"
                      )}
                    >
                      {activeTest === test.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Play className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-2">{test.description}</p>
                  
                  <div className="text-xs text-blue-600 flex items-center mb-2">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    <span className="truncate">{test.defaultUrl}</span>
                  </div>
                  
                  <div className="flex gap-1 flex-wrap">
                    {test.actions.map((action, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs flex items-center">
                        <MousePointer className="h-2 w-2 mr-1" />
                        {action.title}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Painel de URL Personalizada */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Target className="h-5 w-5 text-purple-600" />
              <h4 className="text-lg font-semibold">Teste de URL Personalizada</h4>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customUrl">URL de Destino</Label>
                <Input
                  id="customUrl"
                  value={customTestUrl}
                  onChange={(e) => setCustomTestUrl(e.target.value)}
                  placeholder="https://projeto-rafael-53f73.web.app/custom-page"
                />
              </div>
              
              <Button
                onClick={runCustomUrlTest}
                disabled={loading || !customTestUrl.trim()}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Testando...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Testar URL
                  </>
                )}
              </Button>
              
              {/* Histórico de URLs */}
              {urlHistory.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">URLs Recentes</Label>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {urlHistory.slice(0, 5).map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs cursor-pointer hover:bg-gray-100"
                        onClick={() => setCustomTestUrl(entry.url)}
                      >
                        <div className="truncate flex-1">
                          <span className="font-medium">{entry.testType}</span>
                          <br />
                          <span className="text-gray-600 truncate">{entry.url}</span>
                        </div>
                        <Clock className="h-3 w-3 text-gray-400 ml-2" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Monitor do Service Worker */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Monitor className="h-5 w-5 text-orange-600" />
                <h4 className="text-lg font-semibold">Monitor do Service Worker</h4>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAutoRefresh(!autoRefresh)}
                >
                  <Activity className={cn("h-3 w-3 mr-1", autoRefresh && "animate-pulse")} />
                  Auto
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={checkServiceWorkerStatus}
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            {/* Status do SW */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4 space-y-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="font-medium">Status:</span>
                  <Badge className={cn("ml-2", swStatus.active ? "bg-green-500" : "bg-red-500")}>
                    {swStatus.active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Versão:</span>
                  <span className="ml-2 text-blue-600">{swStatus.version}</span>
                </div>
                <div className="col-span-2">
                  <span className="font-medium">Script:</span>
                  <span className="ml-2 text-gray-600 text-xs break-all">
                    {swStatus.scriptURL || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Logs */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Logs Recentes</Label>
              <div className="max-h-48 overflow-y-auto space-y-1 bg-black rounded-lg p-3 text-xs font-mono">
                {swLogs.slice(0, 10).map((log) => (
                  <div
                    key={log.id}
                    className={cn(
                      "flex items-start space-x-2",
                      log.type === 'error' && "text-red-400",
                      log.type === 'success' && "text-green-400",
                      log.type === 'warning' && "text-yellow-400",
                      log.type === 'info' && "text-blue-400"
                    )}
                  >
                    <span className="text-gray-500">{log.timestamp}</span>
                    <span className="flex-1">{log.message}</span>
                  </div>
                ))}
                {swLogs.length === 0 && (
                  <div className="text-gray-500 text-center py-4">
                    Nenhum log disponível
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resultados dos Testes */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h4 className="text-lg font-semibold">Resultados dos Testes</h4>
            </div>
            
            <div className="max-h-80 overflow-y-auto space-y-3">
              {testResults.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <TestTube className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhum teste executado ainda</p>
                  <p className="text-sm">Execute um teste para ver os resultados aqui</p>
                </div>
              ) : (
                testResults.map((result) => (
                  <div
                    key={result.id}
                    className={cn(
                      "border rounded-lg p-3",
                      result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {result.success ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="font-semibold text-sm">{result.type}</span>
                      </div>
                      <span className="text-xs text-gray-500">{result.timestamp}</span>
                    </div>
                    
                    <div className="text-xs text-gray-600 mb-2 flex items-center">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      <span className="truncate">{result.url}</span>
                    </div>
                    
                    {result.success ? (
                      <div className="text-xs text-green-700">
                        ✅ Notificação enviada com sucesso
                        {result.actions && (
                          <div className="mt-1 flex gap-1 flex-wrap">
                            {result.actions.map((action, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {action.title}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-red-700">
                        ❌ {result.error}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            
            {testResults.length > 0 && (
              <div className="mt-4 pt-3 border-t text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTestResults([])}
                >
                  Limpar Resultados
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdvancedTesting;