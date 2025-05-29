import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquareIcon } from 'lucide-react';

const PendingMessages = ({ userType = 'store' }) => {
  const messages = [
    { id: 1, orderId: 'ORD-1234', sender: userType === 'store' ? 'Cliente A' : 'Loja A', message: 'Olá, gostaria de saber quando meu pedido será enviado?', time: '2h atrás', unread: true },
    { id: 2, orderId: 'ORD-1235', sender: userType === 'store' ? 'Cliente B' : 'Loja B', message: 'Posso alterar o endereço de entrega?', time: '3h atrás', unread: true },
    { id: 3, orderId: 'ORD-1236', sender: userType === 'store' ? 'Cliente C' : 'Loja C', message: 'O produto chegou com um pequeno defeito.', time: '5h atrás', unread: true },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Mensagens Pendentes</CardTitle>
            <CardDescription>
              {userType === 'store' ? 'Mensagens de clientes aguardando resposta' : 'Mensagens das lojas aguardando sua leitura'}
            </CardDescription>
          </div>
          <Badge className="bg-purple-600">3</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="border rounded-lg p-3 hover:bg-zinc-50">
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-purple-100 text-purple-700">
                      {userType === 'store' ? 'CL' : 'LS'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{message.sender}</p>
                    <p className="text-xs text-muted-foreground">Pedido {message.orderId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{message.time}</span>
                  {message.unread && <div className="w-2 h-2 rounded-full bg-purple-600"></div>}
                </div>
              </div>
              <p className="text-sm line-clamp-2 mt-1">{message.message}</p>
              <div className="mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-purple-600 border-purple-200 hover:bg-purple-50 w-full"
                  asChild
                >
                  <a href={`/${userType}/chat/${message.orderId}`}>
                    <MessageSquareIcon className="h-4 w-4 mr-1" />
                    Responder
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" asChild>
          <a href={`/${userType === 'store' ? 'store/chats' : 'customer/chat'}`}>Ver Todas as Mensagens</a>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PendingMessages;