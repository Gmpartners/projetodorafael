import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/common/layout/MainLayout';
import ChatInterface from '@/components/common/chat/ChatInterface';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const ChatPage = ({ userType = 'customer' }) => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [orderInfo, setOrderInfo] = useState(null);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar dados do pedido e do cliente
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // Em uma implementação real, você buscaria esses dados da API
        // const orderResponse = await api.getOrder(orderId);
        // const customerResponse = await api.getCustomer(orderResponse.customerId);
        
        // Simulação - dados mockados
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockOrderInfo = {
          id: orderId || '12345',
          date: '16/05/2025',
          total: 'R$ 129,90',
          status: 'processando',
          items: '3 produtos',
          customer: {
            id: 'customer-1',
            name: 'Cliente Exemplo',
            email: 'cliente@exemplo.com',
            phone: '(11) 98765-4321'
          }
        };
        
        setOrderInfo(mockOrderInfo);
        
        // Dados do cliente (vem do pedido na simulação)
        if (userType === 'store') {
          setCustomerInfo({
            id: mockOrderInfo.customer.id,
            name: mockOrderInfo.customer.name,
            email: mockOrderInfo.customer.email,
            phone: mockOrderInfo.customer.phone,
            avatar: 'https://i.pravatar.cc/150?u=customer1',
            initials: 'CE',
            since: '10/04/2023'
          });
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [orderId, userType]);
  
  // Voltar para a lista de chats ou dashboard
  const handleBack = () => {
    if (userType === 'store') {
      navigate('/store/chats');
    } else {
      navigate('/customer/dashboard');
    }
  };
  
  return (
    <MainLayout userType={userType} pageTitle="Chat">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleBack}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-semibold">
            {userType === 'store' 
              ? `Chat com Cliente - Pedido #${orderId || ''}` 
              : `Suporte - Pedido #${orderId || ''}`}
          </h1>
        </div>
      
        <Separator />
        
        {isLoading ? (
          <div className="h-[calc(100vh-250px)] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <ChatInterface 
            orderId={orderInfo?.id}
            userType={userType}
            customerInfo={customerInfo}
            orderInfo={orderInfo}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default ChatPage;