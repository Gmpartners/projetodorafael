import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  AlertCircleIcon, 
  PackageIcon, 
  TruckIcon, 
  CheckCircleIcon, 
  XCircleIcon 
} from 'lucide-react';

const OrderSummary = ({ userType }) => {
  const orderStatusData = userType === 'store' ? [
    { name: 'Novos', count: 5, color: 'bg-yellow-500', path: '/store/orders/new', icon: <AlertCircleIcon className="h-5 w-5 text-yellow-500" /> },
    { name: 'Processando', count: 3, color: 'bg-blue-500', path: '/store/orders/processing', icon: <PackageIcon className="h-5 w-5 text-blue-500" /> },
    { name: 'Enviados', count: 7, color: 'bg-purple-500', path: '/store/orders/shipped', icon: <TruckIcon className="h-5 w-5 text-purple-500" /> },
    { name: 'Entregues', count: 2, color: 'bg-green-500', path: '/store/orders/delivered', icon: <CheckCircleIcon className="h-5 w-5 text-green-500" /> },
    { name: 'Cancelados', count: 1, color: 'bg-red-500', path: '/store/orders/cancelled', icon: <XCircleIcon className="h-5 w-5 text-red-500" /> },
  ] : [
    { name: 'Em Processamento', count: 1, color: 'bg-blue-500', path: '/customer/orders?status=processing', icon: <PackageIcon className="h-5 w-5 text-blue-500" /> },
    { name: 'Em Trânsito', count: 2, color: 'bg-purple-500', path: '/customer/orders?status=shipped', icon: <TruckIcon className="h-5 w-5 text-purple-500" /> },
    { name: 'Entregues', count: 4, color: 'bg-green-500', path: '/customer/orders?status=delivered', icon: <CheckCircleIcon className="h-5 w-5 text-green-500" /> },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {userType === 'store' ? 'Resumo de Pedidos' : 'Seus Pedidos'}
        </CardTitle>
        <CardDescription>
          {userType === 'store' ? 'Visão geral do status dos pedidos' : 'Status de seus pedidos recentes'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {orderStatusData.map((status, idx) => (
            <Card key={idx} className="hover:shadow-md transition-shadow">
              <a href={status.path} className="no-underline">
                <CardContent className="flex flex-col items-center justify-center p-4 text-center">
                  <div className="rounded-full p-3 bg-zinc-100 mb-3">
                    {status.icon}
                  </div>
                  <div className="text-2xl font-bold">{status.count}</div>
                  <p className="text-sm text-muted-foreground mt-1">{status.name}</p>
                </CardContent>
              </a>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderSummary;