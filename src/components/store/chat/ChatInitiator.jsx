import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  EmptyState 
} from '@/components/ui/premium';
import { 
  FadeInUp, 
  HoverLift, 
  GlassCard 
} from '@/components/ui/animations';
import { 
  MessageSquare, 
  Search, 
  Package, 
  MailQuestion,
  Users,
  Send,
  UserPlus,
  Calendar,
  MapPin,
  ShoppingBag,
  Star,
  CheckCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

const ChatInitiator = ({ onStartChat }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedReason, setSelectedReason] = useState("order-question");
  const [notifyCustomer, setNotifyCustomer] = useState(true);
  const [activeTab, setActiveTab] = useState("orders");
  const [isLoading, setIsLoading] = useState(false);
  
  // Razões de contato simplificadas
  const contactReasons = [
    { 
      id: "order-question", 
      label: "Dúvida sobre pedido",
      icon: "❓"
    },
    { 
      id: "shipping-update", 
      label: "Atualização de entrega",
      icon: "🚚"
    },
    { 
      id: "payment-issue", 
      label: "Problema com pagamento",
      icon: "💳"
    },
    { 
      id: "product-info", 
      label: "Informação sobre produto",
      icon: "📦"
    },
    { 
      id: "complaint", 
      label: "Reclamação",
      icon: "⚠️"
    },
    { 
      id: "other", 
      label: "Outro motivo",
      icon: "💬"
    }
  ];
  
  // Lista simplificada de pedidos
  const recentOrders = [
    { 
      id: "ORD-2024-001", 
      customer: "Ana Silva Costa", 
      email: "ana.silva@email.com",
      date: "16/05/2025", 
      total: 289.90, 
      status: "processando",
      avatar: "https://i.pravatar.cc/150?u=ana"
    },
    { 
      id: "ORD-2024-002", 
      customer: "Carlos Eduardo Santos", 
      email: "carlos.eduardo@email.com",
      date: "15/05/2025", 
      total: 159.90, 
      status: "enviado",
      avatar: "https://i.pravatar.cc/150?u=carlos"
    },
    { 
      id: "ORD-2024-003", 
      customer: "Maria Fernanda Lima", 
      email: "maria.fernanda@email.com",
      date: "14/05/2025", 
      total: 449.50, 
      status: "entregue",
      avatar: "https://i.pravatar.cc/150?u=maria"
    },
    { 
      id: "ORD-2024-004", 
      customer: "Roberto Almeida", 
      email: "roberto.almeida@email.com",
      date: "13/05/2025", 
      total: 89.90, 
      status: "cancelado",
      avatar: "https://i.pravatar.cc/150?u=roberto"
    }
  ];
  
  // Lista simplificada de clientes
  const customers = [
    { 
      id: "CUST-001", 
      name: "Ana Silva Costa", 
      email: "ana.silva@email.com",
      avatar: "https://i.pravatar.cc/150?u=ana",
      orders: 8, 
      lastOrder: "16/05/2025",
      totalSpent: 1250.90,
      isVip: true
    },
    { 
      id: "CUST-002", 
      name: "Carlos Eduardo Santos", 
      email: "carlos.eduardo@email.com",
      avatar: "https://i.pravatar.cc/150?u=carlos",
      orders: 5, 
      lastOrder: "15/05/2025",
      totalSpent: 890.45,
      isVip: false
    },
    { 
      id: "CUST-003", 
      name: "Maria Fernanda Lima", 
      email: "maria.fernanda@email.com",
      avatar: "https://i.pravatar.cc/150?u=maria",
      orders: 12, 
      lastOrder: "14/05/2025",
      totalSpent: 2150.75,
      isVip: true
    }
  ];
  
  // Filtrar dados com base na busca
  const filteredOrders = searchTerm
    ? recentOrders.filter(
        order => 
          order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : recentOrders;
  
  const filteredCustomers = searchTerm
    ? customers.filter(
        customer => 
          customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : customers;
  
  // Status do pedido com badges simples
  const getStatusBadge = (status) => {
    const statusMap = {
      "processando": { label: "Processando", className: "bg-blue-100 text-blue-800" },
      "enviado": { label: "Enviado", className: "bg-purple-100 text-purple-800" },
      "entregue": { label: "Entregue", className: "bg-emerald-100 text-emerald-800" },
      "cancelado": { label: "Cancelado", className: "bg-red-100 text-red-800" }
    };
    
    const statusInfo = statusMap[status] || statusMap["processando"];
    
    return (
      <Badge className={cn("text-xs", statusInfo.className)}>
        {statusInfo.label}
      </Badge>
    );
  };
  
  // Iniciar chat
  const handleStartChat = () => {
    if (!selectedOrder) return;
    
    setIsLoading(true);
    
    // Simular criação do chat
    setTimeout(() => {
      const chatData = {
        orderId: selectedOrder.id,
        customerName: selectedOrder.customer,
        reason: selectedReason,
        notifyCustomer,
        initialMessage: getInitialMessage(selectedReason, selectedOrder.id)
      };
      
      if (onStartChat) {
        onStartChat(chatData);
      }
      
      // Fechar e limpar
      setIsDialogOpen(false);
      setSelectedOrder(null);
      setSelectedReason("order-question");
      setNotifyCustomer(true);
      setSearchTerm("");
      setIsLoading(false);
    }, 1000);
  };
  
  // Gerar mensagem inicial
  const getInitialMessage = (reason, orderId) => {
    const reasonMessages = {
      "order-question": `Olá! Estamos entrando em contato sobre seu pedido ${orderId}. Há alguma dúvida que podemos esclarecer?`,
      "shipping-update": `Olá! Temos uma atualização sobre seu pedido ${orderId}. Seu pacote está sendo preparado para envio.`,
      "payment-issue": `Olá! Identificamos uma questão com o pagamento do seu pedido ${orderId}. Poderia nos ajudar a resolver?`,
      "product-info": `Olá! Sobre o produto do seu pedido ${orderId}, gostaríamos de fornecer informações adicionais.`,
      "complaint": `Olá! Recebemos seu feedback sobre o pedido ${orderId} e queremos resolver da melhor forma possível.`,
      "other": `Olá! Estamos entrando em contato sobre seu pedido ${orderId}.`
    };
    
    return reasonMessages[reason] || reasonMessages["other"];
  };
  
  // Selecionar pedido
  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
  };
  
  // Selecionar cliente
  const handleSelectCustomer = (customer) => {
    const customerOrder = recentOrders.find(order => order.customer === customer.name);
    
    if (customerOrder) {
      setSelectedOrder(customerOrder);
      setActiveTab("orders");
    }
  };
  
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="btn-premium w-full">
          <MessageSquare className="h-4 w-4 mr-2" />
          Iniciar Nova Conversa
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl h-[80vh] bg-white">
        <div className="flex flex-col h-full">
          {/* Header Simplificado */}
          <DialogHeader className="pb-4 border-b">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <MessageSquare className="h-5 w-5 text-purple-700" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-zinc-900">
                  Iniciar Nova Conversa
                </DialogTitle>
                <DialogDescription className="text-zinc-600">
                  Selecione um cliente ou pedido para iniciar o atendimento
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full py-4">
              {/* Left Side - Search & Lists */}
              <div className="lg:col-span-2 flex flex-col">
                {/* Search Simplificado */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input
                    className="pl-10 border-zinc-200 focus:border-purple-300"
                    placeholder="Buscar por cliente, pedido ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                {/* Tabs Simplificadas */}
                <div className="flex-1 overflow-hidden">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="w-full bg-zinc-100 mb-4">
                      <TabsTrigger value="orders" className="flex-1">
                        <Package className="h-4 w-4 mr-2" />
                        Pedidos
                      </TabsTrigger>
                      <TabsTrigger value="customers" className="flex-1">
                        <Users className="h-4 w-4 mr-2" />
                        Clientes
                      </TabsTrigger>
                    </TabsList>
                    
                    {/* Tab: Orders */}
                    <TabsContent value="orders" className="flex-1 m-0">
                      <ScrollArea className="h-[300px]">
                        {filteredOrders.length > 0 ? (
                          <div className="space-y-2">
                            {filteredOrders.map((order) => (
                              <div 
                                key={order.id}
                                className={cn(
                                  "p-3 border rounded-lg cursor-pointer transition-all",
                                  selectedOrder?.id === order.id 
                                    ? 'border-purple-300 bg-purple-50' 
                                    : 'border-zinc-200 hover:border-purple-200 hover:bg-purple-50/30'
                                )}
                                onClick={() => handleSelectOrder(order)}
                              >
                                <div className="flex items-center space-x-3">
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage src={order.avatar} />
                                    <AvatarFallback className="bg-purple-100 text-purple-700">
                                      {order.customer.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  
                                  <div className="flex-1">
                                    <h4 className="font-medium text-zinc-900">{order.customer}</h4>
                                    <div className="flex items-center space-x-2 mt-1">
                                      <Badge variant="outline" className="text-xs">{order.id}</Badge>
                                      {getStatusBadge(order.status)}
                                    </div>
                                  </div>
                                  
                                  <div className="text-right">
                                    <p className="font-medium text-zinc-900">
                                      R$ {order.total.toFixed(2).replace('.', ',')}
                                    </p>
                                    <p className="text-xs text-zinc-500">{order.date}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <EmptyState
                            icon={Package}
                            title="Nenhum pedido encontrado"
                            description="Tente outro termo de busca"
                            variant="default"
                          />
                        )}
                      </ScrollArea>
                    </TabsContent>
                    
                    {/* Tab: Customers */}
                    <TabsContent value="customers" className="flex-1 m-0">
                      <ScrollArea className="h-[300px]">
                        {filteredCustomers.length > 0 ? (
                          <div className="space-y-2">
                            {filteredCustomers.map((customer) => (
                              <div 
                                key={customer.id}
                                className="p-3 border border-zinc-200 rounded-lg cursor-pointer transition-all hover:border-purple-200 hover:bg-purple-50/30"
                                onClick={() => handleSelectCustomer(customer)}
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="relative">
                                    <Avatar className="h-10 w-10">
                                      <AvatarImage src={customer.avatar} />
                                      <AvatarFallback className="bg-purple-100 text-purple-700">
                                        {customer.name.split(' ').map(n => n[0]).join('')}
                                      </AvatarFallback>
                                    </Avatar>
                                    {customer.isVip && (
                                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                                        <Star className="h-2 w-2 text-white fill-white" />
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                      <h4 className="font-medium text-zinc-900">{customer.name}</h4>
                                      {customer.isVip && (
                                        <Badge className="bg-yellow-100 text-yellow-800 text-xs">VIP</Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-zinc-600">{customer.email}</p>
                                  </div>
                                  
                                  <div className="text-right">
                                    <p className="text-sm font-medium text-zinc-900">{customer.orders} pedidos</p>
                                    <p className="text-xs text-zinc-500">{customer.lastOrder}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <EmptyState
                            icon={Users}
                            title="Nenhum cliente encontrado"
                            description="Tente outro termo de busca"
                            variant="default"
                          />
                        )}
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
              
              {/* Right Side - Configuration */}
              <div className="lg:col-span-1">
                {selectedOrder ? (
                  <div className="space-y-4">
                    {/* Selected Order Info */}
                    <div className="p-4 border border-emerald-200 rounded-lg bg-emerald-50">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                        <div>
                          <h4 className="font-medium text-emerald-900">Cliente Selecionado</h4>
                          <p className="text-sm text-emerald-700">{selectedOrder.customer}</p>
                          <p className="text-xs text-emerald-600">{selectedOrder.id}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Contact Reason */}
                    <div>
                      <Label className="text-sm font-medium text-zinc-900 mb-3 block">Motivo do Contato</Label>
                      <RadioGroup 
                        value={selectedReason} 
                        onValueChange={setSelectedReason}
                        className="space-y-2"
                      >
                        {contactReasons.map((reason) => (
                          <div key={reason.id} className="flex items-center space-x-3">
                            <RadioGroupItem value={reason.id} id={reason.id} />
                            <Label htmlFor={reason.id} className="flex-1 cursor-pointer">
                              <span className="mr-2">{reason.icon}</span>
                              {reason.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                    
                    {/* Notification Options */}
                    <div className="flex items-center space-x-3 p-3 border rounded-lg bg-zinc-50">
                      <Checkbox 
                        id="notify-customer" 
                        checked={notifyCustomer} 
                        onCheckedChange={setNotifyCustomer}
                      />
                      <Label htmlFor="notify-customer" className="flex-1 cursor-pointer text-sm">
                        Notificar cliente por email
                      </Label>
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    icon={UserPlus}
                    title="Selecione um Cliente"
                    description="Escolha um pedido ou cliente para configurar o contato"
                    variant="primary"
                  />
                )}
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <DialogFooter className="border-t pt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
            >
              Cancelar
            </Button>
            
            <Button 
              onClick={handleStartChat}
              disabled={!selectedOrder || isLoading}
              className="btn-premium"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Iniciando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Iniciar Conversa
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatInitiator;