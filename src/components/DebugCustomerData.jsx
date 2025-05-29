// Debug component para testar APIs reais
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { apiService } from '@/services/apiService';

const DebugCustomerData = () => {
  const [debugData, setDebugData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const testRealAPIs = async () => {
    setIsLoading(true);
    console.log('🔍 Testando APIs REAIS do sistema...');
    
    const customerId = 'customer_maria_silva_456';
    const storeId = 'E47OkrK3IcNu1Ys8gD4CA29RrHk2';
    
    try {
      // Testar todas as APIs relevantes
      const [
        customerOrders,
        storeOrders,
        dashboard,
        products
      ] = await Promise.allSettled([
        apiService.getCustomerOrders(customerId),
        apiService.getStoreOrders(storeId),
        apiService.getDashboardOverview(),
        apiService.getStoreProducts()
      ]);

      const results = {
        customerOrders: {
          status: customerOrders.status,
          data: customerOrders.status === 'fulfilled' ? customerOrders.value : customerOrders.reason?.message
        },
        storeOrders: {
          status: storeOrders.status,
          data: storeOrders.status === 'fulfilled' ? storeOrders.value : storeOrders.reason?.message
        },
        dashboard: {
          status: dashboard.status,
          data: dashboard.status === 'fulfilled' ? dashboard.value : dashboard.reason?.message
        },
        products: {
          status: products.status,
          data: products.status === 'fulfilled' ? products.value : products.reason?.message
        }
      };

      console.log('✅ Resultados dos testes:', results);
      setDebugData(results);
      
    } catch (error) {
      console.error('❌ Erro no teste:', error);
      setDebugData({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-100 border rounded">
      <h3 className="font-bold mb-2">🔧 Debug - APIs Reais</h3>
      <Button onClick={testRealAPIs} disabled={isLoading}>
        {isLoading ? 'Testando...' : 'Testar APIs'}
      </Button>
      
      {debugData && (
        <div className="mt-4 text-xs">
          <pre className="bg-black text-green-400 p-2 rounded overflow-auto max-h-96">
            {JSON.stringify(debugData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default DebugCustomerData;