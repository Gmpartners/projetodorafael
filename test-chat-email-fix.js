#!/usr/bin/env node

/**
 * 🧪 TESTE RÁPIDO - Chat com Email
 * Script para validar se as correções funcionaram
 */

const axios = require('axios');

const API_BASE = 'https://us-central1-projeto-rafael-53f73.cloudfunctions.net';
const API_KEY = 'dskOp23k49m3fk4';
const TEST_EMAIL = 'maria@gmail.com';
const STORE_ID = 'E47OkrK3IcNu1Ys8gD4CA29RrHk2';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'x-api-key': API_KEY,
    'Content-Type': 'application/json'
  }
});

async function testChatCorrection() {
  console.log('🧪 TESTANDO CORREÇÃO DO CHAT COM EMAIL\n');
  
  try {
    // 1. Buscar pedidos do cliente por email
    console.log(`1️⃣ Buscando pedidos de ${TEST_EMAIL}...`);
    const lookupResponse = await api.get(`/customer/lookup-by-email?email=${encodeURIComponent(TEST_EMAIL)}`);
    
    if (!lookupResponse.data.success || !lookupResponse.data.data.orders?.length) {
      console.log('❌ Nenhum pedido encontrado para o email');
      return;
    }
    
    const orders = lookupResponse.data.data.orders;
    console.log(`✅ Encontrados ${orders.length} pedidos`);
    
    // 2. Pegar o primeiro pedido
    const firstOrder = orders[0];
    const orderId = firstOrder.id;
    console.log(`\n2️⃣ Testando chat para pedido: ${orderId}`);
    
    // 3. Tentar criar/obter chat usando EMAIL como identificação
    console.log(`3️⃣ Criando/obtendo chat com email como identificação...`);
    const chatResponse = await api.get(`/chat/getOrderChat`, {
      params: {
        orderId: orderId,
        customerId: TEST_EMAIL, // ✅ USANDO EMAIL DIRETO
        storeId: STORE_ID
      }
    });
    
    if (chatResponse.data.success && chatResponse.data.data?.id) {
      const chatId = chatResponse.data.data.id;
      console.log(`✅ Chat criado/obtido com sucesso: ${chatId}`);
      
      // 4. Testar envio de mensagem
      console.log(`\n4️⃣ Testando envio de mensagem...`);
      const messageData = {
        text: '🧪 Mensagem de teste - Chat funcionando com email!',
        senderId: TEST_EMAIL, // ✅ USANDO EMAIL COMO SENDER
        senderType: 'customer',
        senderName: 'Teste Cliente'
      };
      
      const messageResponse = await api.post(`/chat/sendMessage?chatId=${chatId}`, messageData);
      
      if (messageResponse.data.success) {
        console.log(`✅ Mensagem enviada com sucesso!`);
        
        // 5. Testar busca de mensagens
        console.log(`\n5️⃣ Testando busca de mensagens...`);
        const messagesResponse = await api.get(`/chat/getChatMessages?chatId=${chatId}`);
        
        if (messagesResponse.data.success) {
          const messages = messagesResponse.data.data || [];
          console.log(`✅ ${messages.length} mensagens encontradas`);
          
          console.log('\n🎉 TESTE CONCLUÍDO COM SUCESSO!');
          console.log('\n📊 RESUMO:');
          console.log(`   ✅ Email identificado: ${TEST_EMAIL}`);
          console.log(`   ✅ Pedidos encontrados: ${orders.length}`);
          console.log(`   ✅ Chat criado: ${chatId}`);
          console.log(`   ✅ Mensagem enviada: OK`);
          console.log(`   ✅ Mensagens buscadas: ${messages.length}`);
          console.log('\n🚀 CHAT ESTÁ FUNCIONANDO 100% COM EMAIL!');
        } else {
          console.log('❌ Erro ao buscar mensagens');
        }
      } else {
        console.log('❌ Erro ao enviar mensagem');
      }
    } else {
      console.log('❌ Erro ao criar/obter chat');
      console.log('Resposta:', chatResponse.data);
    }
    
  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:');
    if (error.response?.data) {
      console.error('Detalhes:', error.response.data);
    } else {
      console.error('Erro:', error.message);
    }
  }
}

// Executar teste
testChatCorrection();