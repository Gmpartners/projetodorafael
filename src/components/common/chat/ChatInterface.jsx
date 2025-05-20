import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ChatMessageList from "@/components/common/chat/ChatMessageList";
import ChatAttachmentUploader from "@/components/common/chat/ChatAttachmentUploader";
import ChatNotificationHandler from "@/components/common/chat/ChatNotificationHandler";
import QuickResponsePanel from "@/components/store/chat/QuickResponsePanel";
import { 
  Send, 
  PaperclipIcon, 
  Smile, 
  UserCircle,
  Package
} from 'lucide-react';

// Componente principal de chat
const ChatInterface = ({ 
  orderId, 
  userType = 'store', 
  initialMessages = [],
  customerInfo = {},
  orderInfo = {}
}) => {
  const [messages, setMessages] = useState(initialMessages);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showAttachmentUploader, setShowAttachmentUploader] = useState(false);
  const textareaRef = useRef(null);

  // Simulação de carregamento de mensagens iniciais
  useEffect(() => {
    // Este é apenas um exemplo - na implementação real, você carregaria mensagens da API
    if (initialMessages.length === 0) {
      const mockMessages = [
        {
          id: '1',
          text: 'Olá! Gostaria de saber o status do meu pedido.',
          sender: {
            id: 'customer-1',
            name: 'Cliente Exemplo',
            avatar: 'https://i.pravatar.cc/150?u=customer1',
            isStore: false
          },
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 dia atrás
          read: true
        },
        {
          id: '2',
          text: 'Olá! Seu pedido está em processamento. Deve ser enviado em até 2 dias úteis.',
          sender: {
            id: 'store-1',
            name: 'Loja Exemplo',
            avatar: 'https://i.pravatar.cc/150?u=store1',
            isStore: true
          },
          timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000), // 23 horas atrás
          read: true
        },
        {
          id: '3',
          text: 'Obrigado pela informação! Vou aguardar.',
          sender: {
            id: 'customer-1',
            name: 'Cliente Exemplo',
            avatar: 'https://i.pravatar.cc/150?u=customer1',
            isStore: false
          },
          timestamp: new Date(Date.now() - 22 * 60 * 60 * 1000), // 22 horas atrás
          read: true
        }
      ];
      
      setMessages(mockMessages);
    }
  }, [initialMessages]);

  // Focar no textarea quando o componente montar
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);
  
  // Ajustar altura do textarea conforme o conteúdo
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [messageText]);
  
  // Enviar mensagem
  const handleSendMessage = async () => {
    if ((!messageText.trim() && !selectedFile) || isSending) return;
    
    setIsSending(true);
    
    // Criar objeto de mensagem
    const newMessage = {
      id: `msg-${Date.now()}`,
      text: messageText.trim(),
      sender: {
        id: userType === 'store' ? 'store-1' : 'customer-1',
        name: userType === 'store' ? 'Loja Exemplo' : 'Cliente Exemplo',
        avatar: userType === 'store' ? 'https://i.pravatar.cc/150?u=store1' : 'https://i.pravatar.cc/150?u=customer1',
        isStore: userType === 'store'
      },
      timestamp: new Date(),
      read: false
    };
    
    // Adicionar anexo, se houver
    if (selectedFile) {
      newMessage.attachment = selectedFile;
    }
    
    // Na implementação real, enviaríamos para o servidor
    // await api.sendMessage(orderId, newMessage);
    
    // Simular latência de rede
    setTimeout(() => {
      // Adicionar mensagem à lista
      setMessages(prev => [...prev, newMessage]);
      
      // Limpar campos
      setMessageText('');
      setSelectedFile(null);
      setShowAttachmentUploader(false);
      setIsSending(false);
      
      // Focar no textarea
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
      
      // Simular resposta automática (apenas para demo)
      if (userType === 'customer') {
        simulateStoreResponse();
      }
    }, 500);
  };
  
  // Simular resposta da loja (apenas para demonstração)
  const simulateStoreResponse = () => {
    setTimeout(() => {
      const storeResponse = {
        id: `msg-${Date.now()}`,
        text: 'Obrigado por sua mensagem! Um atendente irá responder em breve.',
        sender: {
          id: 'store-1',
          name: 'Loja Exemplo',
          avatar: 'https://i.pravatar.cc/150?u=store1',
          isStore: true
        },
        timestamp: new Date(),
        read: false
      };
      
      setMessages(prev => [...prev, storeResponse]);
    }, 2000);
  };
  
  // Lidar com anexos
  const handleFileSelect = (fileData) => {
    setSelectedFile(fileData);
  };
  
  // Lidar com seleção de resposta rápida
  const handleSelectQuickResponse = (text) => {
    setMessageText(prev => {
      // Se já tem texto, adicionar quebra de linha antes da resposta
      if (prev.trim()) {
        return `${prev}\n\n${text}`;
      }
      return text;
    });
    
    // Focar no textarea
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };
  
  // Lidar com tecla Enter (enviar mensagem)
  const handleKeyDown = (e) => {
    // Enviar mensagem com Enter (sem Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] rounded-lg overflow-hidden border bg-white">
      {/* Cabeçalho do chat */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 mr-3">
            {userType === 'store' ? (
              <>
                <AvatarImage src={customerInfo.avatar || 'https://i.pravatar.cc/150?u=customer1'} />
                <AvatarFallback className="bg-purple-100 text-purple-700">
                  {customerInfo.initials || 'CL'}
                </AvatarFallback>
              </>
            ) : (
              <>
                <AvatarImage src={'https://i.pravatar.cc/150?u=store1'} />
                <AvatarFallback className="bg-blue-100 text-blue-700">
                  LJ
                </AvatarFallback>
              </>
            )}
          </Avatar>
          
          <div>
            <h3 className="font-medium">
              {userType === 'store' 
                ? customerInfo.name || 'Cliente'
                : 'Suporte da Loja'}
            </h3>
            <div className="flex items-center text-xs text-zinc-500">
              <Package className="h-3 w-3 mr-1" />
              <span>Pedido #{orderId || '12345'}</span>
              <Badge className="ml-2 text-[10px] h-4 bg-green-100 text-green-700 hover:bg-green-200">
                {orderInfo.status || 'Em processamento'}
              </Badge>
            </div>
          </div>
        </div>
        
        <ChatNotificationHandler 
          orderId={orderId} 
          userType={userType}
        />
      </div>
      
      {/* Corpo do chat */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Lista de mensagens */}
          <div className="flex-1 overflow-y-auto bg-zinc-50">
            <ChatMessageList 
              messages={messages}
              currentUser={{
                id: userType === 'store' ? 'store-1' : 'customer-1'
              }}
            />
          </div>
          
          {/* Área de digitação */}
          <div className="border-t p-4 bg-white">
            {/* Mostrar prévia do anexo, se selecionado */}
            {selectedFile && (
              <div className="mb-3 p-2 border rounded-md bg-zinc-50 flex items-center justify-between">
                <div className="flex items-center">
                  {selectedFile.preview ? (
                    <img 
                      src={selectedFile.preview} 
                      alt="Preview" 
                      className="w-10 h-10 object-cover rounded-md mr-2"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-zinc-200 rounded-md flex items-center justify-center mr-2">
                      <PaperclipIcon className="h-5 w-5 text-zinc-600" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-zinc-500">
                      {(selectedFile.size / 1024).toFixed(0)} KB
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                  className="text-zinc-500 hover:text-red-600"
                >
                  Remover
                </Button>
              </div>
            )}
            
            {/* Mostrar uploader de anexos quando necessário */}
            {showAttachmentUploader && !selectedFile && (
              <div className="mb-3">
                <ChatAttachmentUploader 
                  onFileSelect={handleFileSelect}
                  disabled={isSending}
                />
              </div>
            )}
            
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  placeholder="Digite sua mensagem..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="min-h-[60px] max-h-[150px] pr-14 pt-4 resize-none"
                  disabled={isSending}
                  rows={1}
                />
                
                <div className="absolute right-3 bottom-3 flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100"
                    onClick={() => setShowAttachmentUploader(prev => !prev)}
                    disabled={isSending}
                  >
                    <PaperclipIcon className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              <Button
                onClick={handleSendMessage}
                disabled={(!messageText.trim() && !selectedFile) || isSending}
                size="icon"
                className="h-10 w-10 rounded-full bg-purple-600 hover:bg-purple-700"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Painel lateral (apenas para loja) */}
        {userType === 'store' && (
          <div className="hidden md:block border-l w-64 bg-white overflow-y-auto">
            <div className="p-4">
              <h3 className="font-medium flex items-center text-sm mb-3">
                <UserCircle className="h-4 w-4 mr-1 text-purple-600" />
                Dados do Cliente
              </h3>
              
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-zinc-500">Nome:</p>
                  <p className="font-medium">{customerInfo.name || 'Cliente Exemplo'}</p>
                </div>
                
                <div>
                  <p className="text-xs text-zinc-500">Email:</p>
                  <p>{customerInfo.email || 'cliente@exemplo.com'}</p>
                </div>
                
                <div>
                  <p className="text-xs text-zinc-500">Telefone:</p>
                  <p>{customerInfo.phone || '(11) 98765-4321'}</p>
                </div>
                
                <div>
                  <p className="text-xs text-zinc-500">Cliente desde:</p>
                  <p>{customerInfo.since || '10/04/2023'}</p>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <h3 className="font-medium flex items-center text-sm mb-3">
                <Package className="h-4 w-4 mr-1 text-purple-600" />
                Detalhes do Pedido
              </h3>
              
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-zinc-500">Número:</p>
                  <p className="font-medium">#{orderId || '12345'}</p>
                </div>
                
                <div>
                  <p className="text-xs text-zinc-500">Data:</p>
                  <p>{orderInfo.date || '12/05/2023'}</p>
                </div>
                
                <div>
                  <p className="text-xs text-zinc-500">Valor:</p>
                  <p className="font-medium">{orderInfo.total || 'R$ 128,90'}</p>
                </div>
                
                <div>
                  <p className="text-xs text-zinc-500">Status:</p>
                  <Badge className="mt-1 bg-green-100 text-green-700 hover:bg-green-200">
                    {orderInfo.status || 'Em processamento'}
                  </Badge>
                </div>
                
                <div>
                  <p className="text-xs text-zinc-500">Produtos:</p>
                  <p>{orderInfo.items || '3 produtos'}</p>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-3"
                asChild
              >
                <a href={`/store/orders/${orderId}`}>Ver detalhes completos</a>
              </Button>
              
              <Separator className="my-4" />
              
              <QuickResponsePanel 
                onSelectResponse={handleSelectQuickResponse} 
                orderId={orderId}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;