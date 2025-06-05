const axios = require('axios');

/**
 * Criar pedido de teste para o novo produto "new product"
 * URL: https://us-central1-projeto-rafael-53f73.cloudfunctions.net/webhookReceiver?productId=cLRTKrc5MjLRJ9726yry&storeId=ShZW0VNYKMV6MypTwGhJr96Omrh1
 */
async function createTestOrderForNewProduct() {
  console.log("🎯 === CRIANDO PEDIDO PARA O NOVO PRODUTO ===\n");
  
  const WEBHOOK_URL = "https://us-central1-projeto-rafael-53f73.cloudfunctions.net/webhookReceiver?productId=cLRTKrc5MjLRJ9726yry&storeId=ShZW0VNYKMV6MypTwGhJr96Omrh1";
  
  // Payload do CartPanda para o novo produto
  const cartPandaPayload = {
    event: "order.paid",
    order: {
      id: Date.now(), // ID único baseado no timestamp
      number: `NP-${Date.now()}`,
      order_number: `NEWPROD-${Date.now()}`,
      email: "cliente.newproduct@gmail.com", // 📧 Email do cliente
      
      // Dados do cliente
      customer: {
        first_name: "Carlos",
        last_name: "Silva Testador", 
        phone: "+55 11 98765-4321",
        email: "cliente.newproduct@gmail.com"
      },
      
      // Endereço de entrega
      address: {
        address1: "Av. Paulista, 1000",
        address2: "Sala 123", 
        neighborhood: "Bela Vista",
        city: "São Paulo",
        province: "SP",
        state: "São Paulo",
        zip: "01310-100",
        country: "Brasil"
      },
      
      // Produto sendo comprado
      line_items: [
        {
          title: "New Product - Produto de Teste",
          sku: "NEWPROD-001",
          quantity: 1,
          price: 149.90
        }
      ],
      
      // Dados de pagamento
      payment_type: "PIX",
      total_price: 149.90,
      currency: "BRL",
      
      // Timestamps
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  };
  
  console.log("📋 === DADOS DO PEDIDO ===");
  console.log(`👤 Cliente: ${cartPandaPayload.order.customer.first_name} ${cartPandaPayload.order.customer.last_name}`);
  console.log(`📧 Email: ${cartPandaPayload.order.email}`);
  console.log(`📱 Telefone: ${cartPandaPayload.order.customer.phone}`);
  console.log(`🏠 Endereço: ${cartPandaPayload.order.address.address1}, ${cartPandaPayload.order.address.city}-${cartPandaPayload.order.address.province}`);
  console.log(`💰 Valor: R$ ${cartPandaPayload.order.total_price}`);
  console.log(`🛒 Produto: ${cartPandaPayload.order.line_items[0].title}`);
  console.log(`🆔 ID Externo: ${cartPandaPayload.order.id}`);
  
  console.log("\n🎯 === WEBHOOK TARGET ===");
  console.log(`🔗 URL: ${WEBHOOK_URL}`);
  console.log(`📦 Product ID: cLRTKrc5MjLRJ9726yry`);
  console.log(`🏪 Store ID: ShZW0VNYKMV6MypTwGhJr96Omrh1`);
  
  try {
    console.log("\n🚀 Enviando webhook para criar pedido...");
    
    const response = await axios.post(WEBHOOK_URL, cartPandaPayload, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'CartPanda-Webhook/1.0',
        'X-Webhook-Event': 'order.paid'
      },
      timeout: 30000 // 30 segundos
    });
    
    console.log("\n✅ === PEDIDO CRIADO COM SUCESSO! ===");
    console.log("📋 Resposta completa:", JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      console.log("\n🎉 === DETALHES DO NOVO PEDIDO ===");
      console.log(`🆔 ID do Pedido: ${response.data.orderId}`);
      console.log(`🛒 Número Externo: ${response.data.externalOrderId}`);
      console.log(`👤 Cliente: ${response.data.customerEmail}`);
      console.log(`📦 Produto: ${response.data.productTitle}`);
      console.log(`📈 Progresso Inicial: ${response.data.progress}%`);
      console.log(`⚙️ Etapas Agendadas: ${response.data.customStepsScheduled}`);
      
      console.log("\n🔄 === AGORA O SISTEMA DEVE FUNCIONAR ===");
      console.log("✅ Etapas foram criadas com durações relativas");
      console.log("✅ Datas calculadas baseadas no momento atual");
      console.log("✅ Timeline automática ativada");
      console.log("✅ Scheduler vai verificar a cada 5 minutos");
      
      console.log("\n📱 === COMO ACOMPANHAR ===");
      
      console.log("\n🏪 LOJISTA:");
      console.log("   1. Dashboard → Pedidos");
      console.log("   2. Procurar pedido mais recente");
      console.log("   3. Verificar se progresso avança automaticamente");
      
      console.log("\n👤 CLIENTE (cliente.newproduct@gmail.com):");
      console.log("   1. Área do cliente → Digite o email");
      console.log("   2. Ver timeline de progresso");
      console.log("   3. Acompanhar avanço automático");
      
      console.log("\n⏰ CRONOGRAMA ESPERADO:");
      console.log("   📊 Primeira etapa deve completar automaticamente em alguns minutos");
      console.log("   🔔 Cliente verá progresso atualizar na timeline");
      console.log("   📈 Porcentagem vai de 50% para 100% quando completar");
      
      console.log("\n🧪 TESTE A CORREÇÃO:");
      console.log("   ⏱️ Aguarde ~5-10 minutos");
      console.log("   🔄 Refresh na área do cliente ou dashboard");
      console.log("   ✅ Verifique se o progresso avançou automaticamente");
    }
    
  } catch (error) {
    console.error("\n❌ === ERRO AO CRIAR PEDIDO ===");
    
    if (error.response) {
      console.error("📋 Status HTTP:", error.response.status);
      console.error("📋 Dados de erro:", JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error("📋 Request enviado mas sem resposta:", error.message);
    } else {
      console.error("📋 Erro de configuração:", error.message);
    }
    
    console.log("\n🔧 === TROUBLESHOOTING ===");
    console.log("1. ✅ Verificar se a API está online");
    console.log("2. ✅ Verificar se o produto existe");
    console.log("3. ✅ Ver logs do Firebase Functions");
  }
}

// Executar criação do pedido
createTestOrderForNewProduct().then(() => {
  console.log("\n🏁 === TESTE DA CORREÇÃO FINALIZADO ===");
  console.log("✅ Pedido enviado para o novo produto!");
  console.log("⏰ Aguarde alguns minutos e verifique se o tracking funciona automaticamente");
  process.exit(0);
}).catch(error => {
  console.error("\n💥 === ERRO FATAL ===", error);
  process.exit(1);
});
