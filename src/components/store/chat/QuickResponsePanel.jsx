import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger, 
  DialogClose 
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Plus, Edit, Trash2, MessageSquare } from 'lucide-react';

// Respostas rápidas predefinidas por categoria
const defaultResponses = {
  'pedidos': [
    { id: 'p1', title: 'Status do pedido', text: 'Olá! Seu pedido está atualmente na etapa de [status]. Previsão de entrega para [data].' },
    { id: 'p2', title: 'Confirmação de envio', text: 'Ótimas notícias! Seu pedido foi enviado hoje. O código de rastreio é [código]. Você pode acompanhar pelo link: [link].' },
    { id: 'p3', title: 'Atraso na entrega', text: 'Gostaríamos de informar que houve um pequeno atraso no processamento do seu pedido. A nova previsão de entrega é [data]. Pedimos desculpas pelo inconveniente.' }
  ],
  'dúvidas': [
    { id: 'd1', title: 'Formas de pagamento', text: 'Aceitamos as seguintes formas de pagamento: cartões de crédito (Visa, Mastercard, Amex), PIX, boleto bancário e transferência.' },
    { id: 'd2', title: 'Política de devolução', text: 'Nossa política de devolução permite a troca ou reembolso em até 7 dias após o recebimento. O produto deve estar em perfeitas condições, na embalagem original.' },
    { id: 'd3', title: 'Horário de atendimento', text: 'Nosso horário de atendimento é de segunda a sexta, das 8h às 18h, e aos sábados das 9h às 13h.' }
  ],
  'problemas': [
    { id: 'r1', title: 'Produto com defeito', text: 'Lamentamos pelo inconveniente. Por favor, nos envie fotos do produto e do defeito apresentado para que possamos avaliar a situação e providenciar a substituição.' },
    { id: 'r2', title: 'Produto errado', text: 'Pedimos desculpas pelo erro. Vamos providenciar a coleta do produto incorreto e o envio do item correto o mais breve possível, sem custos adicionais.' },
    { id: 'r3', title: 'Atraso significativo', text: 'Lamentamos muito pelo atraso na entrega do seu pedido. Estamos verificando o ocorrido junto à transportadora e informaremos atualizações em breve.' }
  ],
  'agradecimentos': [
    { id: 'a1', title: 'Agradecimento pela compra', text: 'Muito obrigado pela sua compra! Esperamos que tenha uma excelente experiência com nossos produtos. Estamos à disposição para qualquer dúvida futura.' },
    { id: 'a2', title: 'Feedback positivo', text: 'Ficamos muito felizes com seu feedback positivo! É muito gratificante saber que conseguimos atender suas expectativas. Obrigado pela confiança!' },
    { id: 'a3', title: 'Pós-venda', text: 'Olá! Gostaríamos de saber se está tudo bem com seu pedido e se o produto atendeu às suas expectativas. Estamos à disposição para ajudar com qualquer questão.' }
  ]
};

// Componente para criar/editar resposta rápida
const ResponseEditor = ({ 
  response = { title: '', text: '', category: 'pedidos' }, 
  categories, 
  onSave, 
  onCancel 
}) => {
  const [title, setTitle] = useState(response.title);
  const [text, setText] = useState(response.text);
  const [category, setCategory] = useState(response.category);
  
  const handleSave = () => {
    if (!title.trim() || !text.trim()) return;
    
    onSave({
      id: response.id || `new-${Date.now()}`,
      title,
      text,
      category
    });
  };
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="category" className="text-sm font-medium">Categoria</label>
        <select 
          id="category" 
          value={category} 
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-2 border rounded-md bg-white text-zinc-900"
        >
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">Título</label>
        <Input 
          id="title" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          placeholder="Nome da resposta rápida"
          maxLength={60}
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="text" className="text-sm font-medium">Texto</label>
        <textarea 
          id="text" 
          value={text} 
          onChange={(e) => setText(e.target.value)} 
          placeholder="Digite o texto da resposta rápida..."
          className="w-full p-2 h-32 border rounded-md resize-none bg-white text-zinc-900"
        />
        <p className="text-xs text-zinc-500">
          Use [texto] para partes que precisarão ser personalizadas antes do envio.
        </p>
      </div>
      
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={!title.trim() || !text.trim()}>
          Salvar
        </Button>
      </DialogFooter>
    </div>
  );
};

// Componente principal
const QuickResponsePanel = ({ onSelectResponse, orderId }) => {
  // Categorias disponíveis
  const categories = [
    { id: 'pedidos', name: 'Pedidos', icon: <MessageSquare className="h-4 w-4" /> },
    { id: 'dúvidas', name: 'Dúvidas Frequentes', icon: <MessageSquare className="h-4 w-4" /> },
    { id: 'problemas', name: 'Resolução de Problemas', icon: <MessageSquare className="h-4 w-4" /> },
    { id: 'agradecimentos', name: 'Agradecimentos', icon: <MessageSquare className="h-4 w-4" /> }
  ];
  
  // Estado para armazenar as respostas rápidas (inicializadas com as predefinidas)
  const [responses, setResponses] = useState(defaultResponses);
  
  // Estado para busca de respostas
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado do diálogo de edição
  const [editingResponse, setEditingResponse] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Filtrar respostas com base na busca
  const getFilteredResponses = (categoryResponses) => {
    if (!searchTerm) return categoryResponses;
    
    return categoryResponses.filter(response => {
      return (
        response.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        response.text.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  };
  
  // Processar o texto substituindo placeholders
  const processResponseText = (text) => {
    // Personalização baseada no contexto do pedido
    let processedText = text
      .replace('[status]', 'em processamento')
      .replace('[data]', new Date(Date.now() + 3*24*60*60*1000).toLocaleDateString('pt-BR'))
      .replace('[código]', 'BR123456789')
      .replace('[link]', 'https://rastreamento.correios.com.br/');
    
    // Se ainda tem placeholders, destaca-os
    if (processedText.includes('[') && processedText.includes(']')) {
      processedText = processedText.replace(
        /\[(.*?)\]/g, 
        (match) => `<span class="bg-yellow-100 px-1 rounded">${match}</span>`
      );
    }
    
    return processedText;
  };
  
  // Adicionar resposta
  const handleAddResponse = (newResponse) => {
    setResponses(prev => ({
      ...prev,
      [newResponse.category]: [
        ...prev[newResponse.category],
        newResponse
      ]
    }));
    setIsEditDialogOpen(false);
  };
  
  // Atualizar resposta
  const handleUpdateResponse = (updatedResponse) => {
    setResponses(prev => ({
      ...prev,
      [updatedResponse.category]: prev[updatedResponse.category].map(resp => 
        resp.id === updatedResponse.id ? updatedResponse : resp
      )
    }));
    setIsEditDialogOpen(false);
  };
  
  // Excluir resposta
  const handleDeleteResponse = (responseId, category) => {
    setResponses(prev => ({
      ...prev,
      [category]: prev[category].filter(resp => resp.id !== responseId)
    }));
  };
  
  // Selecionar resposta para envio
  const handleSelectResponse = (responseText) => {
    const processedText = processResponseText(responseText);
    onSelectResponse(processedText);
  };
  
  return (
    <div className="rounded-md border overflow-hidden bg-white">
      <Collapsible className="w-full">
        <CollapsibleTrigger className="flex w-full items-center justify-between p-3 text-sm font-medium text-left hover:bg-zinc-50 border-b">
          <div className="flex items-center">
            <MessageSquare className="h-4 w-4 mr-2 text-purple-600" />
            <span>Respostas Rápidas</span>
          </div>
          <ChevronDown className="h-4 w-4 text-zinc-500 shrink-0" />
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="p-3 border-b">
            <Input
              placeholder="Buscar resposta rápida..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          
          <ScrollArea className="h-[300px]">
            <Tabs defaultValue="pedidos" className="w-full">
              <TabsList className="w-full flex justify-start pl-3 pr-3 pt-2">
                {categories.map(category => (
                  <TabsTrigger 
                    key={category.id} 
                    value={category.id}
                    className="text-xs"
                  >
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {categories.map(category => (
                <TabsContent key={category.id} value={category.id} className="p-0 mt-0">
                  <div className="space-y-2 p-3">
                    {getFilteredResponses(responses[category.id] || []).map(response => (
                      <Card key={response.id} className="overflow-hidden">
                        <CardHeader className="p-3 pb-0">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-sm font-medium">
                              {response.title}
                            </CardTitle>
                            <div className="flex space-x-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 hover:bg-zinc-100"
                                onClick={() => {
                                  setEditingResponse(response);
                                  setIsEditDialogOpen(true);
                                }}
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 hover:bg-zinc-100 hover:text-red-600"
                                onClick={() => handleDeleteResponse(response.id, category.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-3 pt-1">
                          <p className="text-xs text-zinc-600 line-clamp-2">
                            {response.text}
                          </p>
                        </CardContent>
                        <CardFooter className="p-2 flex justify-end border-t bg-zinc-50">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 text-xs hover:bg-white"
                            onClick={() => handleSelectResponse(response.text)}
                          >
                            Usar resposta
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                    
                    {getFilteredResponses(responses[category.id] || []).length === 0 && (
                      <p className="text-center text-zinc-500 p-4 text-sm">
                        {searchTerm ? 'Nenhuma resposta encontrada para esta busca.' : 'Nenhuma resposta cadastrada nesta categoria.'}
                      </p>
                    )}
                    
                    {!searchTerm && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full flex items-center justify-center gap-1"
                        onClick={() => {
                          setEditingResponse({ category: category.id, title: '', text: '' });
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Plus className="h-4 w-4" />
                        <span>Nova resposta</span>
                      </Button>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </ScrollArea>
        </CollapsibleContent>
      </Collapsible>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingResponse?.id ? 'Editar resposta rápida' : 'Nova resposta rápida'}
            </DialogTitle>
            <DialogDescription>
              Crie ou edite uma resposta para usar frequentemente em suas conversas.
            </DialogDescription>
          </DialogHeader>
          
          <ResponseEditor 
            response={editingResponse} 
            categories={categories} 
            onSave={editingResponse?.id ? handleUpdateResponse : handleAddResponse}
            onCancel={() => setIsEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuickResponsePanel;