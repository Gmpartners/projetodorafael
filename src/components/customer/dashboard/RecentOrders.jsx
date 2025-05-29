import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquareIcon } from 'lucide-react';

const RecentOrders = () => {
  const orders = [
    { id: 'ORD-1234', store: 'Loja A', date: '16/05/2025', total: 'R$ 129,90', status: 'processing', items: 3 },
    { id: 'ORD-1235', store: 'Loja B', date: '15/05/2025', total: 'R$ 79,90', status: 'shipped', items: 1 },
    { id: 'ORD-1236', store: 'Loja C', date: '14/05/2025', total: 'R$ 249,50', status: 'delivered', items: 2 },
  ];

  const getStatusBadge = (status) => {
    switch(status) {
      case 'processing':
        return <Badge className="bg-blue-500">Processando</Badge>;
      case 'shipped':
        return <Badge className="bg-purple-500">Enviado</Badge>;
      case 'delivered':
        return <Badge className="bg-green-500">Entregue</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500">Cancelado</Badge>;
      default:
        return <Badge>Desconhecido</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Seus Pedidos Recentes</CardTitle>
        <CardDescription>Seus últimos pedidos realizados</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="pb-2 text-left font-medium text-sm">Pedido</th>
                <th className="pb-2 text-left font-medium text-sm">Loja</th>
                <th className="pb-2 text-left font-medium text-sm">Data</th>
                <th className="pb-2 text-left font-medium text-sm">Total</th>
                <th className="pb-2 text-left font-medium text-sm">Status</th>
                <th className="pb-2 text-right font-medium text-sm">Ações</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-zinc-50">
                  <td className="py-3 text-sm font-medium">{order.id}</td>
                  <td className="py-3 text-sm">{order.store}</td>
                  <td className="py-3 text-sm">{order.date}</td>
                  <td className="py-3 text-sm">{order.total}</td>
                  <td className="py-3 text-sm">{getStatusBadge(order.status)}</td>
                  <td className="py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        asChild
                      >
                        <a href={`/customer/orders/${order.id}`}>Detalhes</a>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-purple-600 border-purple-200 hover:bg-purple-50"
                        asChild
                      >
                        <a href={`/customer/chat/${order.id}`}>
                          <MessageSquareIcon className="h-4 w-4 mr-1" />
                          Chat
                        </a>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="ghost">Anterior</Button>
        <Button variant="ghost">Próximo</Button>
      </CardFooter>
    </Card>
  );
};

export default RecentOrders;