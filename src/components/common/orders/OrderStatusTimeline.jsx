import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { CheckCircleIcon, ClockIcon, PackageIcon, TruckIcon, XCircleIcon } from "lucide-react";

const OrderStatusTimeline = ({ status, events }) => {
  const defaultEvents = [
    { 
      status: 'ordered', 
      label: 'Pedido Realizado', 
      date: '12/05/2025', 
      time: '14:30',
      icon: <ClockIcon className="h-4 w-4" />,
      isCompleted: true
    },
    { 
      status: 'processing', 
      label: 'Em Processamento', 
      date: '13/05/2025', 
      time: '10:15',
      icon: <PackageIcon className="h-4 w-4" />,
      isCompleted: status !== 'ordered'
    },
    { 
      status: 'shipped', 
      label: 'Enviado', 
      date: '14/05/2025', 
      time: '16:45',
      icon: <TruckIcon className="h-4 w-4" />,
      isCompleted: ['shipped', 'delivered', 'completed'].includes(status)
    },
    { 
      status: 'delivered', 
      label: 'Entregue', 
      date: '16/05/2025', 
      time: '13:20',
      icon: <CheckCircleIcon className="h-4 w-4" />,
      isCompleted: ['delivered', 'completed'].includes(status)
    }
  ];

  const statusEvents = events || defaultEvents;
  
  const getStatusClass = (isCompleted, isCurrent) => {
    if (status === 'cancelled') {
      return 'order-timeline-item cancelled';
    }
    
    if (isCompleted) {
      return 'order-timeline-item completed';
    }
    
    if (isCurrent) {
      return 'order-timeline-item current';
    }
    
    return 'order-timeline-item';
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Status do Pedido</h3>
      </CardHeader>
      <CardContent>
        <div className="order-timeline">
          {statusEvents.map((event, index) => {
            const isCurrent = !event.isCompleted && 
              (index === 0 || statusEvents[index - 1].isCompleted);
              
            return (
              <div 
                key={event.status} 
                className={getStatusClass(event.isCompleted, isCurrent)}
              >
                <div className="flex items-start">
                  <div className="min-w-28 pr-4">
                    <p className="text-sm font-medium">{event.date}</p>
                    <p className="text-xs text-muted-foreground">{event.time}</p>
                  </div>
                  <div>
                    <div className="flex items-center">
                      <span className="mr-2">
                        {event.icon}
                      </span>
                      <p className="font-medium">{event.label}</p>
                    </div>
                    {event.description && (
                      <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {status === 'cancelled' && (
            <div className="order-timeline-item cancelled">
              <div className="flex items-start">
                <div className="min-w-28 pr-4">
                  <p className="text-sm font-medium">15/05/2025</p>
                  <p className="text-xs text-muted-foreground">09:45</p>
                </div>
                <div>
                  <div className="flex items-center">
                    <span className="mr-2">
                      <XCircleIcon className="h-4 w-4" />
                    </span>
                    <p className="font-medium">Pedido Cancelado</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    O pedido foi cancelado a pedido do cliente.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderStatusTimeline;